// ADD begin
// INFO: {user: "paulo.reis.rosa", reason: "Viking merge", purpose: "types declaration necessary for FORMS"}
type TyRendererRepository = {
    // The repository contains all the data that the renderer needs. It's up to the 
    // renderer developer which properties to use (if any)
    
    // options is used by the framework and contains the "options" parameter passed by the FORMS.build(options) method
    options: any,
    // config and data are used by the Free Step Wizard for example
    config: any,
    data: any,
    // any other property that the user needs
    [k:string]: any
}
interface IfFormRendererAction {
    // [Mandatory] Used on the FORMS.getData method. Just return any additional data that is required by the framework
    // Necessary data up until now:
    // {
    //     displayNamespace: string
    //     displayType: string
    //     displayTypeDescription: string
    // }
    getData(): any;
    // [Mandatory] prepareData acquires data from the form definition to know how to display the data
    // * options: form configuration data
    // * repository: space used to hold data specific to the selected renderer
    prepareData(form: object, repository: Partial<TyRendererRepository>): any;
    // [Mandatory] bundleRendererData returns an object that represents the data necessary to render the data
    // its structure is direclty related to the displayType
    // * form: id or data of the form being displayed
    bundleRenderedData(form: string|Object): any;
    // [Mandatory] applyStyles and clearStyles respectively apply and remove necessary styles from an object
    applyStyles(uiElement: sap.ui.core.Element): void;
    clearStyles(uiElement: sap.ui.core.Element): void;
    [key: string]: any
}
class FormRenderer {
    readonly nameSpace: string;
    readonly displayType: string;
    readonly rendererInfo: any;
    private label: string;
    private description: string;
    public action: IfFormRendererAction;
    constructor(nameSpace: string, displayType: string, rendererInfo: object, label: string, description: string, renderer: IfFormRendererAction) {
        this.nameSpace = nameSpace;
        this.displayType = displayType;
        this.rendererInfo = rendererInfo;
        this.label = label;
        this.description = description;
        this.action = renderer;
    };
    getId(): string {
        return `${this.nameSpace}--${this.displayType}`;
    };
    getComposerId(): string {
        return this.rendererInfo?.composerId ?? this.getId();
    };
    getLabel(): string {
        return this.label;
    };
    setLabel(label: string): void {
        this.label = label;
    };
    getDescription(): string {
        return this.description;
    };
    setDescription(description: string): void {
        this.description = description;
    };
}
type TyGrowableConstant<T> = {
    [k:string]: T
}
// ADD end
