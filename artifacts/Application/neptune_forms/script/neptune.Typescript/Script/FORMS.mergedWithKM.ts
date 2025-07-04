
// ADD #1 begin
// INFO: {
//     user: "paulo.reis.rosa", 
//     reason: "being moved from 'const' to 'namespace'", 
//     action: "copied from 'const FORMS', modified to 'namespace' and exports added"
//     from: "'FORMS' javascript"
// }
sap.ui.require(["sap/m/MessageBox"]); // #18 KM
namespace FORMS {
    export let 
        model = null,
        config = null,
        items = null,
        cache = [],
        customerParent = null,
        formParent = null,
        formTitleHide = [],
        editable = true,
        bindingPath = "",
        columnTemplate = null,
        formTemplate = null,
        sessionid = null,
        validationCheck = false,
        signatures = {},
        uploadObject = null,
        colHeaders = {},
        colSorting = {},
        paginationSetup = {},
        enhancement: any = {},
		appControlModel: any = modelappControl, // AR // #18 KM
		modelAppControlName: any = Object.keys({ modelappControl })[0], // AR // #18 KM
        allFileTypes = ["bmp","doc","docx","jpg","jpeg","heic","heif","pdf","png","ppt","pptx","xls","xlsx"],
        attachmentsPromise = [],
        fileUploaders = [],
        appControl: Partial<sap.ui.model.json.JSONModel> = {},
        revalidate = false,
        bindingWrapper,
        duplicateGroups, // #54
        elementTypes = [
            { icon: "sap-icon://form",                    text: "Form",               type: "Form",             parent: true,  table: false, parameter: false, paramType: '', descripton: "Present the data in Form layout" },
            { icon: "sap-icon://table-view",              text: "Table",              type: "Table",            parent: true,  table: false, parameter: false, paramType: '', descripton: "Present the data in Table layout" },
            { icon: "sap-icon://header",                  text: "Form Title",         type: "FormTitle",        parent: false, table: false, parameter: false, paramType: '', },
            { icon: "sap-icon://calendar",                text: "Date Picker",        type: "DatePicker",       parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://date-time",               text: "Date Time Picker",   type: "DateTimePicker",   parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://fa-regular/check-square", text: "Check Box",          type: "CheckBox",         parent: false, table: true,  parameter: true,  paramType: 'boolean', },
            { icon: "sap-icon://checklist",               text: "Check List",         type: "CheckList",        parent: false, table: true,  parameter: true,  paramType: 'any[]', }, // #57 #58
            { icon: "sap-icon://request",                 text: "Input",              type: "Input",            parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://fa-regular/file-image",   text: "Image Upload",       type: "Image",            parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://add-document",            text: "File Upload",        type: "File",             parent: false, table: false, parameter: true,  paramType: 'any', },
            { icon: "sap-icon://attachment-video",        text: "Media Library Link", type: "MediaLib",         parent: false, table: false, parameter: false, paramType: '', },
            { icon: "sap-icon://message-information",     text: "Message Strip",      type: "MessageStrip",     parent: false, table: true,  parameter: false, paramType: '', },
            { icon: "sap-icon://message-popup",           text: "Message Popup",      type: "MessagePopup",     parent: false, table: true,  parameter: false, paramType: '', },
            { icon: "sap-icon://number-sign",             text: "Numeric",            type: "Numeric",          parent: false, table: true,  parameter: true,  paramType: 'number', }, // must be converted to number b4 function
            { icon: "sap-icon://picture",                 text: "Picture",            type: "Picture",          parent: false, table: false, parameter: false, paramType: '', },
            { icon: "sap-icon://feedback",                text: "Rating",             type: "Rating",           parent: false, table: true,  parameter: true,  paramType: 'number', },
            { icon: "sap-icon://numbered-text",           text: "Step Input",         type: "StepInput",        parent: false, table: true,  parameter: true,  paramType: 'number', },
            { icon: "sap-icon://switch-views",            text: "Switch",             type: "Switch",           parent: false, table: true,  parameter: true,  paramType: 'boolean', },
            { icon: "sap-icon://activities",              text: "Segmented Button",   type: "SegmentedButton",  parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://fa-solid/signature",      text: "Signature",          type: "Signature",        parent: false, table: false, parameter: false, paramType: '', },
            { icon: "sap-icon://fa-regular/circle",       text: "Single Select Icon", type: "SingleSelectIcon", parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://fa-regular/circle",       text: "Single Select",      type: "SingleSelect",     parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://fa-regular/circle",       text: "Single Choice",      type: "SingleChoice",     parent: false, table: false, parameter: true,  paramType: 'string', },
            { icon: "sap-icon://multi-select",            text: "Multiple Select",    type: "MultipleSelect",   parent: false, table: true,  parameter: true,  paramType: 'string[]', },
            { icon: "sap-icon://multi-select",            text: "Multiple Choice",    type: "MultipleChoice",   parent: false, table: false, parameter: true,  paramType: 'string[]', },
            { icon: "sap-icon://text",                    text: "Text",               type: "Text", 			parent: false, table: true,  parameter: false, paramType: '', },
            { icon: "sap-icon://document-text",           text: "Text Area",          type: "TextArea",         parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://value-help",              text: "Value Help",         type: "ValueHelp",        parent: false, table: true,  parameter: true,  paramType: 'string', },
            { icon: "sap-icon://fa-solid/calculator",     text: "Calculation",        type: "Calc",             parent: false, table: true,  parameter: true,  paramType: 'number', }, // #18 KM
        ];

    export const CONDITION_OPERATOR = Object.freeze({
        CONTAINS_ANY:     { key: "any",        title: i18nConditionOperatorContainsAny.getText() },
        CONTAINS_ALL:     { key: "all",        title: i18nConditionOperatorContainsAll.getText() },
        GREATER_THAN:     { key: ">",          title: i18nConditionOperatorGreaterThan.getText() },
        GREATER_OR_EQUAL: { key: ">=",         title: i18nConditionOperatorGreaterOrEqual.getText() },
        EQUAL:            { key: "===",        title: i18nConditionOperatorEqual.getText() },
        LOWER_OR_EQUAL:   { key: "<=",         title: i18nConditionOperatorLowerOrEqual.getText() },
        LOWER_THAN:       { key: "<",          title: i18nConditionOperatorLowerThan.getText() },
        NOT_EQUAL:        { key: "!==",        title: i18nConditionOperatorNotEqual.getText() },
        STARTS_WITH:      { key: "startsWith", title: i18nConditionOperatorStartsWith.getText() },
        CONTAINS:         { key: "contains",   title: i18nConditionOperatorContains.getText() },
        ENDS_WITH:        { key: "endsWith",   title: i18nConditionOperatorEndsWith.getText() },
        BETWEEN:          { key: "><",         title: i18nConditionOperatorBetween.getText() }, // #18 KM
        NOT_BETWEEN:      { key: "<>",         title: i18nConditionOperatorNotBetween.getText() }, // #18 KM
    });

    export function getView(): sap.ui.core.mvc.View {
        // WISH: check if there is another way to obtain the view, without using sap.n.currentView.
        // @ts-ignore
        return sap.n.currentView;
    }

    export function initAppControl () {
        if (!(FORMS.appControl instanceof sap.ui.model.json.JSONModel)) {
            FORMS.appControl = modelappControl;
            if (typeof FORMS.appControl.getData() !== "object") {
                FORMS.appControl.setData({});
            }
        }
    }

    export function updateAppControl() {
        FORMS.appControl.getData().formControl = {formEditable: FORMS.editable};
        FORMS.appControl.refresh();
    }

    export function applyBackwardCompatibility(setup) {
        function traverseNodesAndApplyBackwardCompatibility (nodes) {
            for (let node of nodes) {
                if (node.visibleFieldName && !Array.isArray(node.visibility)) {
                    const {visibleFieldName, visibleCondition, visibleValue, visibleValueFrom, visibleValueTo} = node;
                    const id = ModelData.genID();
                    node.visibility = [applyBackwardCompatibilityToValue({id, visibleFieldName, visibleCondition, visibleValue, visibleValueFrom, visibleValueTo})];
                    delete node.visibleFieldName;
                    delete node.visibleCondition;
                    delete node.visibleValue;
                    delete node.visibleValueFrom;
                    delete node.visibleValueTo;
                }
                if (Array.isArray(node.elements)) {
                    traverseNodesAndApplyBackwardCompatibility(node.elements);
                }
            }
        };
        function applyBackwardCompatibilityToValue (visibility) {
            const condObject = FORMS.getObjectFromId(visibility.visibleFieldName);
            switch(condObject.type) {
                case "MultipleSelect":
                case "MultipleChoice":
                case "CheckList":
                case "SegmentedButton":
                case "SingleSelectIcon":
                case "SingleSelect":
                case "SingleChoice":
                    if (!Array.isArray(visibility.visibleValue)) {
                        visibility.visibleValue = [visibility.visibleValue];
                    }
                    break;
                case "Numeric": // #18 KM
                case "Rating": // #18 KM
                case "StepInput": // #18 KM
                    if ([ // #18 KM
                        FORMS.CONDITION_OPERATOR.BETWEEN.key,  // #18 KM
                        FORMS.CONDITION_OPERATOR.NOT_BETWEEN.key].includes(visibility.visibleCondition)) { // #18 KM
                        visibility.visibleValue = [visibility.visibleValueFrom, visibility.visibleValueTo]; // #18 KM
                    } // #18 KM
                    break; // #18 KM
            }
            delete visibility.visibleValueFrom;
            delete visibility.visibleValueTo;

            return visibility;
        };
        if (!(Array.isArray(setup)) && setup.length) {return;}
        traverseNodesAndApplyBackwardCompatibility(setup);
    };

    export function initAdvanceFormatterConfig(options) {
        //
        // Old templates' nodes (section/element) may not have the /useFormatterConfig and /formatterConfig properties.
        // This routine adds them, if needed.
        function traverseNodes(arrayNodes) {
            for(let node of arrayNodes) {
                if (!(typeof node.useFormatterConfig === "object") && (node.useFormatterConfig !== null)) {
                    node.useFormatterConfig = {};
                }
                if (!(typeof node.formatterConfig === "object") && (node.formatterConfig !== null)) {
                    node.formatterConfig = {};
                }
                if (Array.isArray(node.elements)) {traverseNodes(node.elements);}
            }
        };
        if (Array.isArray(options?.config?.setup)) {
            traverseNodes(options.config.setup);
            FORMS.applyBackwardCompatibility(options.config.setup);
        };
    };

    export function build (parent, options) {

        let formOptions;
        let formId;

        FORMS.initAppControl();
        FORMS.initAdvanceFormatterConfig(options);
        FORMS.revalidate = false;

        if (typeof options === "string") {
            formId = options;
            formOptions = {};
        } else {
            formId = options.id;
            // formOptions = JSON.parse(JSON.stringify(options)); // #54
            formOptions = safeClone(options); // #54
        }

        if (!parent) {
            sap.m.MessageToast.show("Parent UI Container is missing in the interface");
            return;
        }

        FORMS.customerParent = parent;

        // Renderer Framework - {
        // Loops through all renderers and clears all styles
        // This prevents lingering CSS while switching between renderers
        FORMS.Renderer.clearAllStyles(FORMS.customerParent);
        // Determines which renderer to use
        FORMS.Renderer.determineRenderer(options);
        // Renderer Framework - }

        if (!formOptions.config) {
            var actions = [];
            actions.push(FORMS.apiGetForm(formId));

            Promise.all(actions).then(function (values) {
                formOptions.config = values[0];
                FORMS.buildForm(parent, formOptions);
            });
        } else {
            FORMS.buildForm(parent, formOptions);
        }
    }

    export function buildForm (parent, options) {
        if (!options.config) {
            sap.m.MessageToast.show("FORM not found");
            return;
        }

        // Cleanup if Something is wrong
        if (options.config.setup && options.config.setup.forEach) {
            options.config.setup.forEach(function (section, i) {
                section.elements = section.elements.filter((obj) => obj && Object.keys(obj).length !== 0);
                section.elements.forEach(function (element, i) {
                    if (element.elements) {
                        element.elements = element.elements.filter((obj) => obj && Object.keys(obj).length !== 0);
                    }
                });
            });
        }

        FORMS.editable = true;
        FORMS.formTitleHide = [];
        FORMS.signatures = {};
        FORMS.colHeaders = {};
        FORMS.colSorting = {};
        FORMS.paginationSetup = {};
        FORMS.config = options.config;
        FORMS.sessionid = options.sessionid;

        if (options.items) {
            FORMS.items = options.items;
        } else {
            FORMS.items = null;
        }

        // Parent
        if (!FORMS.formParent) {
            FORMS.formParent = new sap.m.Panel("_nepFormParent", {
                // @ts-ignore (ADD #1)
                backgroundDesign: "Transparent",
            }).addStyleClass("sapUiNoContentPadding");

            FORMS.formParent.onAfterRendering = function (oEvent) {
                FORMS.formTitleHide.forEach(function (fieldID) {
                    const formTitle = sap.ui.getCore().byId(fieldID);
                    const formTitleDomRef: Partial<HTMLElement> = formTitle.getDomRef();
                    if (formTitleDomRef) {
                        formTitleDomRef.style.height = "0px";
                    }
                });
            };
        } else {
            FORMS.formParent.removeAllContent();
        }

        // Model
        const formModel = new sap.ui.model.json.JSONModel();

        if (options.data) {
            if (options.completed) FORMS.editable = false;
            formModel.setData(options.data);
            modelappControl.getData().formControl = { formEditable: FORMS.editable }; // #18 KM
            modelappControl.refresh(); // #18 KM
            // formModel.oData.formEditable = FORMS.editable;
        } else {
            formModel.setData({});
        }

        FORMS.updateAppControl();
        // modelappControl.oData.formControl = {formEditable: FORMS.editable};
        // modelappControl.refresh();

        FORMS.formParent.setModel(formModel);
        if (!options.data) FORMS.setDefaultValues();
        formModel.refresh(true);

        // Binding Wrapper
        FORMS.bindingWrapper = new BindingWrapper(FORMS);
        const [DO_NOT_INCLUDE_DISABLED, INCLUDE_DISABLED] = [false, true];
        const [DO_NOT_INCLUDE_NOCODE,   INCLUDE_NOCODE  ] = [false, true];
        // Get all grouped duplications & filter them by the latest // #54
        FORMS.duplicateGroups = FORMS.bindingWrapper.Advanced.Configuration.collectOriginalDuplicateGroupsAndElements(FORMS.config.setup); // #54
        const uniqueDuplicateGroups = FORMS.duplicateGroups.reduce((bag, element) => { // #54
            bag.set(element.groupName, element);
            return bag;
        }, new Map());
        FORMS.duplicateGroups = Array.from(uniqueDuplicateGroups.values()); // #54
        // Continue with formatter engine (incl. conditional visibility) // #54
        const elementsConfig = FORMS.bindingWrapper.Advanced.Configuration.getAllConditions(DO_NOT_INCLUDE_DISABLED, INCLUDE_NOCODE);
        elementsConfig.forEach(elementConfig => 
            FORMS.bindingWrapper.Advanced.Form.createBindingFor(elementConfig, "visible", DO_NOT_INCLUDE_DISABLED, INCLUDE_NOCODE));
        FORMS.bindingWrapper.Advanced.Form.createWatchdogs(DO_NOT_INCLUDE_DISABLED, INCLUDE_NOCODE);

        // Renderer Framework - {
        let repository = FORMS.Renderer.getRepository(FORMS.Renderer.selected());
        // Sets necessary CSS to the selected rendered
        FORMS.Renderer.setStyles(FORMS.customerParent, repository);
        // Sets up necessary objects and events for the renderer
        FORMS.Renderer.setupObjectsAndEvents(FORMS.formParent, repository); // options);
        // Loads the data internally for future handling
        FORMS.Renderer.traverseSections(repository); // options);
        // Starts the first rendering
        FORMS.Renderer.executeFirstRendering(repository); // options);
        // Renderer Framework - }

        if (parent.addContent) parent.addContent(FORMS.formParent);
        if (parent.addItem) parent.addItem(FORMS.formParent);
    }

    export function parseStringToBoolean (oValue) {
        let boolAns = false;
        if (typeof oValue == "boolean") {
            boolAns = oValue;

        } else if (typeof oValue == "string") {
            if (oValue === "true") {
                boolAns = true;
            } else {
                boolAns = false;
            }
        }

        return boolAns;
    }

    // KW addition (parse "boolean strings" as boolean values) // 11.03.2024
    export function getBooleanStringType () {

        return sap.ui.model.SimpleType.extend("sap.ui.model.type.Boolean", {

            formatValue: function(oValue) {
                return FORMS.parseStringToBoolean(oValue);
            },

            parseValue:    function(oValue) { return oValue; },
            // @ts-ignore (ADD #1)
            validateValue: function(oValue) { return true;   }
        });
    }

    export function setDefaultValues () {
        const formModel = FORMS.formParent.getModel();

        const setValue = function (element) {
            const bindingField = element.fieldName ? element.fieldName : element.id;

            switch (element.type) {
                case "MultipleSelect":
                case "MultipleChoice":
                    formModel.oData[bindingField] = [];
                    break;

                case "CheckBox":
                case "Switch":
                    formModel.oData[bindingField] = false;
                    break;

                default:
                    // formModel.oData[bindingField] = ""; // #18 KM
                    // AC: Pre Populated Values // #18 KM
                    if (element.enablePrePopulated) { // #18 KM
                        FORMS.setPrePopulatedValue(element, formModel, bindingField); // #18 KM
                    } // #18 KM
                    break;
            }
        };

        // Set Default Values
        FORMS.config.setup.forEach(function (section) {
            setValue(section);
            section.elements.forEach(function (element) {
                setValue(element);
                if (element.elements) {
                    element.elements.forEach(function (subElement) {
                        setValue(subElement);
                    });
                }
            });
        });
    }

    export function buildRowTemplate (elements) {
        let newRec = { id: ModelData.genID() };

        elements.forEach(function (element, i) {
            const bindingField = element.fieldName ? element.fieldName : element.id;

            switch (element.type) {
                case "SingleChoice":
                    if (element.items && !element.noDefault && element.items.length && element.items.length > 0) {
                        const firstItem = element.items[0];
                        newRec[bindingField] = firstItem.key;
                    }
                    break;
                case "SegmentedButton":
                    // KW addition (Rendering crashes, when no items are existing in segmented button) // 17.06.2024
                    if (element.items && !element.noDefault && element.items.length && element.items.length > 0) {
                        let selectedItem = element.items[0];
                        // KW addition (default value in segmented button - wasn't implemented for tables) // 23.07.2024
                        if (element.defaultValue && element.defaultValue != "") {
                            let iKey = element.items.findIndex(e => e.key == element.defaultValue);
                            if (iKey >= 0) {
                                selectedItem = element.items[iKey];
                            }
                        }
                        newRec[bindingField] = selectedItem.key;
                    }
                    break;

                case "CheckBox":
                case "Switch":
                    newRec[bindingField] = false;
                    break;

                case "StepInput":
                    newRec[bindingField] = element.min ? parseInt(element.min) : 0;
                    break;

                default:
                    newRec[bindingField] = "";
                    // AR custom elements
                    if (typeof customFORMS !== "undefined") { // #18 KM
                        newRec[bindingField] = customFORMS.buildRowTemplateValue(element); // #18 KM
                    } // #18 KM
                    break;
            }
        });

        return newRec;
    }

    export function paginationHandle (section, sort = false, lastPage = false) {
        const tabObject = sap.ui.getCore().byId("field" + section.id);
        const tabModel: any = tabObject.getModel();
        const take = parseInt(FORMS.paginationSetup[section.id].take);

        const tableData = FORMS.paginationSetup[section.id].data;
        let filterData = FORMS.paginationSetup[section.id].filter ? FORMS.filterArray(tableData, FORMS.paginationSetup[section.id].filter) : tableData;

        let sortField = FORMS.paginationSetup[section.id].sortField;
        // Sorting
        if (sort && sortField) {
            // KW addition (Sort numerically, not only alphabetically) // 23.05.2024
            let iSect          = section.elements.findIndex(e => e.fieldName && e.fieldName == sortField);
            let numericSorting = iSect >= 0 && section.elements[iSect].type == "Numeric";
            filterData = FORMS.sortArray(filterData, sortField, numericSorting, FORMS.paginationSetup[section.id].sortOrder);
        }

        // Add RowNumber
        FORMS.tableAddRowNumber(filterData);

        // Total Number of Entries
        FORMS.paginationSetup[section.id].count = filterData.length;

        const counter: any = sap.ui.getCore().byId("counter" + section.id);
        if (counter) counter.setNumber("(" + FORMS.paginationSetup[section.id].count + ")");

        // Set Table Data
        let startIndex = take * FORMS.paginationSetup[section.id].index;

        if (startIndex === FORMS.paginationSetup[section.id].count) {
            startIndex = startIndex - take;
            FORMS.paginationSetup[section.id].index--;
        }

        tabModel.setData(filterData.slice(startIndex, startIndex + take));
        tabModel.refresh();

        // AR tablePostProcessing // #18 KM
        FORMS.tablePostProcessing(section, 0, tabModel.getData().length, tabModel.getData()); // #18 KM

        // UI Setup
        let maxIndex = filterData.length / take;
        maxIndex = Math.ceil(maxIndex);

        if (filterData.length <= take) maxIndex = 1;

        let toolPaginationFirst: any = sap.ui.getCore().byId("paginationFirst" + section.id);
        let toolPaginationPrev: any = sap.ui.getCore().byId("paginationPrev" + section.id);
        let toolPaginationNext: any = sap.ui.getCore().byId("paginationNext" + section.id);
        let toolPaginationLast: any = sap.ui.getCore().byId("paginationLast" + section.id);
        let toolPaginationPages: any = sap.ui.getCore().byId("paginationPages" + section.id);
        let toolPaginationTitle: any = sap.ui.getCore().byId("paginationTitle" + section.id);

        toolPaginationFirst.setEnabled(true);
        toolPaginationPrev.setEnabled(true);
        toolPaginationNext.setEnabled(true);
        toolPaginationLast.setEnabled(true);

        if (FORMS.paginationSetup[section.id].index < 0) FORMS.paginationSetup[section.id].index = 0;

        if (FORMS.paginationSetup[section.id].index === 0) {
            toolPaginationFirst.setEnabled(false);
            toolPaginationPrev.setEnabled(false);
        }

        if (FORMS.paginationSetup[section.id].index + 1 >= maxIndex) {
            toolPaginationNext.setEnabled(false);
            toolPaginationLast.setEnabled(false);
        }

        toolPaginationPages.destroyItems();

        let numItems = 0;
        let maxItems = 6;
        let startItem = FORMS.paginationSetup[section.id].index - maxItems / 2;

        if (startItem < 0) startItem = 0;

        for (let i: number = startItem; i < maxIndex; i++) {
            if (numItems <= maxItems) {
                // @ts-ignore (ADD #1)
                toolPaginationPages.addItem(new sap.m.SegmentedButtonItem({ text: i + 1, key: i }));
            }
            numItems++;
        }

        toolPaginationPages.setSelectedKey(FORMS.paginationSetup[section.id].index);
        toolPaginationTitle.setNumber(FORMS.paginationSetup[section.id].index + 1 + "/" + maxIndex);

        if (lastPage) {
            toolPaginationLast.firePress();
        }
    }

    export function filterArray (jsonArray, filter) {
        const result = jsonArray.filter((item) => {
            return Object.entries(item).some(([key, value]) => {
                return key !== "id" && key !== "rowNumber" && String(value).toLowerCase().includes(filter.toLowerCase());
            });
        });
        return result;
    }

    // KW addition (Sort numerically, not only alphabetically) // 23.05.2024
    export function sortArray (jsonArray, field, numeric = false, sortOrder = "Ascending") {

        const sortNumeric = (a,b) => {
            // @ts-ignore // TODO: remove @ts-ignore
            const la = parseFloat(sortOrder === "Ascending" ? a[field] : b[field]);
            // @ts-ignore // TODO: remove @ts-ignore
            const lb = parseFloat(sortOrder === "Ascending" ? b[field] : a[field]);

            // @ts-ignore // TODO: remove @ts-ignore
            if (isNaN(la) && isNaN(lb)) {
                return 0;
            }
            // @ts-ignore // TODO: remove @ts-ignore
            if (isNaN(la)) {
                return 1;
            }
            // @ts-ignore // TODO: remove @ts-ignore
            if (isNaN(lb)) {
                return -1;
            }
            // @ts-ignore // TODO: remove @ts-ignore
            return la - lb;
        };

        const sortAlphabetic = (a, b) => {
            // KW addition (interpret undefined values as empty) // 22.11.2023
            if (a[field] == undefined) {
                a[field] = "";
            }
            if (b[field] == undefined) {
                b[field] = "";
            }

            if (sortOrder === "Ascending") {
                return a[field] > b[field] ? 1 : -1;
            } else {
                return a[field] < b[field] ? 1 : -1;
            }
        };

        return numeric ? jsonArray.sort(sortNumeric) : jsonArray.sort(sortAlphabetic);
    }

    export function tableAddRowNumber (modelData) {
        for (let i = 0; i < modelData.length; i++) {
            modelData[i].rowNumber = i + 1;
        }

        return modelData;
    }

    export function buildParentForm (parent, section) {

        const sectionPanel = new sap.m.Panel(FORMS.buildElementFieldID(section), {
            headerText: section.title,
            backgroundDesign: sap.m.BackgroundDesign.Solid, // "Solid",
            visible: FORMS.buildVisibleCond(section),
            expandable: section.expandable || false,
            expanded: section.expanded || false,
        }).addStyleClass("sapUiSmallMarginTopBottom sapUiNoContentPadding");

        const sectionForm = new sap.ui.layout.form.SimpleForm({
            layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout, // "ResponsiveGridLayout",
            editable: true,
            labelSpanL: parseInt(section.labelSpan) || 4,
            labelSpanM: parseInt(section.labelSpan) || 4,
            labelSpanS: 12,
            columnsL: parseInt(section.columns) || 2,
            columnsM: parseInt(section.columns) || 2,
            // columnsM: 2, // kw: why always 2?
        }).addStyleClass("sapUiNoContentPadding");

        if (section.enableCompact) sectionForm.addStyleClass("sapUiSizeCompact");

        sectionForm.addStyleClass("FormsSimpleForm");

        sectionPanel.addContent(sectionForm);
        
        parent.addContent(sectionPanel);

        return sectionForm;
    }

    export function buildParentFormChildren (parent, element, section, index, elementField) {
        // Form Title
        if (element.type === "FormTitle") {
            parent.addContent(elementField);
            return;
        }

        let isFirst = false; // #54
        let isLast = false; // #54
        const {
            getSameDuplicateGroupElements, 
            getElementVisibleBinding, 
            isFirstDuplicateGroupElement, 
            isLastDuplicateGroupElement} = FORMS.bindingWrapper.Advanced.Configuration; // #54
        const isInDuplicateGroup = element.enableDuplicate && element.duplicateGroup; // #54
        const CSS_DUPLICATE = Object.freeze({ // #54
            TOP_LABEL: "nepGroupedDuplicateLabelTop",
            TOP_BOX: "nepGroupedDuplicateBoxTop",
            MIDDLE_LABEL: "nepGroupedDuplicateLabelMiddle",
            MIDDLE_BOX: "nepGroupedDuplicateBoxMiddle",
            BOTTOM_LABEL: "nepGroupedDuplicateLabelBottom",
            BOTTOM_BOX: "nepGroupedDuplicateBoxBottom",
            ONLY_LABEL: "nepGroupedDuplicateLabelTopBottom",
            ONLY_BOX: "nepGroupedDuplicateBoxTopBottom"
        });
        const sameGroupElements = (element.enableDuplicate) ? getSameDuplicateGroupElements(element, FORMS) : []; // #54
        const elementVisibleBinding = getElementVisibleBinding(element); // #54

        // Label
        let elementLabel; // #54
        if (element.enableLabel) {
            
            elementLabel = new sap.m.Label({ // #54
                text: element.title,
                required: element.required,
                design: sap.m.LabelDesign.Bold, // "Bold",
                visible: elementVisibleBinding, // #54
            });

            if (section.labelLeftAlign) elementLabel.addStyleClass("nepLabelLeftAlign");
            // parent.addContent(elementLabel); // #54

        } else {
            // parent.addContent(new sap.m.Label()); // #54
            elementLabel = new sap.m.Label({visible: elementVisibleBinding}); // #54
        }
        parent.addContent(elementLabel); // #54

        // Form Container
        const elementParent = new sap.m.VBox( undefined, {
            width: "100%",
            wrap: element.type == "SegmentedButton" ? sap.m.FlexWrap.NoWrap : sap.m.FlexWrap.Wrap, // "Wrap", // KW addition css fix for segmented button line beak
            visible: elementVisibleBinding, // #54
            // visible: FORMS.buildVisibleCond(element), // #54
        });

        // CSS for grouped duplicates // #54
        if (isInDuplicateGroup) { // #54
            // ------------------------------
            // CSS REARRANGE BLOCK - begin
            if (element.id === sameGroupElements[0].id) {
                if (elementVisibleBinding) {
                    // At least the first element has conditional visibility. Set it up
                    sameGroupElements[0].duplicateGroupCss = [];
                }
                else {
                    // The first element is always visible - DO NOT rearrange CSS - there is no need
                    delete sameGroupElements[0].duplicateGroupCss;
                }
            }
            if (Array.isArray(sameGroupElements[0].duplicateGroupCss)) {
                // it's in a duplicate group and it has conditional visibility - Must rearrange CSS classes if top is invisible
                sameGroupElements[0].duplicateGroupCss.push({id:element.id, label: elementLabel, box:elementParent});
                if (elementVisibleBinding) {
                    elementParent.bindProperty("visible", {
                        parts: [elementVisibleBinding.slice(1,-1)], // .slice(1,-1) => removes "{" and "}"
                        formatter: (isVisible) => {
                            if (typeof isVisible === "undefined") { return; } // initialization
                            const visibleElements = sameGroupElements.filter(elInGroup => 
                                FORMS.bindingWrapper.model.getProperty(
                                    (getElementVisibleBinding(elInGroup)??"").slice(1,-1)) !== false);
                            const groupCss = sameGroupElements[0].duplicateGroupCss;
                            if (visibleElements.length) {
                                let topElement = groupCss.find(elInGroup => elInGroup.id === visibleElements[0].id);
                                if (!topElement) {return isVisible;} // should not happen
                                topElement.label.removeStyleClass(CSS_DUPLICATE.MIDDLE_LABEL);
                                topElement.box.removeStyleClass(CSS_DUPLICATE.MIDDLE_BOX);
                                topElement.label.addStyleClass(CSS_DUPLICATE.TOP_LABEL);
                                topElement.box.addStyleClass(CSS_DUPLICATE.TOP_BOX);
                                for (let index = 1; index < visibleElements.length; index++) {
                                    let middleElement = groupCss.find(elInGroup => elInGroup.id === visibleElements[index].id);
                                    if (!middleElement) {break;} // ui5 element may have not yet been created
                                    middleElement.label.addStyleClass(CSS_DUPLICATE.MIDDLE_LABEL);
                                    middleElement.box.addStyleClass(CSS_DUPLICATE.MIDDLE_BOX);
                                    middleElement.label.removeStyleClass(CSS_DUPLICATE.TOP_LABEL);
                                    middleElement.box.removeStyleClass(CSS_DUPLICATE.TOP_BOX);
                                }
                            }
                            return isVisible;
                        }
                    })
                }
            }
            // CSS REARRANGE BLOCK - end
            // ------------------------------
            isFirst = isFirstDuplicateGroupElement(element, FORMS.duplicateGroups);
            isLast = isLastDuplicateGroupElement(element, FORMS.duplicateGroups);
            
            // The Add/Delete buttons become the last items of the group.
            switch(true) {
                case isFirst:
                    elementLabel.addStyleClass(CSS_DUPLICATE.TOP_LABEL);
                    elementParent.addStyleClass(CSS_DUPLICATE.TOP_BOX);
                    break;
                default:
                    elementLabel.addStyleClass(CSS_DUPLICATE.MIDDLE_LABEL);
                    elementParent.addStyleClass(CSS_DUPLICATE.MIDDLE_BOX);
            }
        } // #54

        elementParent.addItem(elementField);

        // Description
        if (element.enableDescription) {
            elementParent.addItem(new sap.m.Label({ text: element.description, wrapping: true }));
        }

        // Log
        if (element.enableLog) {
            elementParent.addItem(
                new sap.m.Button({
                    text: element.logButtonText || "Log",
                    type: element.logButtonType,
                    icon: element.logButtonIcon,
                    press: function (oEvent) {
                        const options = {
                            parameters: {
                                formid: FORMS.config.id,
                                elementid: element.id,
                            },
                        };

                        if (FORMS.config.enablesession) { // #18 KM
                            // @ts-ignore // #18 KM
                            options.parameters.sessionid = FORMS.sessionid; // #18 KM
                        } // #18 KM

                        apiElementLog(options).then(function (res) {
                            FORMS.buildLogDialog(res);
                        });
                    },
                }).addStyleClass("sapUiSizeCompact")
            );
        }

        parent.addContent(elementParent); // #54

        // Duplicate
        if (element.enableDuplicate && (!element.duplicateGroup || isLast)) { // #54
            const isButtonVisible:`{${string}}` = sameGroupElements.some(elInGroup=>!getElementVisibleBinding(elInGroup)) // #54
                ? "{appControl>/formControl/formEditable}"
                : `{= !!(\${appControl>/formControl/formEditable} && (false${sameGroupElements.reduce((text, elInGroup) => {
                    const visibleBindingPath = getElementVisibleBinding(elInGroup);
                    if (visibleBindingPath) { text += ` || \$${visibleBindingPath}`}
                    return text;
                }, "")})) }`;
            // @ts-ignore
            const buttonLabel = new sap.m.Label ({visible: isButtonVisible}); // #54
            // @ts-ignore
            const buttonBox = new sap.m.VBox({ // #54
                width: "100%",
                visible: isButtonVisible
            });
        // if (element.enableDuplicate/* && FORMS.editable*/) { // #54
            let buttonAddRemove;
            if (element.isDuplicate) {
                buttonAddRemove = new sap.m.Button({  // #54
                    visible: isButtonVisible, // #54
                    // visible: "{appControl>/formControl/formEditable}", // #54
                    icon: "sap-icon://delete",
                    type: sap.m.ButtonType.Reject, // "Reject",
                    press: function (oEvent) {
                        let data: any = FORMS.getData();
                        data.completed = false;

                        let parent = FORMS.getDuplicateParentFromId(element.id, data);
                        // parent.elements.splice(index, 1); // #54
                        const sameGroupElementsId = sameGroupElements.map(element => element.id); // #54
                        parent.elements = parent.elements.filter(element => !sameGroupElementsId.includes(element.id)); // #54

                        FORMS.build(FORMS.customerParent, data);
                    },
                }).addStyleClass("sapUiSizeCompact")
            } else {
                buttonAddRemove = new sap.m.Button({ // #54
                    visible: isButtonVisible, // #54
                    // visible: "{appControl>/formControl/formEditable}", // #54
                    text: element.duplicateButtonText,
                    type: element.duplicateButtonType,
                    icon: element.duplicateButtonIcon,
                    press: function (oEvent) {
                        let data: any = FORMS.getData();
                        data.completed = false;

                        const duplicateId = ModelData.genID(); // #54
                        sameGroupElements.forEach((elemInGroup, elIndex) => { // #54
                            let element = FORMS.getObjectFromId(elemInGroup.id); // #54
                            let newElement = safeClone(element); // #54
                            newElement.id = ModelData.genID();
                            newElement.isDuplicate = true;
                            newElement.duplicatedFromId = element.id;
                            newElement.duplicateId = duplicateId; // #54

                            // Object Attribute
                            if (newElement.fieldName) newElement.fieldName = newElement.fieldName + "_" + newElement.id; // #54

                            if (newElement.items) {
                                newElement.items.forEach(function (item) {
                                    item.id = ModelData.genID();
                                });
                            }

                            let parent = FORMS.getDuplicateParentFromId(element.id, data);
                            parent.elements.splice(index + elIndex + 1, 0, newElement); // #54
                        }); // #54

                        FORMS.build(FORMS.customerParent, data);
                    },
                }).addStyleClass("sapUiSizeCompact")
            }
            buttonBox.addItem(buttonAddRemove);

            if (element.duplicateGroup) { // #54
                buttonLabel.addStyleClass(CSS_DUPLICATE.BOTTOM_LABEL);
                buttonBox.addStyleClass(CSS_DUPLICATE.BOTTOM_BOX)
            }
            parent.addContent(buttonLabel); // #54
            parent.addContent(buttonBox); // #54
        }

        // parent.addContent(elementParent); // #54
    }

    export function buildVisibleCondAdvanced (element): `{${string}}` {
        if (!FORMS.bindingWrapper.formatters[element.id]?.["visible"]) {return;}
        return `{/visible/${element.id}}`;
    }
    export function buildVisibleCond (element): `{${string}}` {
        if (!(element?.enableVisibleCond || element.useFormatterConfig?.visible)) {return;}

        return buildVisibleCondAdvanced(element);
    }

    export function buildParentTable (parent, section) {
        const sectionTable = new sap.m.Table(FORMS.buildElementFieldID(section), {
            mode: section.enableDelete && modelappControl.getData().formControl.formEditable ? sap.m.ListMode.Delete : sap.m.ListMode.None, // "Delete" : "None",
            showSeparators: sap.m.ListSeparators.None,
            backgroundDesign: sap.m.BackgroundDesign.Solid, // "Solid",
            contextualWidth: "Auto",
            sticky: [sap.m.Sticky.ColumnHeaders, sap.m.Sticky.HeaderToolbar], // ["ColumnHeaders", "HeaderToolbar"],
            showNoData: false,
            delete: function (oEvent) {

                const fnDelete = () => {

                    // KW addition (enhance delete fn) // 06.09.2024
                    if (FORMS.enhancement.deleteEntry) {
                        let tableId  = section.fieldName ? section.fieldName : section.id;
                        let listItem = oEvent.getParameter("listItem").getBindingContext().getObject();
                        FORMS.enhancement.deleteEntry(tableId, listItem);
                    }

                    // @ts-ignore (ADD #1) 
                    const context = oEvent.mParameters.listItem.getBindingContext(); // WISH: (ADD #1) replace "mParameters"
                    const data = context.getObject();

                    if (section.enablePagination) {
                        const model = FORMS.paginationSetup[section.id].data;
                        ModelData.Delete(model, "id", data.id);
                        FORMS.paginationHandle(section);
                    } else {
                        const model = this.getModel();
                        ModelData.Delete(model, "id", data.id);
                        FORMS.tableAddRowNumber(model.oData);
                        // AR tablePostProcessing // #18 KM
                        FORMS.tablePostProcessing(section, 0, model.getData().length, model.getData()); // #18 KM
                    }
                }

                // KW addition (confirmation for deletion in tables) // 01.07.2024
                // if (section.enableDeleteMessage) {
                    let deleteMsg = section.deleteMessageSingle && section.deleteMessageSingle != "" ? section.deleteMessageSingle : "Do you want to delete the item?";
                    // @ts-ignore (ADD #1)
                    sap.m.MessageBox.warning(deleteMsg, {
                        actions: ["Delete", sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: "Delete",
                        styleClass: "forms_messageBoxDeleteWarning",
                        onClose: function (sAction) {
                            if (sAction == "Delete") {
                                fnDelete();
                            }
                        }
                    });
                // } else {
                //     fnDelete();
                // }
                
            },
            updateFinished: function (oEvent) {
                const counter: any = sap.ui.getCore().byId("counter" + section.id);
                if (counter) {
                    let length = 0;
                    // KW !
                    if (section.enablePagination && FORMS.paginationSetup && FORMS.paginationSetup[section.id]) {
                        length = FORMS.paginationSetup[section.id].data.length;
                    } else {
                        length = this.getModel().oData.length;
                    }
                    counter.setNumber("(" + length + ")");
                }
            },
        });

        sectionTable.addStyleClass("FormsTable");

        // Show Separators
        if (section.enableSeparators) {
            sectionTable.setShowSeparators(sap.m.ListSeparators.Inner);
        }

        // Show Alternate Row Colors
        if (section.enableAlternate) {
            sectionTable.setAlternateRowColors(true);
        }

        const sectionPanel = new sap.m.Panel("section" + section.id, {
            visible: FORMS.buildVisibleCond(section),
			width:"99%",
            // AC: Table expandable // #18 KM
            expandable: section.expandable || false, // #18 KM
            expanded: section.expanded || false, // #18 KM
        }).addStyleClass("sapUiNoContentPadding sapUiSmallMarginTopBottom");

        // Height
        if (section.height) {
            sectionPanel.setHeight(section.height + "px");
        }

        const sectionToolbar = new sap.m.Toolbar().addStyleClass("sapUiSizeCompact");

        sectionToolbar.addContent(
            new sap.m.Title({
                text: section.title,
            })
        );

        sectionToolbar.addContent(
            new sap.m.ObjectNumber("counter" + section.id, {
                number: "(0)",
            })
        );

        sectionToolbar.addContent(new sap.m.ToolbarSpacer());

        // Search Bar
        if (section.enableFilter) {
            sectionToolbar.addContent(
                new sap.m.SearchField({
                    liveChange: function (oEvent) {
                        FORMS.handleTableFilter(section, sectionTable, this.getValue());
                    },
                }).addStyleClass("maxWidth")
            );
        }

        // KW addition (add init. sort button) // 28.11.2023
        sectionToolbar.addContent(
            new sap.m.Button({
                text: "Init. sort",
                type: sap.m.ButtonType.Emphasized, // "Emphasized",
                press: function (oEvent) {
                    // Clear All
                    const keys = Object.keys(FORMS.colHeaders[section.id]);
                    keys.forEach(function (key) {
                        FORMS.colHeaders[section.id][key].setSortIndicator("None");
                    });

                    const bindingField = "initsort";

                    if (section.enablePagination) {
                        FORMS.paginationSetup[section.id].sortOrder = "Ascending";
                        FORMS.paginationSetup[section.id].sortField = bindingField;

                        FORMS.paginationHandle(section, true, false);
                    } else {
                        FORMS.handleColumnSorting(sectionTable, bindingField, false);
                    }
                },
            })
        );

        // Enable Add
        if (section.enableCreate/* && FORMS.editable*/) {
            sectionToolbar.addContent(
                new sap.m.Button({
                    visible: "{appControl>/formControl/formEditable}",
                    text: "Add",
                    type: sap.m.ButtonType.Emphasized, // "Emphasized",
                    press: function (oEvent) {
                        var newRec: any = FORMS.buildRowTemplate(section.elements);

                        if (section.enablePagination) {
                            const model = FORMS.paginationSetup[section.id].data;
                            newRec.initsort = model.length + 1;
                            model.push(newRec);
                            FORMS.paginationHandle(section, false, true);
                        } else {
                            const model: any = sectionTable.getModel();
                            newRec.initsort = model.oData.length + 1;
                            model.oData.push(newRec);
                            FORMS.tableAddRowNumber(model.oData);
                            model.refresh();

                            // AR tablePostProcessing // #18 KM
                            FORMS.tablePostProcessing(section, model.getData().length - 1, model.getData().length); // #18 KM
                        }

                        // KW addition (enhance add fn) // 08.08.2024
                        if (FORMS.enhancement.addEntry) {
                            let tableId = section.fieldName ? section.fieldName : section.id;
                            FORMS.enhancement.addEntry(tableId);
                        }
                    },
                })
            );
        }

        const butMultiSwitch = new sap.m.Button({
            icon: "sap-icon://multiselect-all",
            type: sap.m.ButtonType.Transparent, // "Transparent",
            tooltip: "Switch to multi select",
            enabled: "{appControl>/formControl/formEditable}",
            visible: true,
            press: function (oEvent) {
                sectionTable.setMode(sap.m.ListMode.MultiSelect); // ("MultiSelect");
                butSingleSwitch.setVisible(true);
                butMultiDelete.setVisible(true);
                butMultiSwitch.setVisible(false);
            },
        }).addStyleClass("sapUiSizeCompact");

        const butSingleSwitch = new sap.m.Button({
            icon: "sap-icon://multiselect-none",
            type: sap.m.ButtonType.Transparent, // "Transparent",
            tooltip: "Switch to single select",
            enabled: "{appControl>/formControl/formEditable}",
            visible: false,
            press: function (oEvent) {
                sectionTable.setMode(sap.m.ListMode.Delete); // ("Delete");
                butSingleSwitch.setVisible(false);
                butMultiDelete.setVisible(false);
                butMultiSwitch.setVisible(true);
            },
        }).addStyleClass("sapUiSizeCompact");

        const fieldID = section.fieldName ? section.fieldName : section.id;

        const butMultiDelete = new sap.m.Button({
            icon: "sap-icon://delete",
            type: sap.m.ButtonType.Reject, // "Reject",
            enabled: "{appControl>/formControl/formEditable}",
            visible: false,
            press: function (oEvent) {
                // @ts-ignore (ADD #1)
                const tabData = section.enablePagination ? FORMS.paginationSetup[section.id].data : sectionTable.getModel().oData;
                const selectedItems = sectionTable.getSelectedItems();
                const items = [];

                const fnPress = () => {
                    
                    if (selectedItems) {
                        selectedItems.forEach(function (item) {
                            const context = item.getBindingContext();
                            if (context) {
                                const data: any = context.getObject();
                                items.push(data);
                                data.delete = true;
                            }
                        });

                        if (FORMS.enhancement.multiDelete) {
                            FORMS.enhancement.multiDelete(fieldID, items);
                        }

                        ModelData.Delete(tabData, "delete", true);
                    }

                    if (section.enablePagination) {
                        FORMS.paginationHandle(section);
                    } else {
                        sectionTable.getModel().refresh();
                    }

                    sectionTable.removeSelections();
                };


                // KW addition (confirmation for deletion in tables) // 01.07.2024
                if (selectedItems.length > 0) {
                    // if (section.enableDeleteMessage) {
                        let deleteMsg = section.deleteMessageMulti && section.deleteMessageMulti != "" ? section.deleteMessageMulti : "Do you want to delete the selected items?";//"Do you want to delete " + selectedItems.length + " items?";
                
                        // @ts-ignore (ADD #1)
                        sap.m.MessageBox.warning(deleteMsg , { //"Do you want to delete " + selectedItems.length + " item(s)?", {
                            actions: ["Delete", sap.m.MessageBox.Action.CANCEL],
                            emphasizedAction: "Delete",
                            styleClass: "forms_messageBoxDeleteWarning",
                            onClose: function (sAction) {
                                if (sAction == "Delete") {
                                    fnPress();
                                }
                            }
                        });
                    // } else  {
                    //     fnPress();
                    // }
                }

            },
        }).addStyleClass("sapUiSizeCompact");

        sectionPanel.setHeaderToolbar(sectionToolbar);

        // Enable Delete
        if (section.enableDelete/* && FORMS.editable*/) {
            //sectionTable.setMode("{= ${/formEditable} ? 'Delete' : 'None}");//"Delete");
            sectionToolbar.addContent(new sap.m.ToolbarSeparator());
            sectionToolbar.addContent(butMultiDelete);
            sectionToolbar.addContent(butMultiSwitch);
            sectionToolbar.addContent(butSingleSwitch);
        }

        if (section.enableCompact) sectionTable.addStyleClass("sapUiSizeCompact");

        const columListItem = new sap.m.ColumnListItem({
            highlight: "{highlight}",
        });

        columListItem.bindProperty("highlight", {
            parts: ["highlight"],
            formatter: function (highlight) {
                if (typeof highlight === "undefined" || highlight === "" || highlight === null) {
                    return null;
                }
                return highlight;
            },
        });

        if (section.vAlign) columListItem.setVAlign(section.vAlign);

        // Enable Copy
        if (section.enableCopy/* && FORMS.editable*/) {
            const newColumn = new sap.m.Column({ width: "50px" });

            sectionTable.addColumn(newColumn);

            columListItem.addCell(
                new sap.m.Button({
                    visible: "{appControl>/formControl/formEditable}",
                    icon: "sap-icon://copy",
                    type: sap.m.ButtonType.Transparent, // "Transparent",
                    press: function (oEvent) {
                        // @ts-ignore (ADD #1)
                        const context = oEvent.oSource.getBindingContext();
                        const data = context.getObject();
                        FORMS.buildCopyDialog(section, columListItem, section.id, data.id);
                    },
                })
            );
        }

        // Show Row Number
        if (section.enableRowNumber) {
            const colRowNumber = new sap.m.Column({ width: "30px"/*, sortIndicator: "Ascending"*/, hAlign: sap.ui.core.TextAlign.Center /*"Center"*/ });

            if (!section.enablePagination) {
                colRowNumber.setHeader(new sap.m.Label({ text: "" }));
                // FORMS.setColumnSorting(section, sectionTable, colRowNumber, { id: "rowNumber" });
            }

            sectionTable.addColumn(colRowNumber);
            columListItem.addCell(new sap.m.ObjectNumber({ number: "{rowNumber}" }));
        }

        // KW Render the Table in a scrollcontainer, otherwise the horizontal scrollbar was not visible
        const sectionScroll = new sap.m.ScrollContainer("sectionScroll" + section.id, {
            visible: FORMS.buildVisibleCond(section)
        }).addStyleClass("sapUiNoContentPadding sapUiSmallMarginTopBottom scrollContTable");

        sectionScroll.addContent(sectionTable);
        sectionPanel.addContent(sectionScroll);

        // sectionPanel.addContent(sectionTable);

        parent.addContent(sectionPanel);
        FORMS.columnTemplate = columListItem;

        // Table Layout
        if (section.layout === "form") {
            FORMS.formTemplate = new sap.ui.layout.form.SimpleForm({
                layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout, // "ResponsiveGridLayout",
                backgroundDesign: sap.m.BackgroundDesign.Transparent, // "Transparent",
                editable: true,
                labelSpanL: parseInt(section.labelSpan) || 4,
                labelSpanM: parseInt(section.labelSpan) || 4,
                labelSpanS: 12,
                columnsL: parseInt(section.columns) || 2,
                columnsM: 2,
            }).addStyleClass("sapUiNoContentPadding");

            const colForm = new sap.m.Column();
            sectionTable.addColumn(colForm);
            columListItem.addCell(FORMS.formTemplate);
        } else {
            // Popin
            if (section.popin && sectionTable.setAutoPopinMode) {
                sectionTable.setAutoPopinMode(true);
            }
        }

        // Pagination
        if (section.enablePagination) {
            const toolPagination = new sap.m.Toolbar({ width: "100%", design: sap.m.ToolbarDesign.Transparent /*"Transparent"*/ }).addStyleClass("sapUiSizeCompact ");

            toolPagination.addContent(
                new sap.m.Text({
                    textAlign: sap.ui.core.TextAlign.Center, // "Center",
                    text: "Items per page",
                }).addStyleClass("sapUiHideOnPhone")
            );

            var toolPaginationShowItems = new sap.m.Select({
                width: "100px",
                selectedKey: "",
                change: function (oEvent) {
                    FORMS.paginationSetup[section.id].take = this.getSelectedKey();
                    FORMS.paginationSetup[section.id].index = 0;
                    FORMS.paginationHandle(section);
                },
            }).addStyleClass("sapUiHideOnPhone");

            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: "Default", key: section.paginationTake || 2 }));
            // WISH: (ADD #1) convert the numbers to string and test. { text:string, key: string } seems to be the correct signature
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 1, key: 1 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 5, key: 5 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 10, key: 10 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 15, key: 15 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 20, key: 20 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 30, key: 30 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 40, key: 40 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 50, key: 50 }));
            // @ts-ignore (ADD #1)
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 100, key: 100 }));

            toolPagination.addContent(toolPaginationShowItems);

            toolPagination.addContent(new sap.m.ToolbarSpacer());

            toolPagination.addContent(
                new sap.m.Button("paginationFirst" + section.id, {
                    icon: "sap-icon://fa-solid/angle-double-left",
                    press: function (oEvent) {
                        FORMS.paginationSetup[section.id].index = 0;
                        FORMS.paginationHandle(section);
                    },
                })
            );

            toolPagination.addContent(
                new sap.m.Button("paginationPrev" + section.id, {
                    icon: "sap-icon://fa-solid/angle-left",
                    press: function (oEvent) {
                        FORMS.paginationSetup[section.id].index--;
                        FORMS.paginationHandle(section);
                    },
                })
            );

            const toolPaginationPages = new sap.m.SegmentedButton("paginationPages" + section.id, {
                selectionChange: function (oEvent) {
                    FORMS.paginationSetup[section.id].index = parseInt(this.getSelectedKey());
                    FORMS.paginationHandle(section);
                },
            });

            toolPagination.addContent(toolPaginationPages);

            const toolPaginationText = new sap.m.Text({ visible: false, textAlign: sap.ui.core.TextAlign.Center /*"Center"*/, text: "0/0" });

            toolPagination.addContent(toolPaginationText);

            toolPagination.addContent(
                new sap.m.Button("paginationNext" + section.id, {
                    icon: "sap-icon://fa-solid/angle-right",
                    press: function (oEvent) {
                        FORMS.paginationSetup[section.id].index++;
                        FORMS.paginationHandle(section);
                    },
                })
            );

            toolPagination.addContent(
                new sap.m.Button("paginationLast" + section.id, {
                    icon: "sap-icon://fa-solid/angle-double-right",
                    press: function (oEvent) {
                        let maxIndex = FORMS.paginationSetup[section.id].count / parseInt(FORMS.paginationSetup[section.id].take);
                        maxIndex = Math.ceil(maxIndex);

                        FORMS.paginationSetup[section.id].index = maxIndex - 1;
                        FORMS.paginationHandle(section);
                    },
                })
            );

            toolPagination.addContent(new sap.m.ToolbarSeparator());

            const toolPaginationTitle = new sap.m.ObjectNumber("paginationTitle" + section.id, {});

            toolPagination.addContent(toolPaginationTitle);

            sectionPanel.setInfoToolbar(toolPagination);
        }

        // Enable Add
        if (section.enableCreate/* && FORMS.editable*/) {
            
            sectionPanel.addContent(
                new sap.m.Button({
                    visible: "{appControl>/formControl/formEditable}",
                    text: "Add",
                    type: sap.m.ButtonType.Emphasized, // "Emphasized",
                    press: function (oEvent) {
                        var newRec = FORMS.buildRowTemplate(section.elements); // #18 KM

                        if (section.enablePagination) {
                            const model = FORMS.paginationSetup[section.id].data;
                            // @ts-ignore
                            newRec.initsort = model.length + 1; // #18 KM
                            model.push(newRec); // #18 KM
                            // model.push({ id: ModelData.genID(), initsort: model.length + 1 }); // #18 KM
                            FORMS.paginationHandle(section, false, true);
                        } else {
                            const model: any = sectionTable.getModel();
                            model.oData.push({ id: ModelData.genID(), initsort: model.oData.length + 1 });
                            FORMS.tableAddRowNumber(model.oData);
                            model.refresh();

                            // AR tablePostProcessing // #18 KM
                            FORMS.tablePostProcessing(section, model.getData().length - 1, model.getData().length); // #18 KM
                        }
                        
                        // KW addition (enhance add fn) // 08.08.2024
                        if (FORMS.enhancement.addEntry) {
                            let tableId = section.fieldName ? section.fieldName : section.id;
                            FORMS.enhancement.addEntry(tableId);
                        }
                    },
                }).addStyleClass("sapUiSizeCompact sapUiSmallMargin")
            );
        }

        return sectionTable;
    }

    export function setColumnSorting (section, table, column, element) {
        var _column_delegate = {
            onclick: function (e) {
                const sortIndicatorOrder = column.getSortIndicator();
                let sortModelOrder;

                // Clear All
                const keys = Object.keys(FORMS.colHeaders[section.id]);

                keys.forEach(function (key) {
                    FORMS.colHeaders[section.id][key].setSortIndicator("None");
                });

                if (sortIndicatorOrder === "Ascending") {
                    column.setSortIndicator("Descending");
                    sortModelOrder = true;
                } else {
                    column.setSortIndicator("Ascending");
                    sortModelOrder = false;
                }

                const bindingField = element.fieldName ? element.fieldName : element.id;

                if (section.enablePagination) {
                    FORMS.paginationSetup[section.id].sortOrder = column.getSortIndicator();
                    FORMS.paginationSetup[section.id].sortField = bindingField;

                    FORMS.paginationHandle(section, true, false);
                } else {
                    FORMS.handleColumnSorting(table, bindingField, sortModelOrder, element.type);
                }
            },
        };

        column.addEventDelegate(_column_delegate);

        column.exit = function () {
            column.removeEventDelegate(_column_delegate);
        };

        column.setStyleClass("nepMTableSortCell");

        if (!FORMS.colHeaders[section.id]) FORMS.colHeaders[section.id] = {};
        FORMS.colHeaders[section.id][column.sId] = column;
    }

    export function handleColumnSorting (table, bindingField, sortModelOrder, type?) {
		// TODO: check the code in KM's counterpart, in case the column sort malfunctions
        const model = table.getModel();
        model.oData = FORMS.sortArray(model.oData, bindingField, type && type == "Numeric", sortModelOrder ? "Descending" : "Ascending");
        FORMS.tableAddRowNumber(model.oData);
        model.refresh();
    }

    export function handleTableFilter (section, table, value) {
        if (section.enablePagination) {
            FORMS.paginationSetup[section.id].filter = value;
            FORMS.paginationHandle(section);
        } else {
            const binding = table.getBinding("items");
            const filters = [];

            if (FORMS.colSorting[table.sId] && FORMS.colSorting[table.sId].forEach) {
                FORMS.colSorting[table.sId].forEach(function (element) {
                    const bindingField = element.fieldName ? element.fieldName : element.id;

                    switch (element.type) {
                        case "CheckBox":
                        case "Switch":
                        case "StepInput":
                        case "Image":
                            break;

                        default:
                            filters.push(new sap.ui.model.Filter(bindingField, sap.ui.model.FilterOperator.Contains /*"Contains"*/, value));
                            break;
                    }
                });
            }

            const filter = new sap.ui.model.Filter({
                filters: filters,
                and: false,
            });

            binding.filter([filter]);
        }
    }

    export function buildCopyDialog (section, columListItem, tableId, rowId) {
        const diaCopy = new sap.m.Dialog({
            draggable: true,
            contentHeight: "800px",
            contentWidth: "800px",
            stretch: sap.ui.Device.system.phone,
            title: "Copy Data",
            afterOpen: function (oEvent) {
                document.addEventListener("click", function closeDialog(oEvent) {
                    // @ts-ignore (ADD #1)
                    if (oEvent.target.id === "sap-ui-blocklayer-popup") {
                        diaCopy.close();
                        document.removeEventListener("click", closeDialog);
                    }
                });
            },
        }).addStyleClass("sapUiContentPadding");

        const bindingField = section.fieldName ? section.fieldName : section.id;
        const table = sap.ui.getCore().byId("field" + tableId);
        // @ts-ignore (ADD #1)
        const tableData = FORMS.getData().data[bindingField];
        const rowData: any = ModelData.FindFirst(tableData, "id", rowId);

        // KW addition (add row numbers) // 13.11.2023
        diaCopy.setEndButton(
            new sap.m.Button({
                type: sap.m.ButtonType.Transparent, // "Transparent",
                text: "Close",
                press: function (oEvent) {
                    // ------
                    let model = table.getModel();
                    // @ts-ignore (ADD #1)
                    FORMS.tableAddRowNumber(model.oData);
                    model.refresh();
                    // ------
                    diaCopy.close();
                },
            }).addStyleClass("sapUiSizeCompact")
        );

        const maxEntries = 1000;
        const newData = section.enablePagination ? FORMS.paginationSetup[section.id].data : tableData;
        const maxCopyEntries = maxEntries - newData.length;

        diaCopy.setBeginButton(
            new sap.m.Button({
                type: sap.m.ButtonType.Emphasized, // "Emphasized",
                text: "OK",
                press: function (oEvent) {
                    let numEntriesCopy = numCopy.getValue();

                    if (numEntriesCopy > maxCopyEntries) {
                        numEntriesCopy = maxCopyEntries;
                    }

                    for (let i = 0; i < numEntriesCopy; i++) {
                        let newRow: any = {
                            id: ModelData.genID(),
                        };

                        for (var key in rowData) {
                            if (key !== "id") {
                                const element: any = sap.ui.getCore().byId("include-" + key);
                                if (element) {
                                    const selected = element.getSelected();
                                    if (selected) newRow[key] = rowData[key];
                                }
                            }
                        }

                        // KW addition (add init. sort value) // 28.11.2023
                        newRow.initsort = newData.length + 1;
                        newData.push(newRow);
                    }

                    if (section.enablePagination) {
                        FORMS.paginationHandle(section);
                    } else {
                        let model: any = table.getModel();
                        FORMS.tableAddRowNumber(model.oData);
                        model.refresh();

                        // AR tablePostProcessing // #18 KM
                        let toIndex = model.getData().length; // #18 KM
                        let fromIndex = toIndex - numEntriesCopy - 1; // #18 KM
                        FORMS.tablePostProcessing(section, fromIndex, toIndex, model.getData()); // #18 KM
                    }

                    // KW addition (enhance copy fn) // 08.08.2024
                    if (FORMS.enhancement.copyEntry) {
                        let tableId = section.fieldName ? section.fieldName : section.id;
                        FORMS.enhancement.copyEntry(tableId, numEntriesCopy);
                    }

                    diaCopy.close();
                },
            }).addStyleClass("sapUiSizeCompact")
        );

        const panCopies = new sap.m.Panel();
        panCopies.addContent(new sap.m.Title({ text: "Number of copies" }));
        const numCopy = new sap.m.StepInput({ width: "100%", min: 1, max: maxCopyEntries, value: 1 }).addStyleClass("sapUiSmallMarginBottom").addStyleClass("textCentered");
        const numInfo = new sap.m.MessageStrip({ text: "Max entries to copy is: " + maxCopyEntries });

        numCopy.onAfterRendering = function () {
            let elem = this.getDomRef();
            if (elem) {
                let input = elem.childNodes[0].childNodes[0].childNodes[1];
                if (input) input.setAttribute("type", "number");
            }
        };

        panCopies.addContent(numCopy);
        panCopies.addContent(numInfo);
        diaCopy.addContent(panCopies);

        const tabCopy = new sap.m.Table({
            showSeparators: sap.m.ListSeparators.Inner,
            backgroundDesign: sap.m.BackgroundDesign.Transparent, // "Transparent",
        });

        if (tabCopy.setAutoPopinMode) {
            tabCopy.setAutoPopinMode(true);
        }

        let cells;

        if (section.layout === "form") {
            cells = section.enableRowNumber ? columListItem.getCells()[2].getContent() : columListItem.getCells()[1].getContent();
        } else {
            cells = columListItem.getCells();
        }

        tabCopy.addColumn(new sap.m.Column({ width: "100px" }).setHeader(new sap.m.Label({ text: "Include", design: sap.m.LabelDesign.Bold /*"Bold"*/ })));
        tabCopy.addColumn(new sap.m.Column({ width: "200px" }).setHeader(new sap.m.Label({ text: "Field", design: sap.m.LabelDesign.Bold /*"Bold"*/ })));
        tabCopy.addColumn(new sap.m.Column({ width: "100%" }).setHeader(new sap.m.Label({ text: "Content", design: sap.m.LabelDesign.Bold /*"Bold"*/ })));

        for (let i = 1; i < cells.length; i++) {
            let fieldId = cells[i].sId.split("field")[1];
            if (!fieldId) continue;

            const columListItem = new sap.m.ColumnListItem();
            tabCopy.addItem(columListItem);

            const clone = cells[i].clone();
            const element = FORMS.getObjectFromId(fieldId);

            if (clone.setEditable) {
                clone.setEditable(false);
            } else if (clone.setEnabled) {
                clone.setEnabled(false);
            }

            // If Object Attribute -> Change to fieldname
            if (element.fieldName) fieldId = element.fieldName;

            columListItem.addCell(new sap.m.CheckBox("include-" + fieldId, { selected: true }));
            columListItem.addCell(new sap.m.Text({ text: element.title }));

            if (clone.setWidth) clone.setWidth("100%");

            switch (element.type) {
                case "SingleChoice":
                    const selectedKey = rowData[fieldId];
                    const selectedItem: any = ModelData.FindFirst(element.items, "key", selectedKey);

                    if (selectedItem) {
                        const buttons = clone.getButtons();
                        buttons.forEach(function (button, index) {
                            if (button.getText() === selectedItem.title) {
                                button.setSelected(true);
                            }
                        });
                    }

                    break;

                case "MultipleChoice":
                    break;

                case "MultipleSelect":
                    clone.setSelectedKeys(rowData[fieldId]);
                    break;

                case "Switch":
                    clone.setState(rowData[fieldId]);
                    break;

                case "Image":
                    if (element.enableMulti) {
                        clone.getItems()[0].getHeaderToolbar().getContent()[0].setEnabled(false);
                    } else {
                        clone.getItems()[1].setVisible(false);
                        clone.getItems()[0].getItems()[0].setEnabled(false);
                        clone.getItems()[0].getItems()[1].setVisible(false);
                    }
                    break;

                case "CheckBox":
                    clone.setSelected(rowData[fieldId]);
                    break;

                case "SegmentedButton":
                case "SingleSelect":
                case "SingleSelectIcon":
                    clone.setSelectedKey(rowData[fieldId]);
                    break;

                default:
                    if (clone.setValue) clone.setValue(rowData[fieldId]);
                    break;
            }

            columListItem.addCell(clone);
        }

        diaCopy.addContent(tabCopy);

        diaCopy.open();
    }

    export function buildLogDialog (res) {
        const diaLog = new sap.m.Dialog({
            draggable: true,
            contentHeight: "800px",
            contentWidth: "800px",
            title: "Log History",
            afterOpen: function (oEvent) {
                document.addEventListener("click", function closeDialog(oEvent) {
                    // @ts-ignore (ADD #1)
                    if (oEvent.target.id === "sap-ui-blocklayer-popup") {
                        diaLog.close();
                        document.removeEventListener("click", closeDialog);
                    }
                });
            },
        }).addStyleClass("sapUiContentPadding");

        diaLog.setEndButton(
            new sap.m.Button({
                type: sap.m.ButtonType.Transparent, // "Transparent",
                text: "Close",
                press: function (oEvent) {
                    diaLog.close();
                },
            }).addStyleClass("sapUiSizeCompact")
        );

        const currentEditable = FORMS.editable;
        const currentFormParent = FORMS.formParent;
        const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance();

        FORMS.editable = false;

        for (let i = 0; i < res.length; i++) {
            const element = res[i];

            const formParent = new sap.ui.layout.form.SimpleForm({
                layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout, // "ResponsiveGridLayout",
                editable: true,
                labelSpanL: 12,
                labelSpanM: 12,
                labelSpanS: 12,
                columnsL: 2,
                columnsM: 2,
            });

            const formModel = new sap.ui.model.json.JSONModel();
            formModel.setData(element.data);
            formParent.setModel(formModel);

            // Change Element Properties for Log
            delete element.config.enableLog;
            delete element.config.visibleFieldName; // #18 KM

            element.config._inDialog = true;

            let updatedAtValue = element.updatedAt;
            if (typeof updatedAtValue === "string") updatedAtValue = parseInt(updatedAtValue);

            const updatedAt = oDateFormat.format(new Date(updatedAtValue));

            FORMS.formParent = formParent;
            FORMS.buildElement(formParent, element.config, { type: "Form" }, i);

            var panel = new sap.m.Panel({
                backgroundDesign: sap.m.BackgroundDesign.Solid, // "Solid",
                headerText: updatedAt + " - " + element.updatedBy,
            });
            panel.addContent(formParent);

            diaLog.addContent(panel);
        }

        FORMS.bindingPath = "/";
        FORMS.editable = currentEditable;
        FORMS.formParent = currentFormParent;

        diaLog.open();
    }

    export function buildParentTableChildren (parent, element, section, index, elementField) {
        if (section.layout === "form") {
            // Column Title
            if (section.widths) {
                const widths = section.widths[index];
                if (widths && widths.columnTitle) {
                    FORMS.formTemplate.addContent(new sap.ui.core.Title({ text: widths.columnTitle }));
                }
            }

            const elementLabel = new sap.m.Label({ text: element.title });
            if (section.labelLeftAlign) elementLabel.addStyleClass("nepLabelLeftAlign");

            FORMS.formTemplate.addContent(elementLabel);
            FORMS.formTemplate.addContent(elementField);
        } else {
            const newColumn = new sap.m.Column({});

            if (section.popin) {
                newColumn.setDemandPopin(true);
                newColumn.setPopinDisplay(sap.m.PopinDisplay.Block); // ("Block");
            }

            // Column Width
            if (section.widths) {
                const widths = section.widths[index];
                if (widths) {
                    if (widths.width) {
                        if (widths.widthMetric) {
                            newColumn.setWidth(widths.width + "%");
                        } else {
                            newColumn.setWidth(widths.width + "px");
                        }
                    } else {
                        newColumn.setWidth("150px");
                    }
                
                // KW addition (fields in table with no width are not displayed) // 29.05.2024
                } else { newColumn.setWidth("150px"); }
            }

            // Column Header
            newColumn.setHeader(
                new sap.m.Label(FORMS.buildElementFieldID(element), {
                    text: element.title,
                    required: element.required,
                    design: sap.m.LabelDesign.Bold // "Bold",
                })
            );

            parent.addColumn(newColumn);
            FORMS.columnTemplate.addCell(elementField);
            FORMS.setColumnSorting(section, parent, newColumn, element);
        }

        // Filter
        switch (element.type) {
            case "CheckBox":
            case "Switch":
            case "SegmentedButton":
            case "Image":
                break;

            default:
                if (!FORMS.colSorting[parent.sId]) FORMS.colSorting[parent.sId] = [];
                FORMS.colSorting[parent.sId].push(element);
                break;
        }
    }

    export function buildElement (parent, element, section, index) {
        let elementField;

        if (element.disabled) return;

        switch (element.type) {
            case "FormTitle":
                elementField = FORMS.buildElementFormTitle(element);
                break;

            case "MessageStrip":
                elementField = FORMS.buildElementMessageStrip(element);
                break;

            case "MessagePopup":
                elementField = FORMS.buildElementMessagePopup(element, true);
                break;

            case "Text":
                elementField = FORMS.buildElementText(element);
                break;

            case "TextArea":
                elementField = FORMS.buildElementTextArea(element);
                break;

            case "Signature":
                elementField = FORMS.buildElementSignature(element);
                break;

            case "SegmentedButton":
                elementField = FORMS.buildElementSegmentedButton(element, section);
                break;

            case "StepInput":
                elementField = FORMS.buildElementStepInput(element);
                break;

            case "Switch":
                elementField = FORMS.buildElementSwitch(element);
                break;

            case "Rating":
                elementField = FORMS.buildElementRating(element);
                break;

            case "CheckBox":
                elementField = FORMS.buildElementCheckBox(element);
                break;

            case "Numeric":
                elementField = FORMS.buildElementNumeric(element);
                break;

            case "Picture":
                elementField = FORMS.buildElementPicture(element);
                break;

            case "SingleSelectIcon":
                elementField = FORMS.buildElementSingleSelectIcon(element);
                break;

            case "SingleSelect":
                elementField = FORMS.buildElementSingleSelect(element);
                break;

            case "SingleChoice":
                elementField = FORMS.buildElementSingleChoice(element);
                break;

            case "MultipleSelect":
                elementField = FORMS.buildElementMultipleSelect(element);
                break;

            case "MultipleChoice":
                elementField = FORMS.buildElementMultipleChoice(element);
                break;

            case "DatePicker":
                elementField = FORMS.buildElementDatePicker(element);
                break;

            case "Image":
                elementField = FORMS.buildElementImage(element, parent);
                break;

            case "File":
                elementField = FORMS.buildElementFile(element, parent);
                break;

            case "MediaLib":
                elementField = FORMS.buildElementMediaLib(element); // Paulo: function doesn't use parent // (element, parent);
                break;

            case "DateTimePicker":
                elementField = FORMS.buildElementDateTimePicker(element);
                break;

            case "CheckList":
                elementField = FORMS.buildElementCheckList(element);
                break;

            case "Input":
                elementField = FORMS.buildElementInput(element);
                break;

            case "ValueHelp":
                elementField = FORMS.buildElementValueHelp(element);
                break;

            // Map Custom Control // #18 KM
            case "Map": // #18 KM
                elementField = FORMS.buildElementMap(element); // #18 KM
                break; // #18 KM

            // AR Calculation // #18 KM
            case "Calc": // #18 KM
                elementField = FORMS.buildElementCalc(element); // #18 KM
                break; // #18 KM

            default:
                // AR custom elements // #18 KM
                if (typeof customFORMS !== "undefined") { // #18 KM
                    elementField = customFORMS.buildCustomElement(element); // #18 KM
                } // #18 KM
                break;
        }

        if (!elementField) return;

        // Custom CSS
        if (elementField.addStyleClass) elementField.addStyleClass("FormsInput");

        if (element.hasInfoButton && element.type != "FormTitle") {
            // FormTitle is being handled individually in the buildelementformtitle

            let hbox = new sap.m.HBox().addStyleClass("formsHboxInfoButton");
            hbox.addItem(elementField);
            hbox.addItem(FORMS.buildElementMessagePopup(element, false));
            
            elementField = hbox;
        }

        switch (section.type) {
            case "Form":
                FORMS.buildParentFormChildren(parent, element, section, index, elementField);
                break;

            case "Table":
                FORMS.buildParentTableChildren(parent, element, section, index, elementField);
                break;

            default:
                break;
        }
    }

    export function buildElementFieldID (element) {
        if (element._inDialog) {
            return "log" + ModelData.genID();
        } else {
            return "field" + element.id;
        }
    }

    //Map Custom Control  // #18 KM
    export function buildElementMap (element) {  // #18 KM
        $("head").append(`<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />`);
        // @ts-ignore
        jQuery.sap.includeScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");

        const bindingField = element.fieldName ? element.fieldName : element.id;

        // Used when the location is returned so we can populate the field
        // @ts-ignore
        _mapBindingField = bindingField;

        var elementID = FORMS.buildElementFieldID(element);
        var vboxMapControl = new sap.m.VBox(elementID, {});
        var vboxMap = new sap.m.VBox("vboxMap", { height: "200px" });
        var inpMapLocation = new sap.m.Input("inpMapLocation", { value: "{" + FORMS.bindingPath + bindingField + "}", editable: false });
        vboxMapControl.addItem(vboxMap);
        vboxMapControl.addItem(inpMapLocation);
        //CE debugger;
        // @ts-ignore
        _MapCoordinatesSet = false;

        if (!element.mapVisible) {
            vboxMap.setVisible(false);
        }

        if (element.width) {
            if (element.widthMetric) {
                vboxMap.setWidth(element.width + "%");
            } else {
                vboxMap.setWidth(element.width + "px");
            }
        }

        if (element.height) {
            if (element.heightMetric) {
                vboxMap.setHeight(element.height + "%");
            } else {
                vboxMap.setHeight(element.height + "px");
            }
        }

        if (element.mapVisible) {
            // @ts-ignore
            _mapRenderedDelegate = {
                onAfterRendering: function () {
                    // console.log("Map Render Event");
                    vboxMap.setBusy(true);
                    // @ts-ignore
                    if (!_MapCoordinatesSet) {
                        // @ts-ignore
                        navigator.geolocation.getCurrentPosition((e) => setCurrentLocation(e));
                    } else {
                        // @ts-ignore
                        updateMap();
                    }
                    //debugger;
                    //vboxMap.removeEventDelegate(_mapRenderedDelegate);
                },
            };

            // @ts-ignore
            vboxMap.addEventDelegate(_mapRenderedDelegate, this);
        } else {
            // Just update the location field
            // @ts-ignore
            navigator.geolocation.getCurrentPosition((e) => setCurrentLocation(e));
        }

        return vboxMapControl;
    }  // #18 KM - end of buildElementMap

    export function buildElementMessageStrip (element) {

            return new sap.m.MessageStrip(FORMS.buildElementFieldID(element), {
            text: element.text,
            showIcon: element.messageIcon,
            type: element.messageType || "Information",
            visible: FORMS.buildVisibleCond(element),
        });
    }

    export function buildElementMessagePopup (element, bSingleElement) {
        let newField = new sap.m.Button(bSingleElement ? FORMS.buildElementFieldID(element) : "", {
            icon: "sap-icon://information",
            press: (oEvent) =>{

                let popover = new sap.m.Popover({
                    placement: sap.m.PlacementType.Auto,
                    title: bSingleElement ? element.title : element.infobuttonTitle,
                    contentWidth: "350px"
                });

                let contentBoxText = new sap.m.HBox({justifyContent: sap.m.FlexJustifyContent.Center});
                contentBoxText.addItem(new sap.m.Text({
                    text: element.infobuttonText
                })).addStyleClass("sapUiSmallMargin");
                popover.addContent(contentBoxText);

                let hasImage = (bSingleElement && element.imageSrc && element.imageSrc != "")
                            || (!bSingleElement && element.infobuttonImageSrc && element.infobuttonImageSrc != "");

                if (hasImage) {
                    let contentBoxImage = new sap.m.HBox({justifyContent: sap.m.FlexJustifyContent.Center});
                    contentBoxImage.addItem(new sap.m.Image({
                        src: bSingleElement ? element.imageSrc : element.infobuttonImageSrc,
                        width: "340px"
                    }));
                    popover.addContent(contentBoxImage);
                }
                // @ts-ignore (ADD #1)
                popover.openBy(oEvent.getSource());
            },
            visible: FORMS.buildVisibleCond(element)
        });

        newField.addStyleClass("formsInfoButton");
        if (!bSingleElement) {
            newField.addStyleClass("formsInfoButtonElement");
        }

        return newField;
        
    }

    export function buildElementFormTitle (element) {

        // const newField = new sap.ui.core.Title(FORMS.buildElementFieldID(element), {
        //     text: element.enableLabel ? element.title : ""
        // });

        const newField = new sap.m.Title(FORMS.buildElementFieldID(element), {
            text: element.enableLabel ? element.title : "",
        });

        if (!element.enableLabel) {
            FORMS.formTitleHide.push(FORMS.buildElementFieldID(element));
        }

        const Toolbar = new sap.m.Toolbar({
                design: sap.m.ToolbarDesign.Transparent, // "Transparent",
                height: "2rem",
            }).addStyleClass("sapUiSizeCompact noBorder");

        Toolbar.addContent(newField);

        if (element.hasInfoButton) {
            Toolbar.addContent(FORMS.buildElementMessagePopup(element, false));
        }
        
        return Toolbar;
        
        // return newField;
    }

    export function buildElementInput (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;
        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            editable: element.enablePrePopulated && !!element.prePopulatedValue ? false : "{appControl>/formControl/formEditable}", // AC: Input pre-Populated // #18 KM
            // editable: "{appControl>/formControl/formEditable}", // #18 KM
            // editable: FORMS.editable,
            placeholder: element.placeholder,
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

        return newField;
    }

    export function buildElementValueHelp (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            placeholder: element.placeholder,
            valueHelpOnly: true,
            showValueHelp: true,
            visible: FORMS.buildVisibleCond(element),
            valueHelpRequest: function (oEvent) {
                if (!element.adaptiveApp) return;

                let events = {
                    valueRequest: true,
                    valueRequestField: this.sId,
                    valueRequestKey: element.returnField ? element.returnField : "id",
                };

                let navigation: any = {
                    destinationTargetF: element.adaptiveApp,
                    destinationType: "F",
                    openAs: "D",
                    dialogHeight: element.dialogHeight + "px",
                    dialogWidth: element.dialogWidth + "px",
                };

                if (element.dialogTitle) {
                    navigation.dialogTitle = element.dialogTitle;
                    navigation.dialogHeader = true;
                }

                // @ts-ignore (ADD #1)
                const adaptiveNavigation = sap.n.Adaptive ? sap.n.Adaptive.navigation : neptune.Adaptive.navigation;
                adaptiveNavigation(navigation, null, events);
            },
        });

        return newField;
    }

    export function buildElementPicture (element) {
        const newField = new sap.m.Image(FORMS.buildElementFieldID(element), {
            src: element.imageSrc,
            visible: FORMS.buildVisibleCond(element),
        });

        const elementImageLightBox = new sap.m.LightBox();

        elementImageLightBox.addImageContent(
            new sap.m.LightBoxItem({
                imageSrc: element.imageSrc,
                title: element.title,
            })
        );

        newField.setDetailBox(elementImageLightBox);

        if (element.width) {
            if (element.widthMetric) {
                newField.setWidth(element.width + "%");
            } else {
                newField.setWidth(element.width + "px");
            }
        }

        if (element.height) {
            if (element.heightMetric) {
                newField.setHeight(element.height + "%");
            } else {
                newField.setHeight(element.height + "px");
            }
        }

        return newField;
    }

    export function buildElementSignature (element) {
        if (!element.signatureHeight) element.signatureHeight = 200;

        const newField = new sap.m.Panel(FORMS.buildElementFieldID(element), {
            width: "100%",
            height: element.signatureHeight + "px",
            backgroundDesign: sap.m.BackgroundDesign.Transparent, // "Transparent",
        }).addStyleClass("sapUiNoContentPadding noBorderRadius noOverflow");

        const canvasId = "signature" + element.id;

        let signatureData = null;
        const formModel = FORMS.formParent.getModel();

        if (formModel.oData[element.id]) signatureData = formModel.oData[element.id];

        const SignatureHTML = new sap.ui.core.HTML({
            preferDOM: false,
            content: "<div style='height:100%;width:100%;'><canvas id='" + canvasId + "' class='noOverflow' style='background:white'></canvas></div>",
        });

        SignatureHTML.attachAfterRendering(function (oEvent) {
            setTimeout(function () {
                let signatureCanvas: any = document.getElementById(canvasId);
                signatureCanvas.width = signatureCanvas.parentNode.clientWidth;
                signatureCanvas.height = element.signatureHeight;
                // @ts-ignore (ADD #1)
                FORMS.signatures[element.id] = new Signature(signatureCanvas);
                if (signatureData) FORMS.signatures[element.id].fromDataURL(signatureData);
            }, 200);
        });

        newField.addContent(SignatureHTML);

        return newField;
    }

    export function buildElementText (element) {
        const newField = new sap.m.Title(FORMS.buildElementFieldID(element), {
            text: element.text,
            titleStyle: element.titleStyle,
            wrapping: true,
            visible: FORMS.buildVisibleCond(element),
        });

        return newField;
    }

    export function buildElementTextArea (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.TextArea(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            placeholder: element.placeholder,
            // editable: FORMS.editable,
            //editable: "{" + "/" + FORMS.bindingPath + "formEditable" + "}",
            editable: "{appControl>/formControl/formEditable}",
            growing: element.growing,
            rows: parseInt(element.rows),
            width: "100%",
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });
        if (element.rows) newField.setRows(parseInt(element.rows));

        return newField;
    }

    export function buildElementRating (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.RatingIndicator(FORMS.buildElementFieldID(element), {
            // @ts-ignore (ADD #1)
            value: "{" + FORMS.bindingPath + bindingField + "}",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            maxValue: element.maxValue,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.removeStyleClass("notValid");
            },
        });

        if (element.iconSelected) {
            newField.setIconSelected(element.iconSelected);
            newField.setIconHovered(element.iconSelected);
            newField.setIconUnselected(element.iconSelected);
        }
        if (element.iconSize) newField.setIconSize(element.iconSize + "px");

        return newField;
    }

    export function buildElementNumeric (element) {
        // KW addition (number fields are empty after parsing on iOS) // 27.11.2023

        // https://stackoverflow.com/questions/7571553/javascript-parse-float-is-ignoring-the-decimals-after-my-comma
        const fnParseFloat = function (float, decimals) {
            var resNum = "";

            if (float) {
                float = float.toString();

                //Index of first comma
                const posC = float.indexOf(",");

                if (posC === -1) {
                    //No commas found, treat as float
                    resNum = Number.parseFloat(parseFloat(float)).toFixed(decimals); // #18 KM
                } else {
                    //Index of first full stop
                    const posFS = float.indexOf(".");

                    if (posFS === -1) {
                        //Uses commas and not full stops - swap them (e.g. 1,23 --> 1.23)
                        resNum = Number.parseFloat(parseFloat(float.replace(/\,/g, "."))).toFixed(decimals); // #18 KM
                    } else {
                        //Uses both commas and full stops - ensure correct order and remove 1000s separators
                        // @ts-ignore (ADD #1)
                        resNum = (posC < posFS ? parseFloat(float.replace(/\,/g, "")).toFixed(decimals) : parseFloat(float.replace(/\./g, "").replace(",", "."))).toFixed(decimals);
                    }
                }
            }

            return resNum == "NaN" ? null : resNum;
        };

        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            placeholder: element.placeholder,
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            // KW addition (number fields are empty after parsing on iOS) // 27.11.2023
            //type: "Number",
            change: function (oEvent) {
                this.setValue(fnParseFloat(this.getValue(), element.decimals));

                // AC: Numeric check value between min and max values // #18 KM
                if (element.enableLimits) { // #18 KM
                    const isBetweenExclusive = function (value, min, max) { // #18 KM
                        return value >= min && value <= max; // #18 KM
                    }; // #18 KM

                    if (!isBetweenExclusive(this.getValue(), element.numericMin, element.numericMax)) { // #18 KM
                        this.setValueState("Error"); // #18 KM
                    } // #18 KM
                } // #18 KM
            },
            liveChange: async function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
            visible: FORMS.buildVisibleCond(element),
        });

        // KW addition (number fields are empty after parsing on iOS) // 27.11.2023
        newField.addStyleClass("numField");
        return newField;
    }

    export function buildElementStepInput (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField: any = new sap.m.StepInput(FORMS.buildElementFieldID(element), {
            // @ts-ignore (ADD #1)
            value: "{" + FORMS.bindingPath + bindingField + "}",
            placeholder: element.placeholder,
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

        newField.onAfterRendering = function () {
            let elem = this.getDomRef();
            if (elem) {
                let input = elem.childNodes[0].childNodes[0].childNodes[1];
                if (input) input.setAttribute("type", "number");
            }
        };

        if (element.min) newField.setMin(parseInt(element.min));
        if (element.max) newField.setMax(parseInt(element.max));

        return newField;
    }

    export function buildElementSwitch (element) {

        // KW addition (parse "boolean strings" as boolean values) // 11.03.2024
        var SwitchBoolean  = FORMS.getBooleanStringType();
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Switch(FORMS.buildElementFieldID(element), {
            // KW addition "boolean strings" // 11.03.2024
            // @ts-ignore (ADD #1)
            state: {path: FORMS.bindingPath + bindingField, type: new SwitchBoolean()},
            // state: "{" + FORMS.bindingPath + bindingField + "}",
            // enabled: FORMS.editable,
            enabled: "{appControl>/formControl/formEditable}",
            customTextOff: element.customTextOff,
            customTextOn: element.customTextOn,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.removeStyleClass("notValid");
            }
        });

        if (element.approveSwitch) {
            newField.setType(sap.m.SwitchType.AcceptReject); // ("AcceptReject");
        }

        // KW addition (parse string 'true' and 'false' to boolean) // 24.07.2024
        let formModel = FORMS.formParent.getModel();
        if (formModel.oData[bindingField] && typeof formModel.oData[bindingField] == "string") {
            formModel.oData[bindingField] = FORMS.parseStringToBoolean(formModel.oData[bindingField]);
        }

        return newField;
    }

    export function buildElementCheckBox (element) {

        // KW addition (parse "boolean strings" as boolean values) // 11.03.2024
        var CheckboxBoolean = FORMS.getBooleanStringType();
        const bindingField  = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.CheckBox(FORMS.buildElementFieldID(element), {
            // KW addition "boolean strings" // 11.03.2024
            // @ts-ignore (ADD #1)
            selected: {path: FORMS.bindingPath + bindingField, type: new CheckboxBoolean()},
            // selected: "{" + FORMS.bindingPath + bindingField + "}",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            text: element.text,
            visible: FORMS.buildVisibleCond(element),
            select: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

        // KW addition (parse string 'true' and 'false' to boolean) // 24.07.2024
        let formModel = FORMS.formParent.getModel();
        if (formModel.oData[bindingField] && typeof formModel.oData[bindingField] == "string") {
            formModel.oData[bindingField] = FORMS.parseStringToBoolean(formModel.oData[bindingField]);
        }

        return newField;
    }

    // AR - prepare offline mode for cache objects with connector // #18 KM

    export async function loadCacheObjects (setup) { // #18 KM
        let cacheObjectNames = [];
        setup.forEach(function (section) {
            section.elements.forEach(function (element) {
                if (!!element.objectName && cacheObjectNames.indexOf(element.objectName) < 0) cacheObjectNames.push(element.objectName);
            });
        });
        cacheObjectNames.forEach(async (objectName) => await CacheManager.loadCacheFromConnector(objectName));
    } // #18 KM - end of loadCacheObjects

    // AR // #18 KM
    export function handleCustomData (oEvent) { // #18 KM
        var CustomData = this.getCustomData();
        CustomData.forEach((item) => {
            let action = item.getKey().substring(0, 10);
            switch (action) {
                case "fireChange":
                    item.getValue().fireChange();
                    break;
                default:
            }
        });
    } // #18 KM - end of handleCustomData

    export function fieldSetAsInput (receiver, id) { // #18 KM
        // Form element
        let field = sap.ui.getCore().byId("field" + id);
        if (typeof field !== "undefined") {
            field.addCustomData(
                new sap.ui.core.CustomData({
                    key: "fireChange" + receiver.sId,
                    value: receiver,
                })
            );
            // @ts-ignore
            if (!!field.detachChange) field.detachChange(FORMS.handleCustomData);
            // @ts-ignore
            field.attachChange(FORMS.handleCustomData);
        }
    } // #18 KM - end of fieldSetAsInput

    // AR // #18 KM
    export function tablePostProcessing (section, fromIndex, toIndex, data = []) { // #18 KM
        const inData = JSON.parse(JSON.stringify(data));
        section.elements.forEach(function (element) {
            switch (element.type) {
                // AR Calculation
                case "Calc":
                    FORMS.tablePostProcessingCalc(section, element, fromIndex, toIndex);
                    break;

                default:
                    // AR custom elements
                    if (typeof customFORMS !== "undefined") {
                        customFORMS.tablePostProcessing(section, element, fromIndex, toIndex);
                    }
                    break;
            }
        });

        // AR custom elements
        if (typeof customFORMS !== "undefined" && inData.length > 0) {
            customFORMS.tableProcessData(section, fromIndex, toIndex, inData);
        }
    } // #18 KM - end of tablePostProcessing

    // AR // #18 KM
    export function objectCopyPostProcess (sourceElement, newElement) { // #18 KM
        if (sourceElement.type === "Form" || sourceElement.type === "Table") {
            let processTypes = [];
            sourceElement.elements.forEach((element) => {
                if (element.type === "Calc") {
                    if (!processTypes.includes(element.type)) processTypes.push(element.type);
                }
            });
            processTypes.forEach((type) => {
                switch (type) {
                    case "Calc":
                        FORMS.sectionCopyCalcPostProcess(sourceElement, newElement);
                        break;

                    default:
                        break;
                }
            });
        }
        // AR custom elements
        if (typeof customFORMS !== "undefined") {
            customFORMS.objectCopyPostProcess(sourceElement, newElement);
        }
    } // #18 KM - end of objectCopyPostProcess

    // AR // #18 KM
    export function parentIsTable (id) { // #18 KM
        let parent = false;

        FORMS.config.setup.forEach(function (section) {
            if (section.type === "Table") {
                section.elements.forEach(function (element) {
                    if (element.id === id) parent = section;
                });
            }
        });

        return parent;
    } // #18 KM - end of parentIsTable

    // AR // #18 KM
    export function buildElementCalc (element) { // #18 KM
        // Function to attach fireChange
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            editable: false,
            placeholder: element.placeholder,
            change: function (oEvent) {
                function getInputValue(id) {
                    let value = 0;
                    const inputField:TyGenericObject = sap.ui.getCore().byId("field" + id);
                    if (typeof inputField !== "undefined") value = inputField.getValue();
                    if (!value) value = 0;
                    return value;
                }

                this.setValue("");

                const elementAttribute = this.getCustomData().find((item) => item.getKey() === "element");
                if (typeof elementAttribute === "undefined") return;
                const element = elementAttribute.getValue();

                let result = 0;
                let operator = "plus";
                for (let i = 0; i < element.items.length; i++) {
                    let arg = Number.parseFloat(parseFloat(getInputValue(element.items[i].id)));
                        arg = isNaN(arg) ? 0 : arg;
                    switch (operator) {
                        case "plus":
                            result += arg;
                            break;
                        case "minus":
                            result -= arg;
                            break;
                        case "multiply":
                            result *= arg;
                            break;
                        case "divide":
                            if (arg === 0) {
                                this.setValue("");
                                return;
                            } else {
                                result /= arg;
                            }
                            break;
                        default:
                    }
                    operator = element.items[i].operator;
                }
                this.setValue(Number.parseFloat(parseFloat(result)).toFixed(element.decimals));
                // this.setValue(parseFloat(result).toFixed(element.decimals));
            },
            valueHelpOnly: false,
            showValueHelp: false,
            visible: FORMS.buildVisibleCond(element),
        });

        if (!FORMS.parentIsTable(element.id)) {
            newField.addCustomData(new sap.ui.core.CustomData({ key: "element", value: element }));
            element.items.forEach((item) => {
                FORMS.fieldSetAsInput(newField, item.id);
            });
        }

        // KW addition (number fields are empty after parsing on iOS) // 27.11.2023
        newField.addStyleClass("numField");
        return newField;
    } // #18 KM - end of buildElementCalc

    export function tablePostProcessingCalc (section, element, fromIndex, toIndex) { // #18 KM
        for (let i = fromIndex; i < toIndex; i++) {
            const rowSid = "-field" + section.id + "-" + i;
            const rowCalc = sap.ui.getCore().byId("field" + element.id + rowSid);
            if (typeof rowCalc !== "undefined") {
                let rowElement = JSON.parse(JSON.stringify(element));
                rowElement.items.forEach((item) => {
                    item.id = item.id + rowSid;
                    FORMS.fieldSetAsInput(rowCalc, item.id);
                });
                rowCalc.addCustomData(new sap.ui.core.CustomData({ key: "element", value: rowElement }));
            }
        }
    } // #18 KM - end of tablePostProcessingCalc

    export function sectionCopyCalcPostProcess (sourceElement, newElement) { // #18 KM
        sourceElement.elements.forEach((element, ind) => {
            if (element.type === "Calc") {
                element.items.forEach((item, i) => {
                    sourceElement.elements.find((inp, j) => {
                        if (inp.id === item.id) {
                            newElement.elements[ind].items[i].id = newElement.elements[j].id;
                            newElement.elements[ind].items[i].title = newElement.elements[j].title;
                        }
                    });
                });
            }
        });
    } // #18 KM - end of sectionCopyCalcPostProcess

    export function buildElementSegmentedButton (element, section) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.SegmentedButton(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            // enabled: FORMS.editable,
            enabled: "{appControl>/formControl/formEditable}",
            visible: FORMS.buildVisibleCond(element),
            selectionChange:  function (oEvent) {
                // this.setValueState();
                this.removeStyleClass("notValid");
            }
        });

        let widthItems = 0;

        if (element.width) {
            if (element.widthMetric) {
                newField.setWidth(element.width + "%");
            } else {
                newField.setWidth(element.width + "px");
            }

            widthItems = element.width / element.items.length;
        }

        if (element.items?.length) {
            if (element.noDefault) {
                // KW - CSS was fd up a bit - changed to "setSelectedButton("none")"
                //newField.addItem(new sap.m.SegmentedButtonItem({ key: "", text: "", width: "0px" }));
                newField.addStyleClass("segmentedNoDefault");
                newField.setSelectedButton("none");
                // var invisibleItem = new sap.m.SegmentedButtonItem({ key: "", text: "", width: "0px" });
                // invisibleItem.addStyleClass("invisibleLi");
                // newField.addItem(invisibleItem);
            } else {

                const formModel = FORMS.formParent.getModel();
                // KW addition (if the bindingfield is on a table, the value should not be set on overall level) // 22.07.2024
                if (section.type == "Table") {
                    const bindingFieldParent = section.fieldName ? section.fieldName : section.id;
                    if (!formModel.oData[bindingFieldParent]) formModel.oData[bindingFieldParent] = [];
                    for (let i = 0; i < section.rows; i++) {
                        if (!formModel.oData[bindingFieldParent][i]) formModel.oData[bindingFieldParent][i] = {};
                        if (!formModel.oData[bindingFieldParent][i][bindingField]) element.defaultValue ? (formModel.oData[bindingFieldParent][i][bindingField] = element.defaultValue) : (formModel.oData[bindingFieldParent][i][bindingField] = element.items[0].key);
                    }
                    
                } else if (!formModel.oData[bindingField]) {
                    element.defaultValue ? (formModel.oData[bindingField] = element.defaultValue) : (formModel.oData[bindingField] = element.items[0].key);
                }
                
            }

            element.items.forEach(function (item, i) {
                const newItem = new sap.m.SegmentedButtonItem({ key: item.key, text: item.title, icon: item.icon });

                // Element Width
                if (element.width && element.noDefault) {
                    newField.addStyleClass("formsSegmentedButtonItem" + element.items.length);
                    newItem.setWidth("auto");
                    // if (element.widthMetric) {
                        // newItem.setWidth(widthItems + "%");
                    // } else {
                        // newItem.setWidth(widthItems + "px");
                    // }
                }

                newField.addItem(newItem);
            });
        }

        return newField;
    }

    export function buildElementSingleSelectIcon (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Select(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            width: "100%",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

        // Override externally or combine
        if (element.itemsPath && FORMS.items[element.itemsPath]) {
            FORMS.items[element.itemsPath].forEach(function (item, i) {
                newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title, icon: item.icon }));
            });
        } else {
            element.items.forEach(function (item, i) {
                newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title, icon: item.icon }));
            });
        }

        return newField;
    }

    export function buildElementSingleSelect (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.ComboBox(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            width: "100%",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

		// TODO: compare code added against commented code (#18 KM)
		// --- code block added due to #18 KM - begin
        // AC: - "Contains" for Single Select Filter
        newField.setFilterFunction(function (sTerm, oItem) {
            // A case-insensitive 'string contains' filter
            return !!oItem.getText().match(new RegExp(sTerm, "i")) /*|| oItem.getKey().match(new RegExp(sTerm, "i"))*/;
        });

        // Single Select Connector
        if (element.enableConnector) {
            newField.removeAllItems();
            if (element.connectorID && element.connectorKey && element.connectorTitle) {
                // @ts-ignore // #18 KM
                const connector = new Connector(element.connectorID);
                // LIST
                let options = {
                    fields: [{ name: element.connectorKey }, { name: element.connectorTitle }],
                };

                connector.list(options).then(function (values) {
                    if (values.result && Array.isArray(values.result)) {
                        values.result.forEach((value) => newField.addItem(new sap.ui.core.ListItem({ key: value[element.connectorKey], text: value[element.connectorTitle] })));
                    }
                });
            }
        } else {
            // AC: Override externally or combine
            if (element.itemsPath && FORMS.items[element.itemsPath]) {
                FORMS.items[element.itemsPath].forEach(function (item, i) {
                    newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title }));
                });
            } else {
                element.items.forEach(function (item, i) {
                    newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title }));
                });
            }
        }
		// --- code block added due to #18 KM - end

		/* // -- code commented due to #18 KM - begin
		// Override externally or combine
        if (element.itemsPath && FORMS.items[element.itemsPath]) {
            FORMS.items[element.itemsPath].forEach(function (item, i) {
                newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title }));
            });
        } else {
            element.items.forEach(function (item, i) {
                newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title }));
            });
        }
        // -- code commented due to #18 KM - end */

        return newField;
    }

    export function buildElementSingleChoice (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        let newField;

        newField = new sap.m.RadioButtonGroup(FORMS.buildElementFieldID(element), {
            selectedIndex: null,
            visible: FORMS.buildVisibleCond(element),
            select: function(oEvent) {
                if (oEvent.getSource().setValueState) {
                    oEvent.getSource().setValueState();
                } else {
                    oEvent.getSource().removeStyleClass("notValid");
                }
            }
        });

        if (element.horizontal) newField.setColumns(element.items && element.items.length > 0 ? element.items.length : 5);

        const formModel = FORMS.formParent.getModel();

        element.items.forEach(function (item, i) {
            // Always set first field as default value, as the parent is RadioButtonGroup
            // #13 - Only selecting first option, when the "initiallyDeselected" value is not set
            if (!element.initiallyDeselected && i === 0 && !formModel.oData[bindingField]) formModel.oData[bindingField] = item.key;

            const elementRadio: any = new sap.m.RadioButton("item" + item.id, {
                text: item.title,
                groupName: newField.sId,
                // editable: FORMS.editable,
                editable: "{appControl>/formControl/formEditable}",
                select: function (oEvent: any) {
                    const context = oEvent.oSource.getBindingContext();
                    if (context) {
                        const data = context.getObject();
                        data[bindingField] = item.key;
                    } else {
                        formModel.oData[bindingField] = item.key;
                        formModel.refresh();
                    }
                },
            });

            elementRadio._keyValue = item.key;

            if (element.enableWidth && element.width) {
                elementRadio.setWidth(element.width + "px");
            }

            // If Data Present
            if (formModel.oData[bindingField] && formModel.oData[bindingField] === item.key) {
                elementRadio.setSelected(true);
            }

            newField.addButton(elementRadio);
        });

        // #13 - Deselecting first option
        if (element.initiallyDeselected) newField.setSelectedIndex(-1);
        return newField;
    }

    export function buildElementMultipleSelect (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.MultiComboBox(FORMS.buildElementFieldID(element), {
            // @ts-ignore (ADD #1)
            selectedKeys: "{" + FORMS.bindingPath + bindingField + "}",
            width: "100%",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            showSelectAll: true,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

        element.items.forEach(function (item, i) {
            newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title }));
        });

        return newField;
    }

    export function buildElementMultipleChoice (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        let newField;

        if (element.horizontal) {
            newField = new sap.m.HBox(FORMS.buildElementFieldID(element), {
                wrap: sap.m.FlexWrap.Wrap, // "Wrap",
                renderType: sap.m.FlexRendertype.Bare, // "Bare",
                visible: FORMS.buildVisibleCond(element),
            });
        } else {
            newField = new sap.m.VBox(FORMS.buildElementFieldID(element), {
                wrap: sap.m.FlexWrap.Wrap, // "Wrap",
                renderType: sap.m.FlexRendertype.Bare, // "Bare",
                visible: FORMS.buildVisibleCond(element),
            });
        }

        const formModel = FORMS.formParent.getModel();

        element.items.forEach(function (item, i) {
            const elementCheckBox = new sap.m.CheckBox("item" + item.id, {
                text: item.title,
                // editable: FORMS.editable,
                editable: "{appControl>/formControl/formEditable}",
                select: function (oEvent) {
                    this.getParent().removeStyleClass("notValid");

                    if (!formModel.oData[bindingField]) formModel.oData[bindingField] = [];

                    if (this.getSelected()) {
                        formModel.oData[bindingField].push(item.key);
                    } else {
                        const index = formModel.oData[bindingField].indexOf(item.key);
                        if (index > -1) formModel.oData[bindingField].splice(index, 1);
                    }
                    formModel.refresh(true);
                },
            });

            if (element.enableWidth && element.width) {
                elementCheckBox.setWidth(element.width + "px");
            }

            // If Data Present
            if (formModel.oData[bindingField] && formModel.oData[bindingField].includes(item.key)) {
                elementCheckBox.setSelected(true);
            }

            newField.addItem(elementCheckBox);
        });

        // if (!formModel.oData[bindingField]) {
        //     formModel.oData[bindingField] = [];
        // }

        return newField;
    }

    export function buildElementDatePicker (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.DatePicker(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            // value: "{" + FORMS.bindingPath + bindingField + "}",
            displayFormat: element.displayFormat ? element.displayFormat : "dd.MM.yyyy",
            // KW addition (date from SN not interpreted correctly) // 15.11.2023
            valueFormat: "yyyy-MM-dd",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
            },
            change: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

        // const fieldName = FORMS.bindingPath + bindingField;

        // newField.bindProperty("dateValue", {
        //     parts: [fieldName],
        //     formatter: function (fieldName) {
        //         if (typeof fieldName === "undefined" || fieldName === "" || fieldName === null) {
        //             return null;
        //         }

        //         if (fieldName.indexOf("/") > -1) {
        //             return new Date(fieldName);
        //         } else {
        //             const [day, month, year] = fieldName.split(".");
        //             return new Date(year, month - 1, day);
        //         }
        //     },
        // });

        newField.addStyleClass("innerDatePicker");

        return newField;
    }

    export function buildElementImage (element, parent) {

        const meta = parent.getMetadata();
        const bindingField = element.fieldName ? element.fieldName : element.id;
        const bindingPath = element.enableMulti ? "" : FORMS.bindingPath;

        const newField = new sap.m.VBox(FORMS.buildElementFieldID(element), {
            width: "100%",
            visible: FORMS.buildVisibleCond(element),
        });

        const elementUploader = new sap.m.Button({
            type: element.buttonType,
            text: element.text,
            // enabled: FORMS.editable,
            enabled: "{appControl>/formControl/formEditable}",
            press: function (oEvent: any) {
                FORMS.uploadObject = {
                    element,
                    bindingField: bindingField,
                    context: null,
                };

                if (meta._sClassName === "sap.m.Table") {
                    const context = oEvent.oSource.getBindingContext();
                    const data = context.getObject();
                    FORMS.uploadObject.context = data;
                    FORMS.uploadObject.model = parent.getModel();
                }

                if (element.enableMulti) {
                    $("#imagesUploader").click();
                } else {
                    $("#imageUploader").click();
                }
            },
        }).addStyleClass("sapUiSizeCompact");

        // @ts-ignore (ADD #1)
        const elementImage = new sap.m.Image({
            src: "{" + bindingPath + bindingField + "}",
            visible: "{= ${" + bindingPath + bindingField + "} ? true: false }",
        });

        const elementImageLightBox = new sap.m.LightBox();

        elementImageLightBox.addImageContent(
            new sap.m.LightBoxItem({
                imageSrc: "{" + bindingPath + bindingField + "}",
                title: element.title,
            })
        );

        elementImage.setDetailBox(elementImageLightBox);

        if (element.width) {
            if (element.widthMetric) {
                elementImage.setWidth(element.width + "%");
            } else {
                elementImage.setWidth(element.width + "px");
            }
        }

        if (element.height) {
            if (element.heightMetric) {
                elementImage.setHeight(element.height + "%");
            } else {
                elementImage.setHeight(element.height + "px");
            }
        }

        const elementHBox = new sap.m.HBox();
        elementHBox.addItem(elementUploader);

        if (element.enableMulti && sap.f) {
            const tabImages = new sap.f.GridList({
                mode: FORMS.editable ? sap.m.ListMode.Delete: sap.m.ListMode.None, // "Delete" : "None",
                showSeparators: sap.m.ListSeparators.None, // "None",
                showNoData: false,
                delete: function (oEvent: any) {
                    const deleteItem = oEvent.getParameter("listItem");
                    const context = deleteItem.getBindingContext();
                    const data = context.getObject();
                    if (meta._sClassName === "sap.m.Table") {
                        const tabData = oEvent.oSource.getBindingContext().getObject()[bindingField];
                        ModelData.Delete(tabData, "id", data.id);
                    } else {
                        const rowData = this.getModel().oData[bindingField];
                        ModelData.Delete(rowData, "id", data.id);
                    }
                    this.getModel().refresh();
                },
            }).addStyleClass("sapUiSizeCompact");

            const GridListItem = new sap.f.GridListItem();
            const imagePanel = new sap.m.Panel();
            GridListItem.addContent(imagePanel);
            imagePanel.addContent(elementImage);

            if (meta._sClassName === "sap.m.Table") {
                tabImages.bindAggregation("items", { path: bindingField + "/", template: GridListItem, templateShareable: false });
            } else {
                tabImages.bindAggregation("items", { path: "/" + bindingField, template: GridListItem, templateShareable: false });
            }

            // Toolbar
            const Toolbar = new sap.m.Toolbar({
                design: sap.m.ToolbarDesign.Transparent, // "Transparent",
                height: "2rem",
            }).addStyleClass("sapUiSizeCompact noBorder");

            tabImages.setHeaderToolbar(Toolbar);
            Toolbar.addContent(elementUploader);
            Toolbar.addStyleClass("formsToolbarImageUploader");

            newField.addItem(tabImages);
        } else {
            newField.addItem(elementHBox);
            newField.addItem(elementImage);

            elementHBox.addItem(
                // @ts-ignore (ADD #1)
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject, // "Reject",
                    // enabled: FORMS.editable,
                    enabled: "{appControl>/formControl/formEditable}",
                    icon: "sap-icon://delete",
                    tooltip: "Delete Image",
                    visible: "{= ${" + FORMS.bindingPath + bindingField + "} ? true:false}",
                    press: function (oEvent: any) {
                        const context = oEvent.oSource.getBindingContext();

                        if (context) {
                            const data = context.getObject();
                            data[bindingField] = "";
                            this.getModel().refresh();
                        } else {
                            elementImage.setSrc();
                        }
                    },
                }).addStyleClass("sapUiSizeCompact sapUiTinyMarginBegin")
            );
        }

        return newField;
    }

    export function buildElementFile (element, parent) {

        const bindingField = element.fieldName ? element.fieldName : element.id;
        const bindingPath  = FORMS.bindingPath;

        const newField = new sap.m.VBox(FORMS.buildElementFieldID(element), {
            width: "100%",
            visible: FORMS.buildVisibleCond(element),
        });


        /* Upload change event I */
        const uploadEvent = function (oEvent) {
            FORMS.uploadObject = {
                element,
                bindingField: bindingField,
                context: null,
            };

            fnChange(oEvent);
        };

        const now = () => {
            let num = (n) => {return n <= 9 ? "0"+n : n.toString()};
            
            const date: any = new Date();
            let now    = date.getFullYear() + num(parseInt(date.getMonth()+1)) + num(date.getDate()) + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
            return now;
        }

        const updateFileName = (name) => {
            let newName = name;
            let iFileType = name.lastIndexOf(".");
            if (iFileType >= 0) {
                let fileName = name.substring(0,iFileType);
                let fileType = name.substring(iFileType);
                newName = fileName + "__" + now() + fileType;
            }

            return newName;
        }

        /* Upload change event II */
        const fnChange = async (oEvent) => {
            try {
                const file       = oEvent.getParameter("files")[0];
                const fileReader = new FileReader();
                const filename   = file.name;
                const filetype   = file.type;
                
                fileReader.onload = async function (fileLoadedEvent) {

                    let formModel;
                    let fileData: any = fileLoadedEvent.target.result;
                    let fileEntry = {
                        id:   ModelData.genID(),
                        src:  fileData.substring(fileData.indexOf("base64,") + "base64,".length),
                        srcExists: true,
                        name: updateFileName(filename),
                        type: filetype,
                        uploaded: false
                    };

                    if (!FORMS.formParent) {
                        const formParent = sap.ui.getCore().byId("_nepFormParent");
                        formModel = formParent.getModel();
                    } else {
                        formModel = FORMS.formParent.getModel();
                    }

                    if (FORMS.uploadObject && FORMS.uploadObject.context) {    
                        FORMS.uploadObject.context[FORMS.uploadObject.bindingField] = fileEntry;
                        FORMS.uploadObject.model.refresh();
                    } else {
                        formModel.oData[FORMS.uploadObject.bindingField] = fileEntry;
                        formModel.refresh();
                    }
                };

                fileReader.readAsDataURL(file);
            } catch (e) {
                console.error(e); // #18 KM
            }
        };

        const randomId = ModelData.genID();
        const allowedFileTypes = element.fileTypes && element.fileTypes.length > 0 ? element.fileTypes : FORMS.allFileTypes;

        const fnTypeMissmatch = () => {
            const allowedTypesString = allowedFileTypes.join(", ");
            // const allowedTypesString = allowedFileTypes.slice(0, -1).join(", ") + " and " + allowedFileTypes[allowedFileTypes.length - 1];
            
            // @ts-ignore (ADD #1)
            sap.m.MessageBox.warning(
                "The file type is not supported.\nPlease choose a file of one of the following file types:\n\n" + allowedTypesString
            );
        };

        /* Upload complete event -> resolving / rejecting the upload promise */ 
        const fnUploadComplete = (oEvent) => {
            
            // KW - File upload !!
            // when calling the getData method with the "bUploadFiles" parameter set to true,
            // all files will be uploaded to the media library BEFORE saving the dataset of the form.
            // To achieve the BEFORE, there's manual promises created in the startUpload event of each fileuploader,
            // that are being resolved / rejected in the uploadComplete event afterwards.

            let id        = oEvent.getParameter("id");
            let iPrUpload = FORMS.attachmentsPromise.findIndex(p => p.id == id);

            const rejectUploadPromise = () => {if (iPrUpload >= 0) {FORMS.attachmentsPromise[iPrUpload].reject(id);}};

            if (oEvent.getParameter("status").toString().indexOf("2") == 0) {
                // Upload successful, refer to media lib
                let md = FORMS.formParent.getModel();
                if (md && md.getData()[element.id] && md.getData()[element.id].srcExists) {
                    let mediaLibAttr = {
                        name: md.getData()[element.id].name,
                        path: element.selectedFolderName
                    }
                    apiFileList().then(res => {
                        let path = element.selectedFolderName + "/" + mediaLibAttr.name;
                        if (path && res && res.length > 0) {
                            let iFile = res.findIndex(f => f.type == "File" && f.path == path);
                            if (iFile >= 0) {
                                md.getData()[element.id].src        = false;
                                md.getData()[element.id].mediaLibId = res[iFile].id;
                                md.getData()[element.id].uploaded   = true;
                                md.refresh();
                                
                                if (iPrUpload >= 0) {
                                    FORMS.attachmentsPromise[iPrUpload].resolve(id);
                                }
                            }
                        }
                    }).catch(()=>{
                        rejectUploadPromise();
                    });
                } else {
                    rejectUploadPromise();
                }
            } else {
                rejectUploadPromise();
            }
        };

        const elementUploader = new sap.ui.unified.FileUploader("f"+randomId+"inFiles", {
            sendXHR:             true,
            sameFilenameAllowed: true,
            multiple:            false,
            buttonOnly:          true,
            buttonText:          element.text,
            enabled:             FORMS.editable,
            uploadOnChange:      false,
            fileType:            allowedFileTypes,
            // @ts-ignore (ADD #1)
            visible:             "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/srcExists" + "} ? false:true}",
            uploadUrl:           "/api/functions/Media/FileSave",
            change:              uploadEvent,
            typeMissmatch:       fnTypeMissmatch,
            uploadComplete:      fnUploadComplete

        }).addStyleClass("sapUiSizeCompact");

        elementUploader.setAdditionalData(element.selectedFolderName ? element.selectedFolderName + "/" : "/");
        elementUploader.getProcessedBlobsFromArray = function getProcessedBlobsFromArray(arrBlobs) {

            return Promise.all(
                Array.from(arrBlobs).map(async (oldBlob) => {
                    try {
                        let newBlob: any = oldBlob.slice();
                        // fetch the name from the model because we need to add a timestamp to the filename to make it unique 
                        let newname = FORMS.formParent.getModel().getData()[element.id].name;
                        newBlob.name = newname;
                        return newBlob;
                    } catch (err) {
                        console.error(err); // #18 KM
                        return oldBlob;
                    }
                })
            );
        };

        FORMS.fileUploaders.push({uploader: elementUploader, elem: element});


        /* Link (to the media library), when doc is uploaded */
        // @ts-ignore (ADD #1)
        const elementFile = new sap.m.Link({
            text: "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/name" + "} && ${" + FORMS.bindingPath + bindingField + "/name" + "}.length > 0 ? ${" + FORMS.bindingPath + bindingField + "/name" + "} :'File'}",
            // icon: "sap-icon://show",
            press: async function (oEvent) {
                const fileAttr = this.getModel().getData()[bindingField];
                let id = fileAttr && fileAttr.id ? fileAttr.id : null;
                if (id) {

                    let blob: any = "";
                    let blobUrl   = "";

                    if (fileAttr.uploaded) {
                        // read file from Media Lib
                        let file = await apiFileGet({data: {
                            id: fileAttr.mediaLibId
                        }});
                        if (file) {
                            blob     = FORMS.b64toBlob(file.content, fileAttr.type);
                            blobUrl  = URL.createObjectURL(blob);
                        }

                    } else {
                        // read file from local object    
                        blob     = FORMS.b64toBlob(fileAttr.src, fileAttr.type);
                        blobUrl  = URL.createObjectURL(blob);
                    }

                    FORMS.openFile(blobUrl);

                } else {
                    sap.m.MessageToast.show("File can not be found.");
                }
            },
            visible: "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/srcExists" + "} ? true:false}",
        });

        /* Icon to indicate that the file is uploaded to the media lib */
        // @ts-ignore (ADD #1)
        const elementUploaded = new sap.ui.core.Icon({
            color: "#b9deaf",
            src:   "sap-icon://upload-to-cloud",
            tooltip: "File is uploaded to the Media Library",
            visible: "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/uploaded" + "} ? true:false}",
        }).addStyleClass("iconFileUploaded");

        const elementHBox = new sap.m.HBox();
        const elementVBoxIcon = new sap.m.VBox({justifyContent: sap.m.FlexJustifyContent.Center}).addStyleClass("vboxIconFileUploaded");
        elementVBoxIcon.addItem(elementUploaded);
        elementHBox.addItem(elementUploader);
        elementHBox.addItem(elementVBoxIcon);
        elementHBox.addItem(elementFile);
        newField.addItem(elementHBox);

        /* Remove file button */
        elementHBox.addItem(
            // @ts-ignore (ADD #1)
            new sap.m.Button({
                type: sap.m.ButtonType.Reject, // "Reject",
                enabled: FORMS.editable,
                icon: "sap-icon://delete",
                tooltip: "Remove File",
                visible: "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/srcExists" + "} ? true:false}",
                press: function (oEvent) {

                    const clearFileUploader = (elemId) => {
                        let iFU = FORMS.fileUploaders.findIndex(f => f.elem.id == elemId);
                        if (iFU >= 0) {
                            FORMS.fileUploaders[iFU].uploader.clear();
                        };
                    };

                    let id = this.getModel().getData()[bindingField] && this.getModel().getData()[bindingField].id ? this.getModel().getData()[bindingField].id : null;
                    if (id) {
                        let md = this.getModel();
                        // @ts-ignore (ADD #1)
                        sap.m.MessageBox.warning("Are you sure you want to remove this file?", {
                            actions: ["Remove", sap.m.MessageBox.Action.CANCEL],
                            emphasizedAction: "Remove",
                            onClose: async function (sAction) {
                                if (sAction == "Remove") {
                                    if (md.getData()[bindingField].uploaded) {
                                        // delete from media library
                                        let path = element.selectedFolderName + "/" + md.getData()[bindingField].name;
                                            await apiFileDelete({data: {
                                                path: path
                                            
                                            }}).done(async () => {
                                                apiFileList().done(list => {
                                                    let iFile = list.findIndex(f => f.path == path);
                                                    if (iFile >= 0) {
                                                        sap.m.MessageToast.show("File could not be deleted, please delete it manually.");
                                                    } else {
                                                        sap.m.MessageToast.show("File deleted successfully.");
                                                        clearFileUploader(bindingField);
                                                        md.getData()[bindingField] = "";
                                                        md.refresh();
                                                    }
                                                });
                                            });
                                       
                                    } else {
                                        // delete from local object
                                        sap.m.MessageToast.show("File deleted successfully.");
                                        clearFileUploader(bindingField);
                                        md.getData()[bindingField] = "";
                                        md.refresh();
                                    }
                                }
                            }
                        });
                    }
                },
            }).addStyleClass("sapUiSizeCompact sapUiTinyMarginBegin")
        );
        
        return newField;
    }

    export function buildElementMediaLib (element) {
        
        let newField;

        if (element.filename && element.link) {

            newField = new sap.m.Link({
                text: element.filename,
                press: function (oEvent) {
                    let t = encodeURI(element.link);//MediaFunctions.buildLink({url: element.link});
                    t.indexOf("http") < 0 && (t = "" + location.origin + t),
                    FORMS.openFile(t);
                },
                visible: true
            });

        } else {

            if (element.hideNoFile) {
                return;
            } else {
                // newField = new sap.m.VBox({justifyContent: sap.m.FlexJustifyContent.End});
                newField = new sap.m.Title(FORMS.buildElementFieldID(element), {
                    text: element.txtNoLinkProvided,
                    // titleStyle: element.titleStyle,
                    wrapping: true,
                    // visible: FORMS.buildVisibleCond(element),
                }).addStyleClass("sapUiSizeCompact");

                // newField.addItem(textField);
            }
        }

        return newField;
    }

    export function buildElementDateTimePicker (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.DateTimePicker(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            displayFormat: element.displayFormat ? element.displayFormat : "dd.MM.yyyy HH:mm",
            // editable: FORMS.editable,
            editable: "{appControl>/formControl/formEditable}",
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
            change: function (oEvent) {
                this.setValueState();
                this.removeStyleClass("notValid");
            },
        });

        return newField;
    }

    export function buildElementCheckList (element) {
        const tabCheckList = new sap.m.Table(FORMS.buildElementFieldID(element), {
            showSeparators: sap.m.ListSeparators.None,
            backgroundDesign: sap.m.BackgroundDesign.Transparent, // "Transparent",
            contextualWidth: "Auto",
            visible: FORMS.buildVisibleCond(element),
        });

        if (tabCheckList.setAutoPopinMode) {
            tabCheckList.setAutoPopinMode(true);
        }

        // Columns
        const colQuestion = new sap.m.Column();
        tabCheckList.addColumn(colQuestion);

        colQuestion.setHeader(new sap.m.Text({ text: element.questionTitle }));

        const colAnswer = new sap.m.Column({
            demandPopin: true,
            popinDisplay: sap.m.PopinDisplay.Inline, // "Inline",
            minScreenWidth: "Tablet",
            width: "30%",
        });

        tabCheckList.addColumn(colAnswer);

        colAnswer.setHeader(new sap.m.Text({ text: element.answerTitle }));

        // Items
        const {model} = FORMS.bindingWrapper; // #57 #58
        element.items.forEach(function (item, index) {
            const itemCheckList = new sap.m.ColumnListItem("field" + item.id);

            itemCheckList.addCell(
                new sap.m.Label({
                    text: item.question,
                    required: item.required,
                })
            );

            let itemAnswer;
            const {itemValue, itemPath} = (function () { // #57 #58
                const result = {itemValue:"", itemPath: ""};
                if (element.fieldName) {
                    result.itemPath = `/${element.fieldName}/${index}`;
                }
                else {
                    result.itemPath = `/${item.id}`;
                }
                result.itemValue = `{${result.itemPath}}`;
                return result;
            })();
            const config={property:''}; // #57 #58
            const fnOnChangeEvent = function(oEvent) { // #57 #58
                const value = oEvent.getParameter(config.property);
                const thisData = model.getData();
                if (element.fieldName) {
                    let arrayData = thisData[element.fieldName];
                        arrayData = Array.isArray(arrayData) ? arrayData : [];
                    thisData[element.fieldName] = arrayData;
                }
                model.setProperty(itemPath, !!value);
                model.refresh();
            }
            switch (item.type) {
                case "Input":
                    itemAnswer = new sap.m.Input({
                        value: `${itemValue}`, // #57 #58 
                        editable: "{appControl>/formControl/formEditable}",
                        change: fnOnChangeEvent, // #57 #58 
                        // editable: FORMS.editable,
                    });
                    config.property = "value"; // #57 #58
                    break;

                case "AcceptReject":
                    // @ts-ignore (ADD #1)
                    itemAnswer = new sap.m.Switch({
                        state: `${itemValue}`, // #57 #58 
                        enabled: "{appControl>/formControl/formEditable}",
                        change: fnOnChangeEvent, // #57 #58 
                        // enabled: FORMS.editable,
                        type:sap.m.SwitchType.AcceptReject, // "AcceptReject",
                    });
                    config.property = "state"; // #57 #58
                    break;

                case "CheckBox":
                    // @ts-ignore (ADD #1)
                    itemAnswer = new sap.m.CheckBox({
                        selected: `${itemValue}`, // #57 #58
                        editable: "{appControl>/formControl/formEditable}",
                        select: fnOnChangeEvent, // #57 #58 
                        // editable: FORMS.editable,
                    });
                    config.property = "selected"; // #57 #58
                    break;

                default:
                    // @ts-ignore (ADD #1)
                    itemAnswer = new sap.m.Switch({
                        state: `${itemValue}`, // #57 #58
                        enabled: "{appControl>/formControl/formEditable}",
                        change: fnOnChangeEvent, // #57 #58 
                        // enabled: FORMS.editable,
                    });
                    config.property = "state"; // #57 #58
                    break;
            }
            itemAnswer.bindProperty(config.property, { // #57 #58
                path: itemPath,
                formatter: (item.type === "Input") 
                            ? (value) => value
                            : (value) => !!value
            })

            itemCheckList.addCell(itemAnswer);
            tabCheckList.addItem(itemCheckList);
        });

        return tabCheckList;
    }

    export function getValid () {
        return FORMS.validate("OnlyCheck");
    }

    export function getData (complete?, isDesigner?, bUploadFiles?) {
        if (!FORMS.formParent) return null;
        const formModel = FORMS.formParent.getModel();
        const outputData = {};

        let completed = false;
        const process = complete ? "" : "OnlyCheck";
        if (complete) FORMS.revalidate = !!complete;
        const valid = FORMS.validate(process);

        if (complete && valid) completed = true;

        const getElementData = function (element) {
            switch (element.type) {
                case "Signature":
                    if (FORMS.signatures[element.id]) {
                        outputData[element.id] = FORMS.signatures[element.id].toDataURL();
                    }
                    break;

                case "CheckList":
                    if (element.fieldName) { // #57 #58
                        outputData[element.fieldName] = formModel.getData()[element.fieldName]; // #57 #58
                    } // #57 #58
                    else { // #57 #58
                        element.items.forEach(function (item) {
                            if (formModel.oData[item.id]) {                    
                                outputData[item.id] = formModel.oData[item.id];
                            }                                                  
                        });
                    } // #57 #58
                    break;

                default:
                    // KW addition (bug when checking getMonth in object -> null is also an object though..) // 13.05.2024
                    if (element.fieldName && formModel.oData[element.fieldName]) {
                        if (typeof formModel.oData[element.fieldName] == "object" && typeof formModel.oData[element.fieldName].getMonth == "function") {
                            outputData[element.fieldName] = formModel.oData[element.fieldName].toString();
                        // KW addition (post false boolean values) // 13.11.2023
                        } else if (typeof formModel.oData[element.fieldName] == "boolean" || formModel.oData[element.fieldName]) {
                            outputData[element.fieldName] = formModel.oData[element.fieldName];
                        }
                    } else {
                        if (formModel.oData[element.id]) outputData[element.id] = formModel.oData[element.id];
                    }
                    break;
            }
        };

        FORMS.config.setup.forEach(function (section) {
            if (!section) return;

            section.elements.forEach(function (element) {
                getElementData(element);
                if (element.elements) {
                    element.elements.forEach(function (element) {
                        getElementData(element);
                    });
                }
            });
        });

        // Cleanup fields
        FORMS.config.setup.forEach(function (section) {
            if (!section) return;

            if (section.type === "Table") {
                const tabObject = sap.ui.getCore().byId("field" + section.id);

                if (!tabObject) return;

                // @ts-ignore (ADD #1)
                const tabData = section.enablePagination && FORMS.paginationSetup[section.id] ? FORMS.paginationSetup[section.id].data : tabObject.getModel().oData;

                if (tabData) {
                    const bindingField = section.fieldName ? section.fieldName : section.id;

                    outputData[bindingField] = tabData;

                    if (outputData[bindingField] && outputData[bindingField].forEach) {
                        outputData[bindingField].forEach(function (data) {
                            delete data.highlight;
                            delete data.rowNumber;
                        });
                    }
                }
                return;
            }
        });

        const formData: any = {
            data: outputData,
            config: FORMS.config,
            completed: completed,
            valid: valid,
        };

        if (bUploadFiles) {
            // MOD begin'
            // info: {
            //     user: "paulo.reis.rosa@neptune-software",
            //     reason: "having an 'await' does not seem to affect the rest of the code, and 'getData' cannot be async"
            // }
            // await FORMS.uploadAttachments();
            // MOD ---
            FORMS.uploadAttachments();
            // MOD end
        }

        let renderer = FORMS.Renderer.selected();
        Object.assign(formData, renderer.action.getData());

        // Logging
        if (FORMS.config.savedata && !isDesigner) {
            if (FORMS.sessionid) {
                formData.sessionid = FORMS.sessionid;
            } else {
                formData.sessionid = ModelData.genID();
            }
            apiSaveLog({
                data: formData,
            });
        }

        return formData;
    }

    export function clear () {
        // Model
        const formModel = FORMS.formParent.getModel();
        formModel.setData({});

        // Fields
        FORMS.validate("Reset");

        const clearElement = function (element) {
            switch (element.type) {
                case "SingleChoice":
                case "MultipleChoice":
                    element.items.forEach(function (item, i) {
                        const field: any = sap.ui.getCore().byId("item" + item.id);
                        if (field) {
                            if (element.type === "SingleChoice" && i === 0) {
                                field.setSelected(true);
                            } else {
                                field.setSelected(false);
                            }
                        }
                    });
                    break;

                case "Signature":
                    FORMS.signatures[element.id].clear();
                    break;

                case "Table":
                    const field = sap.ui.getCore().byId("field" + element.id);
                    const model: any = field.getModel();
                    const oldData = model.getData();
                    const newData = [];

                    for (let i = 0; i < oldData.length; i++) {
                        let newRow = {
                            id: oldData[i].id,
                        };

                        newData.push(newRow);
                    }

                    model.setData(newData);
                    model.refresh();
                    break;

                default:
                    break;
            }
        };

        // Single/MultiChoice
        FORMS.config.setup.forEach(function (section) {
            clearElement(section);
            section.elements.forEach(function (element) {
                clearElement(element);
                if (element.elements) {
                    element.elements.forEach(function (subElement) {
                        clearElement(subElement);
                    });
                }
            });
        });

        FORMS.setDefaultValues();
        formModel.refresh();
    }

    export function findSectionByElementId (elementId) {
        let stack = [];
        for (let section of FORMS.config.setup) {

            if (Array.isArray(section.elements) && section.elements.length > 0) {
                
                stack = section.elements.concat();

                while (stack.length > 0) {
                    let current = stack.pop();
                    if (current.id === elementId) {
                        return section;
                    }

                    if (Array.isArray(current.elements) && current.elements.length > 0) {
                        stack.push(...current.elements.concat());
                    }
                }

            }
            
            
            
            // if (typeof section.getContent === 'function') {
            //     stack = section.getContent();
            // } else if (typeof section.getItems === 'function') {
            //     stack = section.getItems();
            // }

            // while (stack.length > 0) {
            //     let current = stack.pop();
                
            //     if (current.getId() === targetId) {
            //         return section;
            //     }

            //     if (typeof current.getContent === 'function') {
            //         stack.push(...current.getContent());
            //     } else if (typeof current.getItems === 'function') {
            //         stack.push(...current.getItems());
            //     }
            // }
        }
        
        return null; // If nothing found, but we don't settle for less, do we?
    }

    export function validate (process) {
        let validForm = true;
        let fieldCompleted;
        const formModel = FORMS.formParent.getModel();

        const validateElement = function (element) {

            fieldCompleted = true;

            // const field = sap.ui.getCore().byId("field" + element.id);
            const bindingField = element.fieldName ? element.fieldName : element.id;

            // Disabled Field
            if (element.disabled) {
                return;
            }

            // alternative for "field not visible":
            if (!FORMS.isElementVisible(element, FORMS.config.setup, formModel.oData)) {
                return;
            }


            // Field not visible -> Do not show value
            // if (!field?.getDomRef()) {
            //     // KW ! This causes issues in the wizard - the invisible fields (because in different section) cause the values to be deleted from the model - big no
            //     // delete formModel.oData[bindingField];
            //     return;
            // }

            // If field is required, check value and mark if not valid
            if (element.required) {

                fieldCompleted = formModel.oData[bindingField] ? true : false;

                // KW check if the signature canvas is (not) blank // 19.09.2024
                if (fieldCompleted && element.type == "Signature") {    
                    const fnCanvasIsNotBlank = function (canvas) {
                        return canvas.getContext('2d')
                        .getImageData(0, 0, canvas.width, canvas.height).data
                        .some(channel => channel !== 255);
                    };

                    let cvs = document.getElementById("signature"+element.id);
                    if (cvs) {
                        fieldCompleted = fnCanvasIsNotBlank(cvs);
                    }
                }

                if (validForm) validForm = fieldCompleted;
            
                FORMS.validateMarkField(element.id, fieldCompleted, process);
            }

            // MultipleSelect/MultipleChoice
            if (formModel.oData[bindingField] && element.validationType !== "noLimit" && (element.type === "MultipleChoice" || element.type === "MultipleSelect")) {
                switch (element.validationType) {
                    case "equalTo":
                        if (formModel.oData[bindingField].length !== parseInt(element.validationParam)) {
                            fieldCompleted = false;
                            FORMS.validateMarkField(element.id, false, process);
                        }
                        break;

                    case "atMost":
                        if (formModel.oData[bindingField].length > parseInt(element.validationParam)) {
                            fieldCompleted = false;
                            FORMS.validateMarkField(element.id, false, process);
                        }
                        break;

                    case "atLeast":
                        if (formModel.oData[bindingField].length < parseInt(element.validationParam)) {
                            fieldCompleted = false;
                            FORMS.validateMarkField(element.id, false, process);
                        }
                        break;

                    default:
                        break;
                }
                if (validForm) validForm = fieldCompleted;
            }

            if (element.type === "CheckList") {
                element.items.forEach(function (item, i) {
                    if (item.required) {
                        const fieldCompleted = formModel.oData[item.id] ? true : false;
                        if (validForm) validForm = fieldCompleted;
                        FORMS.validateMarkField(item.id, fieldCompleted, process);
                    }
                });
            }

			// Validate Min / Max limits // #18 KM
			if (element.enableLimits) { // #18 KM
				const isBetweenExclusive = function (value, min, max) { // #18 KM
					return value >= min && value <= max; // #18 KM
				}; // #18 KM
				let validField = isBetweenExclusive(formModel.oData[element.id], element.numericMin, element.numericMax); // #18 KM
				FORMS.validateMarkField(element.id, validField, process); // #18 KM
			} // #18 KM

        };

        const validateSectionHeader = (sectionId, bValid) => {
            // For Renderers that have grouped or tabbed sections
            // Should highlight the group/tab if it contains an element with a validation error 
            let selectedRenderer = FORMS.Renderer.selected();
            let repository = FORMS.Renderer.getRepository(selectedRenderer);
            selectedRenderer.action.applyValidationStyle(
                "validateSectionHeader",    // source
                sectionId,                  // sectionId
                bValid,                     // value
                repository,                 // repository 
            );
        }

        FORMS.config.setup.forEach(function (section) {
            if (!section) return;
            let sectionValid = true;
            if (section.type === "Table") {
                const validTable = FORMS.validateTableContentRequired(section, process);
                if (!validTable && !section.disabled) validForm = false;
                validateSectionHeader(section.id, validTable || section.disabled);
                
            } else {
                if (!FORMS.isElementVisible(section, FORMS.config.setup, formModel.oData)) {
                    return;
                }
                section.elements.forEach(function (element) {
                    validateElement(element);
                    if (!fieldCompleted) sectionValid = false;

                    if (element.elements) {
                        element.elements.forEach(function (subElement) {
                            validateElement(subElement);
                            if (!fieldCompleted) sectionValid = false;
                        });
                    }

                    validateSectionHeader(section.id, sectionValid);
                });
            }
        });

        return validForm;
    }

    // markSectionHeadOfElementWizard: function (elementId, bAddClass) {
    //     let res = null;

    //     let section = FORMS.findSectionByElementId(elementId);
    //     if (section) {
    //         if (FORMS.wizardData && Array.isArray(FORMS.wizardData)) {
    //             let iWD = FORMS.wizardData.findIndex(wh => wh.breakId == section.id);
    //             if (iWD >= 0) {
    //                 if (bAddClass)
    //                     FORMS.wizardHead.getItems()[iWD]._oImageControl.addStyleClass("wizardHeaderErrorTab");
    //                 else {
    //                     FORMS.wizardHead.getItems()[iWD]._oImageControl.removeStyleClass("wizardHeaderErrorTab");
    //                 }
    //             }
    //         }
    //     }

    //     return res;
    // },

    export function validateTableContentRequired (section, process) {
        const table = sap.ui.getCore().byId("field" + section.id);

        // alternative for "field not visible":
        if (!FORMS.isElementVisible(section, FORMS.config.setup, FORMS.formParent.getModel().getData())) {
            return true;
        }
        // if (!table) return false;

        let model = null;
        let modelData;
        
        if (table) {
            model = table.getModel();
            modelData = model.oData ? model.oData : [];
        } else {
            let bindingField = section.fieldName && section.fieldName != "" ? section.fieldName : section.id;
            modelData = FORMS.formParent.getModel().getData()[bindingField] ? FORMS.formParent.getModel().getData()[bindingField] : [];
        }

        let validTable = true;
        let requiredFields = [];

        section.elements.forEach(function (element) {
            if (element.required) requiredFields.push(element.fieldName ? element.fieldName : element.id);
        });

        // if (model.oData && model.oData.length) {
        if (modelData && modelData.length) {
            // model.oData.forEach(function (rowData) {
                modelData.forEach(function (rowData) {
                delete rowData.highlight;

                if (process !== "Reset") {
                    requiredFields.forEach(function (requiredField) {
                        if (!rowData[requiredField]) {
                            validTable = false;
                            rowData.highlight = "Error";
                        }
                    });
                }
            });
        }

        if (model) model.refresh();

        return validTable;
    }

    export function validateMarkField (id, valid, process) {
        if (process === "OnlyCheck") return;
        const validStatus = process === "Reset" ? true : valid;
        const field: any = sap.ui.getCore().byId("field" + id);

        if (!field) return;

        if (validStatus) {
            if (field && field.setValueState) {
                field.setValueState();
            } else {
                field.removeStyleClass("notValid");
            }

            if (field.setHighlight) field.setHighlight();
        } else {
            if (field && field.setValueState) {
                field.setValueState("Error");
            }
            // else {
            //     field.addStyleClass("notValid");
            // }

            // KW - always add the error style class (to keep it consistent) // 19.09.2024
            field.addStyleClass("notValid");

            if (field.setHighlight) field.setHighlight("Error");
        }
    }

    export function getElementFromId (id) {
        let elementFound = null;

        FORMS.config.setup.forEach(function (section) {
            if (section.id === id) elementFound = section;
            section.elements.forEach(function (element) {
                if (element.id === id) elementFound = element;
                if (element.elements) {
                    element.elements.forEach(function (subElement) {
                        if (subElement.id === id) elementFound = subElement;
                    });
                }
            });
        });

        return elementFound;
    }

    export function getDuplicateParentFromId (id, data) {
        let parentData = null;

        data.config.setup.forEach(function (section) {
            if (section.id === id) parentData = section;

            section.elements.forEach(function (element) {
                if (element.id === id) parentData = section;

                if (element.elements) {
                    if (!parentData && element.id === id) parentData = element;
                    element.elements.forEach(function (subElement) {
                        if (subElement.id === id) parentData = element;
                    });
                }
            });
        });

        return parentData;
    }

    export function apiGetForm (id) {
        return new Promise(function (resolve) {
            $.ajax({
                type: "GET",
                url: "/api/serverscript/formsclient/get?id=" + id,
                success: function (req, status, xhr) {
                    resolve(req);
                },
                error: function (xhr, status, error) {
                    // @ts-ignore (ADD #1)
                    resolve();
                },
            });
        });
    }

    export function importImages (oEvent) {
        try {
            for (let i = 0; i < oEvent.target.files.length; i++) {
                const file = oEvent.target.files[i];
                const fileReader = new FileReader();

                fileReader.onload = async function (fileLoadedEvent) {
                    let formModel;
                    let imageData = await FORMS.imageResize(fileLoadedEvent.target.result, FORMS.uploadObject.element);

                    if (!FORMS.formParent) {
                        const formParent = sap.ui.getCore().byId("_nepFormParent");
                        formModel = formParent.getModel();
                    } else {
                        formModel = FORMS.formParent.getModel();
                    }

                    if (FORMS.uploadObject.context) {
                        if (FORMS.uploadObject.element.enableMulti) {
                            if (!FORMS.uploadObject.context[FORMS.uploadObject.bindingField]) FORMS.uploadObject.context[FORMS.uploadObject.bindingField] = [];
                            let newImageRow = {
                                id: ModelData.genID(),
                            };
                            newImageRow[FORMS.uploadObject.bindingField] = imageData;
                            FORMS.uploadObject.context[FORMS.uploadObject.bindingField].push(newImageRow);
                        } else {
                            FORMS.uploadObject.context[FORMS.uploadObject.bindingField] = imageData;
                        }

                        FORMS.uploadObject.model.refresh();
                    } else {
                        if (FORMS.uploadObject.element.enableMulti) {
                            if (!formModel.oData[FORMS.uploadObject.bindingField]) formModel.oData[FORMS.uploadObject.bindingField] = [];
                            let newImageRow = {
                                id: ModelData.genID(),
                            };
                            newImageRow[FORMS.uploadObject.bindingField] = imageData;
                            formModel.oData[FORMS.uploadObject.bindingField].push(newImageRow);
                            formModel.refresh();
                        } else {
                            formModel.oData[FORMS.uploadObject.bindingField] = imageData;
                            formModel.refresh();
                        }
                    }

                    let coreElem: any = sap.ui.getCore().byId("field"+FORMS.uploadObject.element.id);
                    if (coreElem) { coreElem.removeStyleClass("notValid")};

                    // @ts-ignore (ADD #1)
                    document.getElementById("imageUploader").value = "";
                    // @ts-ignore (ADD #1)
                    document.getElementById("imagesUploader").value = "";
                };

                fileReader.readAsDataURL(file);
            }
        } catch (e) {
            console.error(e); // #18 KM
        }
    }

    export function imageResize (imageData, element) {
        return new Promise(function (resolve) {
            let resizeRate = 2;
            const imageDataLength = imageData?.length;

            if (imageDataLength > 1000000) resizeRate = 3;
            if (imageDataLength > 2000000) resizeRate = 4;

            if (imageDataLength > 250000 && element.enableResize) {
                let image = new Image();

                image.onload = function () {
                    let canvas = document.createElement("canvas");
                    let context = canvas.getContext("2d");
                    canvas.width = image.width / resizeRate;
                    canvas.height = image.height / resizeRate;
                    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

                    const resizedImage = canvas.toDataURL();
                    resolve(resizedImage);
                };

                image.src = imageData;
            } else {
                resolve(imageData);
            }
        });
    }

    export function isElementVisible (/*parentElementID, */dependentElement, setup, data) {
        let visible = true;
        if (dependentElement.enableVisibleCond && dependentElement.visibleCondition && dependentElement.visibleFieldName && dependentElement.visibleValue) {
            let parentElement = FORMS.getObjectFromFieldNameOrID(dependentElement.visibleFieldName/*parentElementID*/, setup, data);
            if (parentElement) {
                let idData        = parentElement.fieldName ? parentElement.fieldName : parentElement.id;
                // if (data[idData]) {
                    visible = eval("'"+data[idData]+"'" + dependentElement.visibleCondition + "'"+dependentElement.visibleValue+"'");
                // }
            }
        }
        else if (!!(dependentElement.useFormatterConfig?.visible  // #60
                    || 
                   ((dependentElement.enableVisibleCond && Array.isArray(dependentElement.visibility) && dependentElement.visibility.length)))) {
            visible = !!FORMS.bindingWrapper.model.getData()?.visible?.[dependentElement.id];
        }

        return visible;
    }

    // KW new Function to get an Object by the field-name or ID // 10.07.2024
    export function getObjectFromFieldNameOrID (fieldNameOrID, setup, data) {
        let elementData = null;
        
        if (setup && Symbol.iterator in Object(setup)) {
            setup.forEach(function (section, i) {
                if ((section.fieldName && section.fieldName === fieldNameOrID) || section.id === fieldNameOrID)
                    elementData = section;

                section.elements.forEach(function (element, i) {
                    if ((element.fieldName && element.fieldName === fieldNameOrID) || element.id === fieldNameOrID)
                        elementData = element;

                    if (element.elements) {
                        element.elements.forEach(function (element, i) {
                            if ((element.fieldName && element.fieldName === fieldNameOrID) || element.id === fieldNameOrID)
                                elementData = element;
                        });
                    }
                });
            });
        }
        if (elementData && elementData.visibleValue) {
            elementData.isVisible = FORMS.isElementVisible(/*elementData.visibleFieldName,*/ elementData, setup, data);
        }

        return elementData;
    }

    // KW new Function to get an Object by the field-name // 11.03.2024
    export function getObjectFromFieldName (fieldName, setup) {
        let elementData = null;
        
        if (setup && Symbol.iterator in Object(setup)) {
            setup.forEach(function (section, i) {
                if (section.fieldName === fieldName) elementData = section;

                section.elements.forEach(function (element, i) {
                    if (element.fieldName === fieldName) elementData = element;

                    if (element.elements) {
                        element.elements.forEach(function (element, i) {
                            if (element.fieldName === fieldName) elementData = element;
                        });
                    }
                });
            });
        }

        return elementData;
    }

    export function getObjectFromId (id, setup?) {
        let elementData = null;

        const usedSetup = (setup) ? setup : FORMS.config.setup;
        usedSetup.forEach(function (section, i) {
            if (section.id === id) elementData = section;

            section.elements.forEach(function (element, i) {
                if (element.id === id) elementData = element;

                if (element.elements) {
                    element.elements.forEach(function (element, i) {
                        if (element.id === id) elementData = element;
                    });
                }
            });
        });

        return elementData;
    }

    export function openFile (blobUrl) {
        setTimeout(() => {
            var target = "_blank";
            if (sap.ui.Device.system.combi || (sap.ui.Device.os.ios && sap.ui.Device.system.tablet) && window.matchMedia('(display-mode: standalone)').matches) {
                target = '_top';
            }
            window.open(blobUrl, target);
        });
    }

    export async function uploadAttachments () {

        FORMS.attachmentsPromise = [];

        const addPromiseAttachment = (id) => {
            let externalResolve, externalReject;
    
            let prUpload: any = new Promise((resolve, reject) => {
                externalResolve = resolve;
                externalReject  = reject;
            });
            prUpload.id = id;

            // Attach the resolve and reject methods to the promise to make
            // them triggerable from outside of this method
            prUpload.resolve = externalResolve;
            prUpload.reject  = externalReject;

            FORMS.attachmentsPromise.push(prUpload);
        }

        for (const up of FORMS.fileUploaders) {
            if (up.uploader.getValue() && up.uploader.getValue() != "") {
                addPromiseAttachment(up.uploader.getId());
                up.uploader.upload(true);
            }
        }

        return await Promise.all(FORMS.attachmentsPromise);
    }

    export function b64toBlob (b64Data, contentType='', sliceSize=512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
            
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    export function getAllFieldNames (setup) {
        let res = [];
        setup.forEach(section => {
            if (section.fieldName) res.push(section.fieldName);
            section.elements.forEach(function (element) {
                if (element.fieldName) res.push(element.fieldName);
                if (element.elements) {
                    element.elements.forEach(function (element) {
                        if (element.fieldName) res.push(element.fieldName);
                    });
                }
            });
        });

        return res;
        
    }

    export function setFormEditable (bEditable) {

        FORMS.editable = bEditable;
        if (modelappControl.getData().formControl) {
            modelappControl.getData().formControl.formEditable = bEditable;
        } else {
            modelappControl.getData().formControl = {formEditable: bEditable};
        }
        
        modelappControl.refresh();

        // loop through tables to define the mode
        // @ts-ignore (ADD #1)
        let elements = FORMS.getData().config.setup;
        if (elements && elements.length > 0) {
            elements.forEach(el => {
                if (el.type == "Table") {
                    let obj: any = sap.ui.getCore().byId("field"+el.id);
                    if (obj && obj != null) {
                        if (!bEditable) {
                            el.origMode = obj.getMode();
                            obj.setMode("None");
                        } else {
                            obj.setMode(el.origMode && el.origMode != "" ? el.origMode : "Delete");
                            delete el.origMode;
                        }
                    }
                }
            });
        }
    }

    // AC: Pre Populate Values in the FORM itself // #18 KM
    export function setPrePopulatedValue (element, formModel, bindingField) { // #18 KM
        if (!!element.prePopulatedValue) {
            let currentDate = new Date();
            switch (element.prePopulatedValue) {
                case "name":
                    // @ts-ignore
                    formModel.oData[bindingField] = AppCache?.userInfo?.name;
                    break;

                case "id":
                    // @ts-ignore
                    formModel.oData[bindingField] = AppCache?.userInfo?.id;
                    break;

                case "email":
                    // @ts-ignore
                    formModel.oData[bindingField] = AppCache?.userInfo?.email;
                    break;

                case "first":
                    let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    formModel.oData[bindingField] = firstDayOfMonth.getFullYear() + "-" + (firstDayOfMonth.getMonth() + 1) + "-" + firstDayOfMonth.getDate();
                    break;

                case "current":
                    switch (element.type) {
                        case "DatePicker":
                            formModel.oData[bindingField] = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
                            break;
                        case "DateTimePicker":
                            let options = {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: true,
                            };

                            // @ts-ignore
                            let formattedDate = currentDate.toLocaleString("undefined", options);

                            formModel.oData[bindingField] = formattedDate;
                            break;
                    }
                    break;

                case "last":
                    let lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
                    formModel.oData[bindingField] = lastDayOfMonth.getFullYear() + "-" + (lastDayOfMonth.getMonth() + 1) + "-" + lastDayOfMonth.getDate();
                    break;

                default:
                    break;
            }
        } else {
            if (!!element.prePopulatedFreeValue) {
                formModel.oData[bindingField] = element.prePopulatedFreeValue;
            }
        }
    } // #18 KM - end of setPrePopulatedValue

    // AC: Move the code from builElementNumeric to its own function // #18 KM
    export function parseFloat (float:number|string, decimals?:number|string): string { // #18 KM
        let resNum:string;
        const DEFAULT_DECIMALS = 2;
        // @ts-ignore
        let localDecimals = isNaN(Number.parseInt(decimals)) ? DEFAULT_DECIMALS : Number.parseInt(decimals);
        if (float) {
            let localFloat = String(float);

            //Index of first comma
            const posC = localFloat.indexOf(",");

            if (posC === -1) {
                //No commas found, treat as float
                let tempFloat = Number.parseFloat(localFloat);
                resNum = (isNaN(tempFloat)) ? "" : tempFloat.toFixed(localDecimals);
            } else {
                //Index of first full stop
                let posFS = localFloat.indexOf(".");

                if (posFS === -1) {
                    // first checks if "." is omitted because there are no decimals
                    // NOTE: this is a particular case, and there can still be false positives
                    // 1,000,000 is surely 1000000.00
                    // but 1,234 can either be 1.234 if "," is the decimal sep, or 1234 otherwise, and there's no way to be sure (may lead to false positives)
                    // by design, on the latter it will be chosen that it is 1.234
                    if (localFloat.split(",").length > 2) {
                        posFS = localFloat.length;
                    }
                }
                if (posFS === -1) {
                    //Uses commas and not full stops - swap them (e.g. 1,23 --> 1.23)
                    resNum = Number.parseFloat(localFloat.replace(",", ".")).toFixed(localDecimals);
                } else {
                    //Uses both commas and full stops - ensure correct order and remove 1000s separators
                    let tempValue = posC < posFS 
                                        ? localFloat.replace(/\,/g, "") 
                                        : localFloat.replace(/\./g, "").replace(",", ".");
                    resNum = Number.parseFloat(tempValue).toFixed(localDecimals);
                }
            }
        }

        return resNum;
    } // #18 KM - end of parseFloat

    export function getLocaleIsoString (input:string|Date|number) {
        // @ts-ignore
        if ((typeof input === "string") || (input instanceof Date) || !isNaN(Number.parseInt(input))) {
            try {
                const dateObj = (input instanceof Date) ? input : new Date(input);
                const C_REGEX = /(\d+)\/(\d+)\/(\d+),\s*(\d+)\:(\d+)\:(\d+)[^P]*(PM)?/;
                const match = C_REGEX.exec(dateObj.toLocaleString("iso"));
                if (!match) {return;}
                if (match[7] === "PM") {
                    if (match[4] === "12") {
                        const nextDay = new Date(dateObj.getTime()+1000*60*60*24);
                        const nextStr = nextDay.toISOString();
                        match[3] = nextStr.slice(0,4);
                        match[1] = nextStr.slice(5,7);
                        match[2] = nextStr.slice(8,10);
                        match[4] = "00";
                    }
                    else {
                        match[4] = `${Number.parseInt(match[4]) + 12}`;
                    }
                }
                else {
                    if (match[4] === "12") {
                        match[4] = "00";
                    }
                    else {
                        match[4] = `0${match[4]}`.slice(-2);                   
                    }
                }
                return  `${match[3]}-` + // year
                        `0${match[1]}-`.slice(-3) + // month
                        `0${match[2]}`.slice(-2) + // day
                        ` ${match[4]}:` + //hour
                        `0${match[5]}:`.slice(-3) + // minutes
                        `0${match[6]}`.slice(-2) // seconds
            }
            catch(e) {
            }
        }
        return;
    }

};

// @ts-ignore (ADD #1)
window.importImage  = FORMS.importImage;
// @ts-ignore (ADD #1)
window.importImages = FORMS.importImages;
// ADD #1 end