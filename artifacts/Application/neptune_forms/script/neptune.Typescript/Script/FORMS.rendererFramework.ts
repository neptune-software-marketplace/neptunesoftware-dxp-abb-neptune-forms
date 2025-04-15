// ADD begin
// INFO: {
//     user: "paulo.reis.rosa", 
//     reason: "Viking merge", 
//     purpose: "set utilities to be used inside of FORMS"
//     seealso: "Custom component neptune_formsdeclare, for types declaration"
// }
namespace FORMS {
    export const NAMESPACE:TyGrowableConstant<string> = {
        NEPTUNE: "neptune"
    }
    export const RENDERER:TyGrowableConstant<string> = {
        STANDARD: "standard"
    }

    type SubscribedRendererItem = Map<string, FormRenderer>;
    let rendererFramework = {
        subscribed: new Map<string, FormRenderer>(),
        repository: new Map<string, object>(),
        selected: null,
        onLoadFullfilled: null,
        onLoad: null 
    }
    rendererFramework.onLoad = new Promise(resolve=>rendererFramework.onLoadFullfilled = resolve);

    export interface IfRendererBase {
        getSubscribed(): FormRenderer[],
        clearAllStyles: (uiElement: sap.ui.core.Element) => void,
        clearAllRepositories: () => void,
        getDefault: () => FormRenderer,
        getInstance: (nameSpace:string, rendererName:string) => FormRenderer,
        determineRenderer: (options:any) => void,
        [k:string]: any
    }
    export const Renderer: IfRendererBase = {
        createId:(nameSpace:string, displayType:string) => `${displayType}@${nameSpace}`,
        subscribe: (renderer:FormRenderer) => {
            let {nameSpace,displayType} = renderer;
            rendererFramework.subscribed.set(Renderer.createId(nameSpace,displayType), renderer);
        },
        getSubscribed: () => safeClone(rendererFramework.subscribed.values()),
        clearAllStyles: (uiElement) => {
            for (let rendererInstance of rendererFramework.subscribed.values()) {
                rendererInstance.action.clearStyles( uiElement );
            }
        },
        clearAllRepositories: () => { rendererFramework.repository = new Map<string, object>(); },
        setStyles: (uiElement) => {
            rendererFramework.selected?.action?.setStyles && rendererFramework.selected.action.setStyles(uiElement)
        },
        getDefault: () => Renderer.getInstance(FORMS.NAMESPACE.NEPTUNE, FORMS.RENDERER.STANDARD),
        getInstanceById: (instanceId: string) => {
            if (!instanceId) {return null;}
            let parts = instanceId.split("--");
            if (!(Array.isArray(parts) && (parts.length===2))) { return null; }
            return FORMS.Renderer.getInstance(parts[0], parts[1]);
        },
        getInstance: (nameSpace, rendererName) => {
            return safeClone(rendererFramework.subscribed.get(Renderer.createId(nameSpace,rendererName)));
        },
        getRepository: (renderer: FormRenderer) => {
            let rendererId = Renderer.createId(renderer.nameSpace,renderer.displayType);
            let repository = rendererFramework.repository.get(rendererId);
            if (!repository) {
                repository = {};
                rendererFramework.repository.set(rendererId, repository);
            }
            return repository;
        },
        setupObjectsAndEvents: (parent: sap.ui.core.Element, repository:TyRendererRepository) => {
            let selectedRenderer = FORMS.Renderer.selected();
            selectedRenderer.action.prepareData(repository.options, repository);
            selectedRenderer.action.buildObjectsAndEvents(parent, repository.options, repository);
        },
        traverseSections: (repository:TyRendererRepository) => {
            let selectedRenderer = FORMS.Renderer.selected();
            // @ts-ignore
            repository.options.config.setup.forEach((section, index) => {
                selectedRenderer.action.processSection(section, index, repository, selectedRenderer);
            });
        },
        determineRenderer: (options: any) => {
            delete rendererFramework.selected;
            for (let renderer of rendererFramework.subscribed.values()) {
                if (renderer.nameSpace === FORMS.NAMESPACE.NEPTUNE
                    &&
                    renderer.displayType === FORMS.RENDERER.STANDARD) {
                    continue; // This is the default renderer, and will only apply if all others fail
                }
                if (renderer.action.foundMatchingData(options, renderer)) {
                    rendererFramework.selected = renderer;
                    break;
                }
            }
            if (!rendererFramework.selected) {
                rendererFramework.selected = Renderer.getDefault();
            }
            let repository = FORMS.Renderer.getRepository(rendererFramework.selected);
            repository.options = options;
            repository.renderer = rendererFramework.selected;
            return rendererFramework.selected;
        },
        selected: () => rendererFramework.selected,
        executeFirstRendering: (repository:TyRendererRepository) => {
            let selectedRenderer = FORMS.Renderer.selected();
            selectedRenderer.action.executeFirstRendering(repository, selectedRenderer);
        },
        onLoad: () => rendererFramework.onLoad,
        resolveLoaded: () => rendererFramework.onLoadFullfilled(true)
    }

}

apiGetAllRenderers({parameters: {onlyActive: true}}).then(result => {
    console.log("FORMS: read all renderers");
    let loadPromises = [];
    let now = new Date();
    for (let rendererInfo of result) {
        if (rendererInfo.appType === "application") {
            let resolved:any;
            loadPromises.push(new Promise(ok => {resolved=ok;}));
            // @ts-ignore
            AppCache.Load(rendererInfo.appName, {
                load: "init",
                startParams:{
                    FORMS,
                    rendererInfo,
                    onLoad: () => resolved(true)
                },
                appGUID: `${rendererInfo.appName}.${now.getTime()}`
            });
        }
    }
    Promise.allSettled(loadPromises).then(()=>FORMS.Renderer.resolveLoaded());
})
// ADD end
