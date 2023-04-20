const vb = {
    reportEnableTab1: "{= ${appData>/settings/properties/report/enableTab1} ? true : false }",
    reportEnableTab2: "{= ${appData>/settings/properties/report/enableTab2} ? true : false }",
    reportEnableTab3: "{= ${appData>/settings/properties/report/enableTab3} ? true : false }",
    reportEnableTab4: "{= ${appData>/settings/properties/report/enableTab4} ? true : false }",
    reportEnableTab5: "{= ${appData>/settings/properties/report/enableTab5} ? true : false }",
    reportEnableTabF: "{= ${appData>/settings/properties/report/enableTabF} ? true : false }",

    reportEnableDelete: "{= ${appData>/settings/properties/report/enableDelete} ? true : false }",
    reportEnableSave: "{= ${appData>/settings/properties/report/enableSave} ? true : false }",
    reportEnableDraft: "{= ${appData>/settings/properties/report/enableDraft} ? true : false }",
    reportEnableClose: "{= ${appData>/settings/properties/report/enableClose} ? true : false }",
    reportEnableAttachment: "{= ${appData>/settings/properties/report/enableAttachment} ? true : false }",

    enableTab0:
        "{= ${appData>/settings/properties/report/enableTab1} || ${appData>/settings/properties/report/enableTab2} || ${appData>/settings/properties/report/enableTab3} || ${appData>/settings/properties/report/enableTab4} || ${appData>/settings/properties/report/enableTab5 || ${appData>/settings/properties/report/enableTabF} ? true : false }",

    buttonTypes: ["Accept", "Attention", "Critical", "Back", "Default", "Emphasized", "Ghost", "Neutral", "Reject", "Transparent", "Unstyled", "Up"],

    type: "{= ${/type} ? false : true }",
    editor: "{= ${/type} === 'Editor' ? true : false }",
    textArea: "{= ${/type} === 'TextArea' ? true : false }",
    valueHelp: "{= ${/type} === 'ValueHelp' ? true : false }",
    stepInput: "{= ${/type} === 'StepInput' ? true : false }",
    dateTimePicker: "{= ${/type} === 'DateTimePicker' ? true : false }",
    multiOrSingleSelectLookup: "{= ${/type} === 'MultiSelectLookup' || ${/type} === 'SingleSelectLookup' ? true : false }",
    placeholder:
        "{= ${/type} === 'CheckBox'  || ${/type} === 'DatePicker' || ${/type} === 'DateTimePicker' || ${/type} === 'Editor' || ${/type} === 'Switch' || ${/type} === 'StepInput' ? false : true }",
};

const metadata = {
    properties: {
        docLink: "https://community.neptune-software.com/documentation/adaptive-template-edit",
        enableForm: true,
        enableTable: true,
        titleForm: "Form",
        titleTable: "Field Mapping",
        iconForm: "/public/icons/s_vwform.gif",
        iconTable: "/public/icons/s_psrela.gif",

        report: {
            titleGeneral: { type: "Title", label: "General" },
            title: { type: "Input", label: "Title", translate: true },
            subTitle: { type: "Input", label: "Sub Title", translate: true },
            avatarIcon: { type: "Icon", label: "Icon" },
            avatarBackgroundColor: {
                type: "SingleSelect",
                label: "Icon Color",
                items: valuesToKeyText(["", "Accent1", "Accent2", "Accent3", "Accent4", "Accent5", "Accent6", "Accent7", "Accent8", "Accent9", "Accent10", "Random"]),
            },
            showIcon: { type: "CheckBox", label: "Icon Visible", default: true },
            actionButtonLeft: { type: "CheckBox", label: "Action Button Left", default: false },

            textGeneral: { type: "Title", label: "Texts" },
            textUnique: { type: "Input", label: "Unique Error", translate: true },

            titleButtonClose: { type: "Title", label: "Button Close", visible: vb.reportEnableClose },
            iconButtonClose: { type: "Icon", label: "Icon", default: "", visible: vb.reportEnableClose },
            textButtonClose: { type: "Input", label: "Text", default: "Close", translate: true, visible: vb.reportEnableClose },
            typeButtonClose: { type: "SingleSelect", label: "Type", default: "Transparent", visible: vb.reportEnableClose, items: valuesToKeyText(vb.buttonTypes) },

            titleButtonSave: { type: "Title", label: "Button Save", visible: vb.reportEnableSave },
            iconButtonSave: { type: "Icon", label: "Icon", default: "", visible: vb.reportEnableSave },
            textButtonSave: { type: "Input", label: "Text", default: "Save", translate: true, visible: vb.reportEnableSave },
            textToastSave: { type: "Input", label: "Message", default: "Saved", translate: true, visible: vb.reportEnableSave },
            typeButtonSave: { type: "SingleSelect", label: "Type", default: "Emphasized", visible: vb.reportEnableSave, items: valuesToKeyText(vb.buttonTypes) },

            titleButtonDraft: { type: "Title", label: "Button Draft", visible: vb.reportEnableDraft },
            iconButtonDraft: { type: "Icon", label: "Icon", default: "", visible: vb.reportEnableDraft },
            textButtonDraft: { type: "Input", label: "Text", default: "Save as draft", translate: true, visible: vb.reportEnableDraft },
            textToastDraft: { type: "Input", label: "Message", default: "Saved as draft", translate: true, visible: vb.reportEnableDraft },
            typeButtonDraft: { type: "SingleSelect", label: "Type", default: "Attention", visible: vb.reportEnableDraft, items: valuesToKeyText(vb.buttonTypes) },

            titleButtonDelete: { type: "Title", label: "Button Delete", visible: vb.reportEnableDelete },
            iconButtonDelete: { type: "Icon", label: "Icon", default: "", visible: vb.reportEnableDelete },
            textButtonDelete: { type: "Input", label: "Text", default: "Delete", translate: true, visible: vb.reportEnableDelete },
            textToastDelete: { type: "Input", label: "Message", default: "Deleted", translate: true, visible: vb.reportEnableDelete },
            typeButtonDelete: { type: "SingleSelect", label: "Type", default: "Reject", visible: vb.reportEnableDelete, items: valuesToKeyText(vb.buttonTypes) },

            titleButtonAttachment: { type: "Title", label: "Button Attachment", visible: vb.reportEnableAttachment },
            iconButtonAttachment: { type: "Icon", label: "Icon", default: "", visible: vb.reportEnableAttachment },
            textButtonAttachment: { type: "Input", label: "Text", default: "Add Attachment", translate: true, visible: vb.reportEnableAttachment },
            typeButtonAttachment: { type: "SingleSelect", label: "Type", default: "Transparent", visible: vb.reportEnableAttachment, items: valuesToKeyText(vb.buttonTypes) },

            titleTabF: { type: "Title", label: "Tab Forms", visible: vb.enableTabF },
            tabFText: { type: "Input", label: "Text", default: "FORM", visible: vb.enableTabF, translate: true },
            tabFIcon: { type: "Icon", label: "Icon", visible: vb.enableTabF },

            fieldFormId: { type: "TableFieldLocal", label: "Form ID", visible: vb.enableTabF },
            fieldFormData: { type: "TableFieldLocal", label: "Form Data", visible: vb.enableTabF },
            fieldFormStatus: { type: "TableFieldLocal", label: "Form Status", visible: vb.enableTabF },
            fieldFormFetch: { type: "CheckBox", label: "Always use latest config", visible: vb.enableTabF },

            titleTab0: { type: "Title", label: "Tab Main", visible: vb.enableTab0 },
            tab0Text: { type: "Input", label: "Text", default: "General", visible: vb.enableTab0, translate: true },
            tab0Icon: { type: "Icon", label: "Icon", visible: vb.enableTab0 },

            titleTabA: {
                type: "Title",
                label: "Tab Attachment",
                visible: vb.reportEnableAttachment,
            },
            tabAText: {
                type: "Input",
                label: "Text",
                default: "Attachment",
                visible: vb.reportEnableAttachment,
                translate: true,
            },
            tabAIcon: { type: "Icon", label: "Icon", visible: vb.reportEnableAttachment },

            titleTab1: { type: "Title", label: "Tab 1", visible: vb.reportEnableTab1 },
            tab1Text: {
                type: "Input",
                label: "Text",
                default: "Tab 1",
                visible: vb.reportEnableTab1,
                translate: true,
            },
            tab1Icon: { type: "Icon", label: "Icon", visible: vb.reportEnableTab1 },
            tab1Nav: { type: "NavigationChild", label: "Child", visible: vb.reportEnableTab1 },

            titleTab2: { type: "Title", label: "Tab 2", visible: vb.reportEnableTab2 },
            tab2Text: {
                type: "Input",
                label: "Text",
                default: "Tab 2",
                visible: vb.reportEnableTab2,
                translate: true,
            },
            tab2Icon: { type: "Icon", label: "Icon", visible: vb.reportEnableTab2 },
            tab2Nav: { type: "NavigationChild", label: "Child", visible: vb.reportEnableTab2 },

            titleTab3: { type: "Title", label: "Tab 3", visible: vb.reportEnableTab3 },
            tab3Text: {
                type: "Input",
                label: "Text",
                default: "Tab 3",
                visible: vb.reportEnableTab3,
                translate: true,
            },
            tab3Icon: { type: "Icon", label: "Icon", visible: vb.reportEnableTab3 },
            tab3Nav: { type: "NavigationChild", label: "Child", visible: vb.reportEnableTab3 },

            titleTab4: { type: "Title", label: "Tab 4", visible: vb.reportEnableTab4 },
            tab4Text: {
                type: "Input",
                label: "Text",
                default: "Tab 4",
                visible: vb.reportEnableTab4,
                translate: true,
            },
            tab4Icon: { type: "Icon", label: "Icon", visible: vb.reportEnableTab4 },
            tab4Nav: { type: "NavigationChild", label: "Child", visible: vb.reportEnableTab4 },

            titleTab5: { type: "Title", label: "Tab 5", visible: vb.reportEnableTab5 },
            tab5Text: {
                type: "Input",
                label: "Text",
                default: "Tab 5",
                visible: vb.reportEnableTab5,
                translate: true,
            },
            tab5Icon: { type: "Icon", label: "Icon", visible: vb.reportEnableTab5 },
            tab5Nav: { type: "NavigationChild", label: "Child", visible: vb.reportEnableTab5 },

            titleProperties: { type: "Title", label: "Properties" },
            enableClose: { type: "CheckBox", label: "Enable Close", default: true },
            enableDraft: { type: "CheckBox", label: "Enable Draft", default: true },
            enableSave: { type: "CheckBox", label: "Enable Save", default: true },
            enableDelete: { type: "CheckBox", label: "Enable Delete", default: false },
            enableAttachment: { type: "CheckBox", label: "Enable Attachment", default: false },
            enableTabF: { type: "CheckBox", label: "Enable FORMS", default: false },
            enableTab1: { type: "CheckBox", label: "Enable Tab 1", default: false },
            enableTab2: { type: "CheckBox", label: "Enable Tab 2", default: false },
            enableTab3: { type: "CheckBox", label: "Enable Tab 3", default: false },
            enableTab4: { type: "CheckBox", label: "Enable Tab 4", default: false },
            enableTab5: { type: "CheckBox", label: "Enable Tab 5", default: false },
            enableUppercase: { type: "CheckBox", label: "Enable Uppercase", default: false },
            enablePadding: { type: "CheckBox", label: "Enable Padding", default: true },
        },

        form: {
            titleLayout: { type: "Title", label: "Layout" },

            formLayout: {
                type: "SingleSelect",
                label: "Layout",
                items: valuesToKeyText(["", "ColumnLayout", "GridLayout", "ResponsiveGridLayout", "ResponsiveLayout"]),
            },

            columnsL: {
                type: "SingleSelect",
                label: "Columns L",
                items: valuesToKeyText(["", "1", "2", "3", "4"]),
            },

            columnsM: {
                type: "SingleSelect",
                label: "Columns M",
                items: valuesToKeyText(["", "1", "2", "3", "4"]),
            },

            labelSpanL: {
                type: "SingleSelect",
                label: "LabelSpan L",
                items: valuesToKeyText(["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
            },

            labelSpanM: {
                type: "SingleSelect",
                label: "LabelSpan M",
                items: valuesToKeyText(["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
            },

            titleLevel: {
                type: "SingleSelect",
                label: "Title Size",
                items: valuesToKeyText(["", "H1", "H2", "H3", "H4", "H5", "H6"]),
            },

            titleProperties: { type: "Title", label: "Properties" },
            enableCompact: { type: "CheckBox", label: "Compact Mode", default: false },
            enableCentered: { type: "CheckBox", label: "Centered Mode", default: true },

            title1ReadOnly: { type: "Title", label: "ReadOnly - Requirement 1" },
            field1ReadOnly: { type: "TableFieldLocal", label: "Field" },
            operator1ReadOnly: {
                type: "SingleSelect",
                label: "Operator",
                items: [
                    { key: "", text: "" },
                    { key: "===", text: "Equal" },
                    { key: "!==", text: "Not Equal" },
                    { key: ">=", text: "Greater and Equal to" },
                    { key: "<=", text: "Lesser and Equal to" },
                    { key: ">", text: "Greater than" },
                    { key: "<", text: "Lesser than" },
                ],
            },
            value1ReadOnly: { type: "Input", label: "Fixed Value" },
            sysvar1ReadOnly: {
                type: "SingleSelect",
                label: "System Variable",
                items: valuesToKeyText(["", "UserName"]),
            },

            title2ReadOnly: { type: "Title", label: "ReadOnly - Requirement 2" },
            field2ReadOnly: { type: "TableFieldLocal", label: "Field" },
            operator2ReadOnly: {
                type: "SingleSelect",
                label: "Operator",
                items: [
                    { key: "", text: "" },
                    { key: "===", text: "Equal" },
                    { key: "!==", text: "Not Equal" },
                    { key: ">=", text: "Greater and Equal to" },
                    { key: "<=", text: "Lesser and Equal to" },
                    { key: ">", text: "Greater than" },
                    { key: "<", text: "Lesser than" },
                ],
            },

            value2ReadOnly: { type: "Input", label: "Fixed Value" },
            sysvar2ReadOnly: {
                type: "SingleSelect",
                label: "System Variable",
                items: valuesToKeyText(["", "UserName"]),
            },
        },
    },

    fieldsSel: {
        titleGeneral: { type: "Title", label: "General" },
        text: { type: "Input", label: "Label" },
        type: {
            type: "SingleSelect",
            label: "Field Type",
            items: valuesToKeyText([
                "Input",
                "CheckBox",
                "DatePicker",
                "DateTimePicker",
                "Editor",
                "MultiSelect",
                "MultiSelectLookup",
                "SingleSelect",
                "SingleSelectLookup",
                "Switch",
                "StepInput",
                "TextArea",
                "ValueHelp",
            ]),
        },

        inputType: {
            type: "SingleSelect",
            label: "Input Type",
            visible: vb.type,
            items: valuesToKeyText(["Email", "Number", "Password", "Tel", "|Text", "Url"]),
        },
        placeholder: { type: "Input", label: "Placeholder", visible: vb.placeholder },
        description: { type: "Input", label: "Description" },

        titleValueHelp: { type: "Title", label: "ValueHelp Source", visible: vb.valueHelp },
        valueRequestKey: { type: "Input", label: "Field to Return", visible: vb.valueHelp },
        navigation: { type: "Navigation", label: "Open", visible: vb.valueHelp },

        dateTimePickerMinutesStep: {
            type: "Input",
            label: "Step Minutes",
            visible: vb.dateTimePicker,
        },
        dateTimePickerSecondsStep: {
            type: "Input",
            label: "Step Seconds",
            visible: vb.dateTimePicker,
        },
        dateTimePickerFormat: {
            type: "Input",
            label: "Display Format",
            visible: vb.dateTimePicker,
        },

        stepInputMin: {
            type: "Input",
            label: "Min",
            visible: vb.stepInput,
            placeholder: "Min value",
        },
        stepInputMax: {
            type: "Input",
            label: "Max",
            visible: vb.stepInput,
            placeholder: "Max value",
        },
        stepInputStep: {
            type: "Input",
            label: "Step",
            visible: vb.stepInput,
            placeholder: "1",
        },

        stepInputTextAlign: {
            type: "SingleSelect",
            label: "TextAlign",
            visible: vb.typeStepInput,
            items: valuesToKeyText(["", "Begin", "Center", "End", "Initial", "Left", "Right"]),
        },

        textAreaRows: { type: "Input", label: "Rows", visible: vb.textArea },

        editorHeight: { type: "Input", label: "Height", visible: vb.editor },

        titleLookup: { type: "Title", label: "Data Source", visible: vb.multiOrSingleSelectLookup },
        lookupTable: { type: "Table", label: "Table", visible: vb.multiOrSingleSelectLookup },
        lookupFieldKey: {
            type: "TableField",
            label: "Key Field",
            visible: vb.multiOrSingleSelectLookup,
        },
        lookupFieldText: {
            type: "TableField",
            label: "Text Field",
            visible: vb.multiOrSingleSelectLookup,
        },
        lookupFieldAdditional: {
            type: "TableField",
            label: "Additional Text Field",
            visible: vb.multiOrSingleSelectLookup,
        },
        lookupShowOnlyText: {
            type: "CheckBox",
            label: "Hide Key Field",
            visible: vb.multiOrSingleSelectLookup,
        },

        titleDefault: { type: "Title", label: "Default Value" },
        default: { type: "Input", label: "From Value" },
        scriptValue: { type: "Script", label: "From Script" },

        titleLayout: { type: "Title", label: "Layout" },
        columnLabel: { type: "Input", label: "Column Title" },
        enableNewForm: { type: "CheckBox", label: "Start New Form" },

        columnsL: {
            type: "SingleSelect",
            label: "Columns L",
            visible: "{= ${/enableNewForm} ? true: false }",
            items: valuesToKeyText(["", "1", "2", "3", "4"]),
        },

        columnsM: {
            type: "SingleSelect",
            label: "Columns M",
            visible: "{= ${/enableNewForm} ? true: false }",
            items: valuesToKeyText(["", "1", "2", "3", "4"]),
        },

        labelSpanL: {
            type: "SingleSelect",
            label: "LabelSpan L",
            visible: "{= ${/enableNewForm} ? true: false }",
            items: valuesToKeyText(["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
        },

        labelSpanM: {
            type: "SingleSelect",
            label: "LabelSpan M",
            visible: "{= ${/enableNewForm} ? true: false }",
            items: valuesToKeyText(["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
        },

        titleSettings: { type: "Title", label: "Properties" },
        editable: { type: "CheckBox", label: "Editable", default: true },
        required: { type: "CheckBox", label: "Required", default: false },
        visible: { type: "CheckBox", label: "Visible", default: true },

        titleVisibleCond: { type: "Title", label: "Conditional Edit" },
        visibleFieldName: { type: "TableFieldLocal", label: "Field" },
        visibleCondition: {
            type: "SingleSelect",
            label: "Operator",
            items: [
                { key: "", text: "" },
                { key: "===", text: "Equal" },
                { key: "!==", text: "Not Equal" },
                { key: ">=", text: "Greater and Equal to" },
                { key: "<=", text: "Lesser and Equal to" },
                { key: ">", text: "Greater than" },
                { key: "<", text: "Lesser than" },
            ],
        },
        visibleFixedValue: { type: "Input", label: "Fixed Value" },
        visibleSystemValue: {
            type: "SingleSelect",
            label: "System Variable",
            items: valuesToKeyText(["", "UserName"]),
        },
        visibleInverse: {
            type: "CheckBox",
            label: "Inverse Logic",
            visible: vb.tableEnableAction5,
        },
    },

    fieldsRun: {},
};
