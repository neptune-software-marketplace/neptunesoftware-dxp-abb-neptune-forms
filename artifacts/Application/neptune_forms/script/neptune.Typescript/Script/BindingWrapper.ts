type TyGenericObject = { [k:string]:any }; // Forces it to be an object, but it can contain any property in it
type TyUuidFormatterConfiguration = {
    id: string,
    property: string
}
type TyUuidBindingContext = {
    id: string, 
    duplicateOf: string,
    enableDuplicate: boolean, 
    formatters: TyUuidFormatterConfiguration[]
}; 
type TyParameterMetadata = {
    variable: string,
    varType: string,
    enableDuplicate: boolean,
    id: string|string[], // #57
    path: string|string[],
    type: string,
};
type TyFormatter = {
    [k:string]: { // UUID
        [k:string]: { // property name (e.g.: "visible")
            variable: string,          //
            value: any                 // <-- formatter info for [UUID][property]
            enableDuplicate?: boolean, //
        }
    }
};
type TyFormatterArray = TyFormatter[];
type TyOldConditionCodeParcels = { logicGate:string, code:string};
type TyOldConditionalVisibility = {
    "id": string, // this instance id
    "visibleFieldName": string, // variable's UUID
    "visibleCondition": string, // initially only "===" || "!=="
    "visibleSep"?: string, // "and"|"or"
    "visibleValue": string[] // note: "empty" => "". TODO: replace "empty" with "" in the FORMS code
}
type TyFormatterParameterConfiguration = {
    fieldId: string,
    title: string,
    varType: string,
    variable: string,
    enableDuplicate?: boolean,
    error?: {
        duplicated?: boolean,
        missing?: boolean
    },
    hasErrors?: boolean,
    type: string
}
type TyFormatterConfiguration = {
    paramList: TyFormatterParameterConfiguration[],
    code: string|null
}
class BindingWrapper {
    private FORMS:any;
    private setup;
    private config;
    private model:sap.ui.model.json.JSONModel;
    private debouncers: Map<string, TyGenericObject>;
    public minTimeout = 250;
    public maxTimeout = 500;
    public formatters: TyFormatterArray;
    constructor (FORMS) {
        if (!FORMS.formParent) throw "Invalid form";
        this.FORMS = FORMS;
        this.model = FORMS.formParent.getModel();
        this.config = FORMS.config;
        this.setup = this.config.setup;
        this.formatters = [];
        this.debouncers = new Map();
    }

    public Advanced = {
        Configuration: {
            getFormatterConfigList: (element: TyGenericObject): string[] => 
                Object.getOwnPropertyNames(element.useFormatterConfig ?? {}).filter(name =>
                    element?.useFormatterConfig?.[name])
            ,
            getFormatterConfig: (element: TyGenericObject, property="visible"): TyFormatterConfiguration =>
                element?.formatterConfig?.[property] ?? this.Advanced.Generator.emptyFormatterConfig()
            ,
            setFormatterConfig: (element?: TyGenericObject, formatterConfig?: TyFormatterConfiguration, property = "visible") => {
                if (!element) {
                    // no element. quits
                    return;
                }
                if ((typeof element.useFormatterConfig !== "object") || (element.useFormatterConfig === null)) {
                    // Only makes sure that {/useFormatterConfig} is accessible
                    element.useFormatterConfig = {};
                }
                if ((typeof element.formatterConfig !== "object") || (element.formatterConfig === null)) {
                    element.formatterConfig = {};
                }
                if (!formatterConfig) {
                    // No configurstion supplied, so sets an empty formatter config
                    element.formatterConfig[property] = this.Advanced.Generator.emptyFormatterConfig();
                }
                else {
                    element.formatterConfig[property] = formatterConfig;
                }
            },
            getAllConditions: (includeDisabled = false, includeNoCode = false) => {
                const thisInstance = this;
                function reduceElements(elements) {
                    if (!(Array.isArray(elements) && elements.length)) {return [];}
                    return elements.reduce((bag, element) => {
                        let newElBag = bag;
                        // if (element.enableVisibleCondAdvanced && (includeDisabled || !element.disabled)) {
                        //     newElBag.push(element);
                        // }
                        // else 
                        if (includeNoCode && element.enableVisibleCond && (includeDisabled || !element.disabled)) {
                            newElBag.push(element);
                        }
                        else if (includeDisabled || !element.disabled) {
                            const formatterConfigList = thisInstance.Advanced.Configuration.getFormatterConfigList(element);
                            if (Array.isArray(formatterConfigList) && formatterConfigList.length) {
                                newElBag.push(element);
                            }
                        }
                        return newElBag.concat(reduceElements(element.elements)); // considers applications where elements aggregate elementss
                    },[]);
                };
                return reduceElements(this.setup); // sections may also have visibility conditions
            },
            getAllConditionsWithParamId: (id: string, includeDisabled = false, includeNoCode = false) => {
                const thisInstance = this;
                function reduceElements(elements) {
                    if (!(Array.isArray(elements) && elements.length)) {return [];}
                    return elements.reduce((bag, element) => {
                        let newElBag = bag;
                        // if (element.enableVisibleCondAdvanced && (includeDisabled || !element.disabled)) {
                        //     let foundMatch = thisInstance.Advanced.Configuration.getFormatterConfig(element, "visible").paramList.find(param=>param.fieldId === id);
                        //     // let foundMatch = element.advancedVisibility.paramList.find(param=>param.fieldId === id);
                        //     if (foundMatch) {
                        //         newElBag.push(element);
                        //     }
                        // }
                        // else if (includeNoCode && element.enableVisibleCond && (includeDisabled || !element.disabled)) {
                        if (includeNoCode && element.enableVisibleCond && (includeDisabled || !element.disabled)) {
                            if (element?.visibility?.length) {
                                let foundMatch = element.visibility.find(item=>item.visibleFieldName === id);
                                if (foundMatch) {
                                    newElBag.push(element);
                                }
                            }
                            else if (element.visibleFieldName === id) {
                                newElBag.push(element);
                            }
                        }
                        else if (includeDisabled || !element.disabled) {
                            const formatterConfigList = thisInstance.Advanced.Configuration.getFormatterConfigList(element);
                            const {getFormatterConfig} = thisInstance.Advanced.Configuration;
                            if (Array.isArray(formatterConfigList) && formatterConfigList.length && (includeDisabled || !element.disabled)) {
                                let foundMatch = formatterConfigList.some(property => 
                                    getFormatterConfig(element, property).paramList.some(param=>param.fieldId === id));
                                if (foundMatch) {newElBag.push(element);}
                            }
                        }
                        return newElBag.concat(reduceElements(element.elements)); // considers applications where elements aggregate elementss
                    },[]);
                };
                return reduceElements(this.setup); // sections may also have visibility conditions
            },
            convertFromNocodeConditions: (visibilityConditions: TyOldConditionalVisibility[]): TyFormatterConfiguration => {
                let newConfiguration = this.Advanced.Generator.emptyFormatterConfig();

                if (visibilityConditions.length) {
                    let codeParcels: TyOldConditionCodeParcels[] = [];
                    let codeParams: string[] = [];
                    for (let condition of visibilityConditions) {
                        if (!(condition.visibleFieldName && condition.visibleCondition)) {continue;}
                        if (typeof condition.visibleValue === "undefined") {continue;}
                        let newParameter: TyFormatterParameterConfiguration = 
                            this.Advanced.Configuration.buildFormatterParameterConfiguration(condition.visibleFieldName);
                        if (!newParameter) {continue;}
                        let varSuffix = '';
                        let intSuffix = 0;
                        const foundDuplicateParam = newConfiguration.paramList.find(param => param.fieldId === newParameter.fieldId);
                        if (foundDuplicateParam) {
                            newParameter = foundDuplicateParam;
                        }
                        else {
                            while (codeParams.includes(`${newParameter.variable}${varSuffix}`)) { 
                                varSuffix = `${++intSuffix}`;
                            }
                        }
                        if (varSuffix) {newParameter.variable = `${newParameter.variable}${varSuffix}`;}
                        if (!codeParams.includes(newParameter.variable)) {
                            codeParams.push(newParameter.variable);
                        }
                        codeParcels.push({
                            logicGate: (condition.visibleSep === "and") ? "&&" : ((condition.visibleSep === "or") ? "||" : ""), // && , || , <empty string>
                            code: this.Advanced.Generator.codeFromNocodeConditions(newParameter, condition)
                        });
                        if (!foundDuplicateParam) { newConfiguration.paramList.push(newParameter); }
                    }
                    for (let parcel of codeParcels) {
                        if (!parcel.logicGate) {
                            newConfiguration.code = parcel.code;
                        }
                        else {
                            newConfiguration.code = `${newConfiguration.code} ${parcel.logicGate} ${parcel.code}`;
                        }
                    }
                    newConfiguration.code = `return ${newConfiguration.code};`;
                }
                return newConfiguration;
            },
            buildFormatterParameterConfiguration: (id: string): TyFormatterParameterConfiguration => {
                if (!id) {return;}
                let elementConfig = FORMS.getElementFromId(id);
                if (!elementConfig) {return;}
                let newParameter: TyFormatterParameterConfiguration = {
                    fieldId: id,
                    title: elementConfig.title,
                    varType: this.Advanced.Configuration.getFormatterTypeOf(elementConfig),
                    variable: this.Advanced.Configuration.toCamelCase(`var ${elementConfig.type}`),
                    enableDuplicate: elementConfig.enableDuplicate,
                    error: {},
                    hasErrors: false,
                    type: elementConfig.type
                }
                return newParameter;
            },
            getFormatterTypeOf: (elementConfig: TyGenericObject): string => {
                let elementType = this.FORMS.elementTypes.find(elementType => elementType.type === elementConfig.type);
                let varType = (!elementType) ? 'any' : elementType.paramType;
                varType = (elementConfig.enableDuplicate) ? varType+'[]' : varType;
                return varType;
            },
            toCamelCase: (text: string): string => {
                if (typeof text !== "string") {return '';}
                if (!text) {return '';}
                let capitalLetter = false;
                let camelCasedText = Array.from(text).reduce( (bag, letter) => {
                    if (letter.match(/[^\w]/)) {
                        capitalLetter = true;
                        return bag;
                    }
                    let newLetter = (capitalLetter) ? letter.toLocaleUpperCase("en") : letter;
                    capitalLetter = false;
                    return bag+newLetter;
                }, '');
                return camelCasedText[0].toLocaleLowerCase("en")+camelCasedText.slice(1);
            },
            collectUuidBindingContext: (id:string, includeDisabled = false, includeNoCode = false): TyUuidBindingContext[] => {
                const reduceElementAndDuplicate = (nodes: TyGenericObject, matchId) => (Array.isArray(nodes)) 
                    // TODO: remake function
                    //  - must make sure that only elements imediatelly below the main id are selected, AND they must be connected
                    //  - it currently just assumes that everything is correct
                    // TODO: consider grouped duplicates
                    ? nodes.reduce((bag,node)=>(node.id===matchId||node.duplicatedFromId===matchId)
                            ? bag.concat(node).concat(reduceElementAndDuplicate(node.elements, matchId)) 
                            : bag.concat(reduceElementAndDuplicate(node.elements, matchId))
                        ,[])
                    : (!nodes 
                        ? [] 
                        : (nodes.id===matchId||nodes.duplicatedFromId===matchId) ? [nodes] : []);
                // collects all sections AND elements in the same tree, as long as they share a duplicate-link with "id"
                const uuidMetadata: TyGenericObject[] = reduceElementAndDuplicate(this.FORMS.config.setup, id);
                const {enableDuplicate} = uuidMetadata?.[0] ?? {};
                // collects all conditions that have id as parameter 
                const conditions = this.Advanced.Configuration.getAllConditionsWithParamId(id, includeDisabled, includeNoCode);
                const formatters: TyUuidFormatterConfiguration[] = conditions.map(condition => {
                    return {
                        id: condition.id,
                        property: "visible"
                    }
                })
                let result:TyUuidBindingContext[] = uuidMetadata.map( member => {
                    return { id: member.id, duplicateOf: id, enableDuplicate, formatters }; 
                });
                return result;
            },
            collectFormatterParameters: (elementConfig: TyGenericObject, property="visible"): TyFormatterParameterConfiguration[] => {
                let result:TyFormatterParameterConfiguration[] = [];
                if ((elementConfig.enableVisibleCond || elementConfig.useFormatterConfig?.[property])) {
                    // Handles Conditional Visibility through
                    //  - obsolete {visibleCondition,visibleValue,visibleFieldName} = elementConfig
                    //  - nocode visibility {visibility} = elementConfig
                    //  - advanced visibility {formatterConfig.visible} = elementConfig // previously {advancedVisibility}
                    let formatterConfig = this.Advanced.Configuration.getFormatterConfig(elementConfig, property);
                    // let formatterConfig = (elementConfig.enableVisibleCondAdvanced) ? elementConfig.advancedVisibility : undefined;
                    if (elementConfig.enableVisibleCond && !elementConfig.visibility?.length) {
                        formatterConfig = this.Advanced.Configuration.convertFromNocodeConditions([{
                            id: ModelData.genID(),
                            visibleCondition: elementConfig.visibleCondition,
                            visibleValue: elementConfig.visibleValue,
                            visibleFieldName: elementConfig.visibleFieldName
                        }]);
                    }
                    else if (elementConfig.enableVisibleCond && elementConfig.visibility?.length) {
                        formatterConfig = this.Advanced.Configuration.convertFromNocodeConditions(elementConfig.visibility);
                    }
                    result = formatterConfig.paramList;
                }
                return result;
            },
            getElementFromItemId: function (uuid:string) {
                let getElement;
                const _getElement = (node) => { 
                    if (Array.isArray(node.items) && node.items.find(item => item?.id === uuid)) {return node;}
                    if (Array.isArray(node.elements)) {
                        for (let element of node.elements) {
                            let result = getElement(element);
                            if (result) { return result; }
                        }
                    }
                    return null;
                }
                getElement = _getElement.bind(this);
                for (let node of this.setup) {
                    let result = getElement(node);
                    if (result) {return result;}
                }
                return null;
            },
        },
        Generator: {
            emptyFormatterConfig: (): TyFormatterConfiguration => {
                return {paramList:[], code:''};
            },
            codeFromNocodeConditions: (paramConfig: TyFormatterParameterConfiguration, condition: TyOldConditionalVisibility): string => {
                const getCodeForCondition = _getCodeForCondition.bind(this);
                let result: string = 'false';
                if (!paramConfig.enableDuplicate) {
                    result = getCodeForCondition(paramConfig.variable, paramConfig.type, condition);
                }
                else {
                    result = `${paramConfig.variable}.some(value => ${getCodeForCondition("value", paramConfig.type, condition)})`;
                }
                return result;
                // ------- helper function to return a single value condition
                function _getCodeForCondition(variable: string, ui5Type:string, condition: TyOldConditionalVisibility): string {
                    let result: string = 'false';
                    let conditionValues;
                    let isEqual = false; // used to diferentiate between equal and not equal (in certain places of the switch)
                    switch(ui5Type) {
                        case "MultipleSelect":
                        case "MultipleChoice":
                            conditionValues = condition.visibleValue.map(key=>`'${key}'`);
                            switch(condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.CONTAINS_ALL.key:
                                    result = `((conditionValues)=>{for(let key of conditionValues){if(!${variable}.includes(key)){return false;}};return true;})([${conditionValues}])`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.CONTAINS_ANY.key:
                                    result = `((conditionValues)=>{for(let key of conditionValues){if(${variable}.includes(key)){return true;}};return false;})([${conditionValues}])`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    isEqual = true;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `((conditionValues)=>{for(let key of conditionValues){if(!${variable}.includes(key)){return false;}};for(let key of ${variable}){if(!conditionValues.includes(key)){return false;}};return true;})([${conditionValues}])`;
                                    if (!isEqual) {result = `!${result}`;}
                                    break;
                            }
                            break;
                        case "CheckList":
                            let element = this.FORMS.getObjectFromId(condition.visibleFieldName);
                            conditionValues = (element.items ?? []).map(item => condition.visibleValue.includes(item.id));
                            switch (condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.CONTAINS_ALL.key:
                                    result = `((conditionValues)=>{for(let index in conditionValues){if (conditionValues[index] && !${variable}[index]){return false;}};return true;})([${conditionValues}])`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.CONTAINS_ANY.key:
                                    result = `((conditionValues)=>{for(let index in conditionValues){if (conditionValues[index] && !!${variable}[index]){return true;}};return false;})([${conditionValues}])`; // #57 #58
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    isEqual = true;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `((conditionValues)=>{for(let index in conditionValues){if (conditionValues[index] !== !!${variable}[index]){return false;}};return true;})([${conditionValues}])`; // #57 #58
                                    if (!isEqual) {result = `!${result}`;}
                                    break;
                            }
                            break;
                        case "SegmentedButton":
                        case "SingleSelectIcon":
                        case "SingleSelect":
                        case "SingleChoice":
                            conditionValues = (condition.visibleValue??[]).map(key=>`'${key}'`);
                            switch (condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.CONTAINS_ANY.key:
                                    result = `([${conditionValues}].includes(${variable}))`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    isEqual = true;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `(([${conditionValues}].length === 1) && [${conditionValues}].includes(${variable}))`;
                                    if (!isEqual) {result = `!${result}`;}
                            }
                            break;
                        case "CheckBox":
                        case "Switch":
                            switch (condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    isEqual = true;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `(("${condition.visibleValue}"==="true") === ${variable})`;
                                    if (!isEqual) {result = `!${result}`;}
                            }
                            break;
                        case "Image":
                            switch (condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    isEqual = true;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `((("${condition.visibleValue}"==="exists") && ((typeof ${variable} === "string") && !!${variable}.length)) || (("${condition.visibleValue}"==="empty") && ((typeof ${variable} !== "string") || !${variable}.length)))`;
                                    if (!isEqual) {result = `!${result}`;}
                            }
                            break;
                        case "File":
                            switch (condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    isEqual = true;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `((("${condition.visibleValue}"==="exists") && ((typeof ${variable}?.src === "string") && !!${variable}?.src.length)) || (("${condition.visibleValue}"==="empty") && ((typeof ${variable}?.src !== "string") || !${variable}?.src.length)))`;
                                    if (!isEqual) {result = `!${result}`;}
                            }
                            break;
                        case "Numeric":
                        case "Rating":
                        case "StepInput":
                            // @ts-ignore
                            conditionValues = conditionValues = isNaN(Number.parseFloat(condition.visibleValue)) ? 0 : Number.parseFloat(condition.visibleValue);;
                            switch(condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.GREATER_THAN.key:
                                    result = `(${variable}>${conditionValues})`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.GREATER_OR_EQUAL.key:
                                    result = `(${variable}>=${conditionValues})`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    result = `(${variable}===${conditionValues})`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.LOWER_OR_EQUAL.key:
                                    result = `(${variable}<=${conditionValues})`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.LOWER_THAN.key:
                                    result = `(${variable}<${conditionValues})`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `(${variable}!==${conditionValues})`;
                                    break;
                            }
                            break;
                        case "TextArea":
                            // It shares the same code as Input for the following operations (it breaks otherwise):
                            if (![
                                    FORMS.CONDITION_OPERATOR.EQUAL.key,
                                    FORMS.CONDITION_OPERATOR.NOT_EQUAL.key,
                                    FORMS.CONDITION_OPERATOR.STARTS_WITH.key,
                                    FORMS.CONDITION_OPERATOR.CONTAINS.key,
                                    FORMS.CONDITION_OPERATOR.ENDS_WITH.key,
                                ].includes(condition.visibleCondition)) { break; }
                        default:
                            conditionValues = condition.visibleValue;
                            switch(condition.visibleCondition) {
                                case this.FORMS.CONDITION_OPERATOR.GREATER_THAN.key:
                                    result = `(${variable}>"${conditionValues}")`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.GREATER_OR_EQUAL.key:
                                    result = `(${variable}>="${conditionValues}")`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.EQUAL.key:
                                    result = `(${variable}==="${conditionValues}")`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.LOWER_OR_EQUAL.key:
                                    result = `(${variable}<="${conditionValues}")`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.LOWER_THAN.key:
                                    result = `(${variable}<"${conditionValues}")`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.NOT_EQUAL.key:
                                    result = `(${variable}!=="${conditionValues}")`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.STARTS_WITH.key:
                                    result = `(${variable} ?? "").toLocaleLowerCase().startsWith("${conditionValues ?? ""}".toLocaleLowerCase())`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.CONTAINS.key:
                                    result = `(${variable} ?? "").toLocaleLowerCase().includes("${conditionValues ?? ""}".toLocaleLowerCase())`;
                                    break;
                                case this.FORMS.CONDITION_OPERATOR.ENDS_WITH.key:
                                    result = `(${variable} ?? "").toLocaleLowerCase().endsWith("${conditionValues ?? ""}".toLocaleLowerCase())`;
                                    break;
                            }
                    }
                    return result;
                }
            },
            formatterFunction: (propertyConfig:TyFormatterConfiguration, negatesResult:boolean, errorResult?: TyGenericObject): Function|undefined => {
                let builtFunction;
                try {
                    builtFunction = (typeof propertyConfig === "undefined")
                        ? undefined
                        : ((propertyConfig) => {
                            let paramNames = propertyConfig.paramList.map(param=>param.variable);
                            return new Function(...(paramNames ?? []), propertyConfig.code ?? '');
                        })(propertyConfig);
                }
                catch (e) {
                    console.error("Generating function@BindingWrapper:", e);
                    if (typeof errorResult === "object") {
                        errorResult.text = (typeof e === "string") ? e : (typeof e.toString === "function" ? e.toString() : "Activation error");
                    }
                    return;
                }
                if (negatesResult) {
                    // This is only applicable to the nocode visibility model, where the user chooses
                    // show/hide as the result of the condition. Having it as "hide" means that the result is negated, and the
                    // coded function is expected to be boolean in the first place.
                    
                    return (...paramNames)=>!builtFunction(...paramNames);
                }
                return builtFunction;
            }
        },
        Control: {
            debounceFormatter: (formatter) => {
                let {minTimeout, maxTimeout} = this;
                const now = new Date().getTime();
                const debounceInfo = this.debouncers.get(formatter.id) ?? {};
                if (debounceInfo.timeoutHandle) {
                    clearTimeout(debounceInfo.timeoutHandle);
                    delete debounceInfo.timeoutHandle;
                }
                if (!debounceInfo.start) {
                    debounceInfo.start = now;
                }
                if (maxTimeout < now-debounceInfo.start) {
                    // max timeout is reached => immediate execution && reset
                    delete debounceInfo.start;
                    this.Advanced.Control.executeFormatter(formatter);
                }
                else {
                    let thisInstance = this;
                    debounceInfo.timeoutHandle = setTimeout(function () {
                        delete debounceInfo.start;
                        delete debounceInfo.timeoutHandle;
                        thisInstance.debouncers.set(formatter.id, debounceInfo);
                        thisInstance.Advanced.Control.executeFormatter(formatter);
                    }, minTimeout);
                }
                this.debouncers.set(formatter.id, debounceInfo);
            },
            executeFormatter: (config: TyUuidFormatterConfiguration) => {
                const {formatterFunction, paramMetadata} = this.formatters[config.id][config.property];
                const values: any = [];

                // Collects the values before executting the formatter
                for (let param of paramMetadata.values()) {
                    values.push(this.Advanced.Form.getDataOf(param));
                }
                let result:any;
                try {
                    result = formatterFunction(...values);
                }
                catch (e) {
                    console.error(`${config.id}: An error was detected while executing a formatter for the property "${config.property}"`);
                    console.error(e);
                    if (config.property === "visible") {
                        // ensures that on error, components that depend on visibility will not be shown
                        result = false;
                    }
                }
                /* After the formatter is executed, its value is written to /property/id
                 * the refresh will trigger the corresponding binding
                 * For example: if property is "visible" and id is "dc67153d-98f3-4a95-ba2a-56475581ecf9", then the ui5 element
                 *              with "visible": "{/visible/dc67153d-98f3-4a95-ba2a-56475581ecf9}" will become visible or shown.
                 */
                if (!this.model.getData()?.[config.property]) {this.model.getData()[config.property] = {};}
                this.model.getData()[config.property][config.id] = result;
                this.model.refresh();
            }
        },
        Form: {
            createWatchdogs: (includeDisabled = false, includeNoCode = false) => {
                const watchdogIds: string[] = [];
                const now = new Date().getTime();
                const _attachUi5Watchdog = function (id, path, ui5Type, formatters, parent) { // #57
                    const thisId =  this.FORMS.getView().createId(`watchdog--${id}.${now}`);
                    if (watchdogIds.includes(thisId)) { return; } // If the id has been processed before then exits
                    else { watchdogIds.push(thisId); } // otherwise registers it and continues
                    let ui5Path = `/${path}`; // #57
                    let ui5Text = `{${ui5Path}}`;
                    switch (ui5Type) {
                        case "MultipleSelect":
                        case "MultipleChoice":
                            ui5Path = `/${path}/length`; // #57
                            ui5Text = `{${ui5Path}}`;
                            break;
                        case "File":
                            ui5Path = `/${path}/src`; // #57
                            ui5Text = `{${ui5Path}}`;
                            break; // #57
                    }
                    let newWatchdog = new sap.m.Text(thisId, {
                        visible: false,
                        text: ui5Text
                    })
                    newWatchdog.bindText({
                        path: ui5Path,
                        formatter: () => {
                            for (let formatter of formatters) {
                                this.Advanced.Control.debounceFormatter(formatter);
                            }
                        }
                    })
                    parent.addContent(newWatchdog);
                }
                const attachUi5Watchdog = _attachUi5Watchdog.bind(this); // forces the "this" in _attachUi5Watchdog to be the instance
                const conditions = this.Advanced.Configuration.getAllConditions(includeDisabled, includeNoCode);
                const paramUuids:string[] = conditions.reduce((bag, condition) => {
                    const params = this.Advanced.Configuration.collectFormatterParameters(condition);
                    return bag.concat(params.map(param=>param.fieldId));
                },[]);
                for (let paramUuid of paramUuids) {
                    const uuidBindings:TyUuidBindingContext[] = this.Advanced.Configuration.collectUuidBindingContext(paramUuid,includeDisabled,includeNoCode);
                    for (let uuidBinding of uuidBindings) {
                        const uuidMetadata = FORMS.getObjectFromId(uuidBinding.id);
                        switch (uuidMetadata.type) {
                            case "CheckList":
                                if (!uuidMetadata.fieldName) { // #57
                                    for (let item of uuidMetadata.items) {
                                        attachUi5Watchdog( // #57
                                            item.id, 
                                            item.id, 
                                            uuidMetadata.type, 
                                            uuidBinding.formatters, 
                                            this.FORMS.formParent
                                        );
                                    }
                                }
                                else {
                                    // TODO: CheckList... many instead of 1/length
                                    for (let index in uuidMetadata.items) { // #57 #58
                                        attachUi5Watchdog( // #57 #58
                                            `${uuidMetadata.fieldName}_${index}_${uuidMetadata.id}`, 
                                            `${uuidMetadata.fieldName}/${index}`, 
                                            uuidMetadata.type, 
                                            uuidBinding.formatters, 
                                            this.FORMS.formParent
                                        );
                                    }
                                }
                                break;
                            default:
                                attachUi5Watchdog( // #57
                                    uuidMetadata.id, 
                                    uuidMetadata.fieldName ? uuidMetadata.fieldName: uuidMetadata.id, 
                                    uuidMetadata.type, 
                                    uuidBinding.formatters, 
                                    this.FORMS.formParent
                                );
                        }
                    }
                }                
            },
            getDataOf: (parameter: TyParameterMetadata|string, parameterPath?: string, varType?:string, ui5Type?: string):any => { // #57
                function _conformToType(value, varType) {
                    // Converts any to number if varType.startsWith("number")
                    //      rules: string => empty is 0, otherwise Number.parseFloat
                    //             undefined|null|false = 0
                    //             true = 1
                    // Converts any to boolean if varType.startsWith("boolean")
                    //
                    switch(true) {
                        case varType.startsWith("number"):
                            switch(typeof value) {
                                case "string":
                                    if (value === "") { return 0; }
                                    return Number.parseFloat(value);
                                case "undefined":
                                    return 0;
                                case "boolean":
                                    return value ? 1 : 0;
                                case "number":
                                    break; // executes: return value;
                                default:
                                    return NaN;
                            }
                            break; // executes: return value;
                        case varType.startsWith("boolean"):
                            switch(typeof value) {
                                case "string":
                                    if (value === "false") { return false; }
                                    if (value === "true") { return true; }
                                    break;
                                case "undefined":
                                    return false;
                                case "boolean":
                                    break;
                                case "number":
                                    return !!value;
                                default:
                                    if (value === null) {return false;};
                                    return !!value;
                            }
                            break; // executes: return value;
                        case varType.startsWith("string"):
                            switch(typeof value) {
                                case "undefined":
                                case "object":
                                    return "";
                                case "number":
                                case "boolean":
                                    return `${value}`;
                                default:
                                    return value;
                            }
                    }
                    return value;
                }
                function _getSingleValueOf(uuid, path, varType, ui5Type) { // #57
                    switch(ui5Type) {
                        case "CheckList":
                            let checkList = FORMS.getObjectFromId(uuid);
                            if (checkList?.fieldName) { // #57 #58
                                let values = this.model.getProperty(`/${path}`);
                                    values = Array.isArray(values) ? values : [];
                                if (values.length < checkList.items.length) {
                                    values = values.concat(new Array(checkList.items.length - values.length));
                                }
                                return values.map(value=>conformToType(value, varType));
                            }
                            if (!Array.isArray(checkList.items)) { return [];}
                            const values = [];
                            checkList.items.forEach(item=>{
                                values.push(conformToType(this.model.getProperty(`/${item.id}`),varType));
                            })
                            return values;
                        case "File":
                            return conformToType(this.FORMS.getData().data?.[path], varType); // #57
                        case "DatePicker":
                        case "DateTimePicker":
                            return conformToType(this.FORMS.getLocaleIsoString(this.model.getProperty(`/${path}`)),varType); // #57
                        default:
                            return conformToType(this.model.getProperty(`/${path}`),varType); // #57
                    }
                }
                const conformToType = _conformToType.bind(this);
                const getSingleValueOf = _getSingleValueOf.bind(this);

                if (!parameter) {return;}
                if (typeof parameter === "string") {
                    if (!varType) {
                        console.warn(`getDataOf@BindingWrapper: "${parameter}" has no type associated. Returning undefined.`);
                        return;
                    }
                    if (!ui5Type) {
                        console.warn(`getDataOf@BindingWrapper: "${parameter}" has no type of UI5 object associated. Returning undefined.`);
                        return;
                    }
                    return getSingleValueOf(parameter, parameterPath, varType, ui5Type); // #57
                }
                if (parameter.enableDuplicate) {
                    const values = [];
                    const arrayOfIds = (Array.isArray(parameter.id)) ? parameter.id : []; // #57
                    for (let index in arrayOfIds) { // #57
                        values.push(getSingleValueOf(parameter.id[index], parameter.path[index], parameter.varType, parameter.type)); // #57
                    }
                    return values;
                }
                else {
                    return getSingleValueOf(parameter.id, parameter.path, parameter.varType, parameter.type) // #57
                }
            },
            createBindingFor: (elementConfig:TyGenericObject, property:string="visible", includeDisabled = false, includeNoCode = false) => {
                if (!elementConfig) {return;}
                let formatterConfig: TyFormatterConfiguration;
                let oldLogicRequestsNegation: boolean|undefined;
                let oldLogicRequestsInPlace: boolean = false;
                switch(property) {
                    case "visible":
                        if (!(elementConfig.enableVisibleCond || elementConfig.useFormatterConfig?.[property])) {return;}
                        formatterConfig = this.Advanced.Configuration.getFormatterConfig(elementConfig, property);
                        // formatterConfig = (elementConfig.enableVisibleCondAdvanced) ? elementConfig.advancedVisibility : undefined;
                        if (elementConfig.enableVisibleCond && !elementConfig.visibility?.length) {
                            // old model is being used
                            formatterConfig = this.Advanced.Configuration.convertFromNocodeConditions([{
                                id: ModelData.genID(),
                                visibleCondition: elementConfig.visibleCondition,
                                visibleValue: elementConfig.visibleValue,
                                visibleFieldName: elementConfig.visibleFieldName
                            }])
                            oldLogicRequestsNegation = elementConfig.visibleInverse === "hide";
                            oldLogicRequestsInPlace = true;
                        }
                        else if (elementConfig.enableVisibleCond && elementConfig.visibility?.length) {
                            formatterConfig = this.Advanced.Configuration.convertFromNocodeConditions(elementConfig.visibility);
                            oldLogicRequestsNegation = elementConfig.visibleInverse === "hide";
                            oldLogicRequestsInPlace = true;
                        }
                        else if ((typeof formatterConfig === "undefined") 
                                ||
                                (typeof formatterConfig.code !== "string")
                                ||
                                !Array.isArray(formatterConfig.paramList)
                                ) {
                            if ((typeof formatterConfig === "undefined")||(formatterConfig === null)) { formatterConfig = this.Advanced.Generator.emptyFormatterConfig(); }
                            if (typeof formatterConfig.code !== "string") {formatterConfig.code = '';}
                            if (!Array.isArray(formatterConfig.paramList)) {formatterConfig.paramList=[];}
                            if (elementConfig.useFormatterConfig?.[property]) {
                                this.Advanced.Configuration.setFormatterConfig(elementConfig, formatterConfig, property)
                                // elementConfig.advancedVisibility = formatterConfig;
                            }
                        }
                        break;
                }
                let formatterFunction = 
                    this.Advanced.Generator.formatterFunction(formatterConfig, (oldLogicRequestsInPlace && oldLogicRequestsNegation))
                    ??
                    ((property==="visible") ? ()=>false: ()=>{});
                
                const paramMetadata:Map<string, TyParameterMetadata> = new Map();
                const uuidBindings:Map<string, TyUuidBindingContext> = new Map();
                const {paramList} = formatterConfig;

                paramList.forEach(param=>{
                    const uuidConfig:TyUuidBindingContext[] = this.Advanced.Configuration.collectUuidBindingContext(param.fieldId, includeDisabled, includeNoCode); // array
                    const enableDuplicate = this.FORMS.getElementFromId(param.fieldId)?.enableDuplicate;
                    const {id,path} = (function (enableDuplicate, uuidConfig, instance) { // #57
                            const result = {id:[], path:[]};
                            if (enableDuplicate) {
                                for (let item of uuidConfig) {
                                    const objMetadata = instance.FORMS.getElementFromId(item.id);
                                    result.id.push(objMetadata.id);
                                    result.path.push((objMetadata.fieldName) ? objMetadata.fieldName : objMetadata.id);
                                }
                            }
                            else {
                                const objMetadata = instance.FORMS.getElementFromId(uuidConfig[0].id);
                                result.id = objMetadata.id;
                                result.path = (objMetadata.fieldName) ? objMetadata.fieldName : objMetadata.id;
                            }
                            return result;
                        })(enableDuplicate, uuidConfig, this);
                    paramMetadata.set(param.variable, {
                        variable: param.variable,
                        varType: param.varType,
                        enableDuplicate,
                        id, // #57
                        path,
                        type: param.type
                    });
                    // If it is !enableDuplicate, it should only contain 1 entry
                    uuidConfig.forEach(uuidItem => uuidBindings.set(uuidItem.id, uuidItem));
                });

                const propertyConfig = ((typeof this.formatters[elementConfig.id] === "object") && this.formatters[elementConfig.id] !== null)
                                        ? this.formatters[elementConfig.id]
                                        : (() => this.formatters[elementConfig.id] = {})();
                propertyConfig[property] = {formatterFunction, paramMetadata, uuidBindings};
                return propertyConfig[property];
            }
        }
    }
}