// ADD begin
// INFO: {
//     user: "paulo.reis.rosa",
//     reason: "Viking merge",
//     purpose: "set utilities to be used inside of FORMS"
//     seealso: "Custom component neptune_formsdeclare, for types declaration"
// }
namespace FORMS {
    export const NAMESPACE: TyGrowableConstant<string> = {
        NEPTUNE: "neptune",
    };
    export const RENDERER: TyGrowableConstant<string> = {
        STANDARD: "standard",
    };

    type SubscribedRendererItem = Map<string, FormRenderer>;
    let rendererFramework = {
        subscribed: new Map<string, FormRenderer>(),
        repository: new Map<string, object>(),
        selected: null,
        onLoadFullfilled: null,
        onLoad: null,
    };
    rendererFramework.onLoad = new Promise((resolve) => (rendererFramework.onLoadFullfilled = resolve));

    export interface IfRendererBase {
        getSubscribed(): FormRenderer[];
        clearAllStyles: (uiElement: sap.ui.core.Element) => void;
        clearAllRepositories: () => void;
        getDefault: () => FormRenderer;
        getInstance: (nameSpace: string, rendererName: string) => FormRenderer;
        determineRenderer: (options: any) => void;
        [k: string]: any;
    }
    export const Renderer: IfRendererBase = {
        createId: (nameSpace: string, displayType: string) => `${displayType}@${nameSpace}`,
        subscribe: (renderer: FormRenderer) => {
            let { nameSpace, displayType } = renderer;
            rendererFramework.subscribed.set(Renderer.createId(nameSpace, displayType), renderer);
        },
        getSubscribed: () => safeClone(rendererFramework.subscribed.values()),
        clearAllStyles: (uiElement) => {
            for (let rendererInstance of rendererFramework.subscribed.values()) {
                rendererInstance.action.clearStyles(uiElement);
            }
        },
        clearAllRepositories: () => {
            rendererFramework.repository = new Map<string, object>();
        },
        setStyles: (uiElement) => {
            rendererFramework.selected?.action?.setStyles && rendererFramework.selected.action.setStyles(uiElement);
        },
        getDefault: () => Renderer.getInstance(FORMS.NAMESPACE.NEPTUNE, FORMS.RENDERER.STANDARD),
        getInstanceById: (instanceId: string) => {
            if (!instanceId) {
                return null;
            }
            let parts = instanceId.split("--");
            if (!(Array.isArray(parts) && parts.length === 2)) {
                return null;
            }
            return FORMS.Renderer.getInstance(parts[0], parts[1]);
        },
        getInstance: (nameSpace, rendererName) => {
            return safeClone(rendererFramework.subscribed.get(Renderer.createId(nameSpace, rendererName)));
        },
        getRepository: (renderer: FormRenderer) => {
            let rendererId = Renderer.createId(renderer.nameSpace, renderer.displayType);
            let repository = rendererFramework.repository.get(rendererId);
            if (!repository) {
                repository = {};
                rendererFramework.repository.set(rendererId, repository);
            }
            return repository;
        },
        setupObjectsAndEvents: (parent: sap.ui.core.Element, repository: TyRendererRepository) => {
            let selectedRenderer = FORMS.Renderer.selected();
            selectedRenderer.action.prepareData(repository.options, repository);
            selectedRenderer.action.buildObjectsAndEvents(parent, repository.options, repository);
        },
        traverseSections: (repository: TyRendererRepository) => {
            let selectedRenderer = FORMS.Renderer.selected();
            // @ts-ignore
            repository.options.config.setup.forEach((section, index) => {
                selectedRenderer.action.processSection(section, index, repository, selectedRenderer);
            });
        },
        // determineRenderer: (options: any) => {
        //     delete rendererFramework.selected;
        //     for (let renderer of rendererFramework.subscribed.values()) {
        //         if (renderer.nameSpace === FORMS.NAMESPACE.NEPTUNE
        //             &&
        //             renderer.displayType === FORMS.RENDERER.STANDARD) {
        //             continue; // This is the default renderer, and will only apply if all others fail
        //         }
        //         if (renderer.action.foundMatchingData(options, renderer)) {
        //             rendererFramework.selected = renderer;
        //             break;
        //         }
        //     }
        //     if (!rendererFramework.selected) {
        //         rendererFramework.selected = Renderer.getDefault();
        //     }
        //     let repository = FORMS.Renderer.getRepository(rendererFramework.selected);
        //     repository.options = options;
        //     repository.renderer = rendererFramework.selected;
        //     return rendererFramework.selected;
        // },
        determineRenderer: (options: any) => {
            let resolvedOptions: any;

            if (typeof options === "string") {
                console.warn("determineRenderer received formId instead of options object:", options);
                resolvedOptions = {
                    formId: options,
                    config: { setup: [] }, // safe default
                    data: {},
                };
            }
            else if (options && typeof options === "object") {
                resolvedOptions = {
                    ...options,
                    config: options.config || { setup: [] },
                    data: options.data || {},
                };
            }
            else {
                console.error("determineRenderer received invalid options:", options);
                resolvedOptions = { config: { setup: [] }, data: {} };
            }

            delete rendererFramework.selected;

            for (let renderer of rendererFramework.subscribed.values()) {
                if (renderer.nameSpace === FORMS.NAMESPACE.NEPTUNE && renderer.displayType === FORMS.RENDERER.STANDARD) {
                    continue; 
                }
                if (renderer.action.foundMatchingData(resolvedOptions, renderer)) {
                    rendererFramework.selected = renderer;
                    break;
                }
            }

            if (!rendererFramework.selected) {
                rendererFramework.selected = Renderer.getDefault();
            }

            let repository = FORMS.Renderer.getRepository(rendererFramework.selected);
            repository.options = resolvedOptions;
            repository.renderer = rendererFramework.selected;

            return rendererFramework.selected;
        },

        selected: () => rendererFramework.selected,
        executeFirstRendering: (repository: TyRendererRepository) => {
            let selectedRenderer = FORMS.Renderer.selected();
            selectedRenderer.action.executeFirstRendering(repository, selectedRenderer);
        },
        onLoad: () => rendererFramework.onLoad,
        resolveLoaded: () => rendererFramework.onLoadFullfilled(true),
    };
}

FORMS.Renderer.subscribe(
    new FormRenderer(
        FORMS.NAMESPACE.NEPTUNE,
        FORMS.RENDERER.STANDARD,
        {}, // rendererInfo,
        i18nLabel.getText(),
        i18nDescription.getText(),
        {
            getData: () => {},
            prepareData: (options, repository) => {},
            bundleRenderedData: () => {},
            applyStyles: (uiElement) => {},
            clearStyles: (uiElement) => {},
            buildObjectsAndEvents: (parent, options, repository) => {},
            getMatchingData: () => {
                return {};
            },
            foundMatchingData: () => true, // The standard renderer is always a match
            processSection: (section, index, repository, selectedRenderer) => {
                if (!section) return;
                if (section.disabled) return;
                let sectionParent;
                switch (section.type) {
                    case "Form":
                        FORMS.bindingPath = "/";
                        sectionParent = FORMS.buildParentForm(FORMS.formParent, section);
                        break;

                    case "Table":
                        FORMS.bindingPath = "";
                        delete section.origMode; // this attribute saves the delete or multiselect mode when the dynamic editability is being set (see fn setFormEditable)
                        sectionParent = FORMS.buildParentTable(FORMS.formParent, section);
                        break;
                }

                // Elements
                section.elements.forEach(function (element, i) {
                    FORMS.buildElement(sectionParent, element, section, i);

                    if (element.elements) {
                        element.elements.forEach(function (subElement, iSub) {
                            if (subElement) {
                                FORMS.buildElement(sectionParent, subElement, section, iSub);
                            }
                        });
                    }
                });

                // Post processing
                let options = repository.options;
                switch (section.type) {
                    case "Table":
                        const tabModel = new sap.ui.model.json.JSONModel();
                        let modelData = [];

                        sectionParent.setModel(tabModel);

                        const bindingField = section.fieldName ? section.fieldName : section.id;
                        if (options.data && options.data[bindingField] && options.data[bindingField].length) {
                            // KW addition (add init. sort value) // 28.11.2023
                            var i: any = 0;
                            for (const bv of options.data[bindingField]) {
                                bv.initsort = ++i;
                            }
                            modelData = options.data[bindingField];
                        } else {
                            let rows = section.rows || 1;

                            for (let i = 0; i < rows; i++) {
                                modelData.push(FORMS.buildRowTemplate(section.elements));
                            }
                        }

                        // Row Number
                        if (section.enableRowNumber) FORMS.tableAddRowNumber(modelData);

                        // Pagination
                        if (section.enablePagination) {
                            FORMS.paginationSetup[section.id] = {
                                take: section.paginationTake || 2,
                                index: 0,
                                count: 0,
                                filter: "",
                                sortOrder: "Ascending",
                                sortField: "",
                                data: modelData,
                            };

                            FORMS.paginationHandle(section);
                        } else {
                            tabModel.setData(modelData);
                        }

                        sectionParent.bindAggregation("items", { path: "/", template: FORMS.columnTemplate, templateShareable: false });
                        // AR Table post processing // #18 KM
                        FORMS.tablePostProcessing(section, 0, section.rows); // #18 KM
                        break;
                }
            },
            executeFirstRendering: () => {}, // data is already rendered in processSection
            applyValidationStyle: () => {},
        }
    )
);

apiGetAllRenderers({ parameters: { onlyActive: true } }).then((result) => {
    // console.log("FORMS: read all renderers");
    let loadPromises = [];
    let now = new Date();
    let count = 0;
    for (let rendererInfo of result) {
        if (rendererInfo.appType === "application") {
            let resolved: any;
            loadPromises.push(
                new Promise((ok) => {
                    resolved = ok;
                })
            );
            // @ts-ignore
            let loadOutcome = AppCache.Load(rendererInfo.appName, {
                load: "init",
                startParams: {
                    FORMS,
                    rendererInfo,
                    onLoad: () => resolved(true),
                },
                appGUID: `forms_renderer-${count++}.${now.getTime()}`,
            });
            loadOutcome?.then &&
                loadOutcome?.then((result) => {
                    // console.log(`${rendererInfo.appName} then with the result:`,result);
                });
            loadOutcome?.catch && loadOutcome?.catch((reject) => console.log(`${rendererInfo.appName} catch. Error: ${reject}`));
            // console.log(loadOutcome);
        }
    }
    Promise.allSettled(loadPromises).then(() => FORMS.Renderer.resolveLoaded());
});
// ADD end
