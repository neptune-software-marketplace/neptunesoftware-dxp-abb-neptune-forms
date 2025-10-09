const customFORMS = {
    elementTypes: [
        // #70 - 2.1. - Begin
        {
            icon: "sap-icon://project-definition-triangle",
            text: "Crossing Angle Calculator",
            type: "AngleCalc",
            parent: false,
            table: true,
            parameter: true, // value can be used for conditional visibility
            // parameter: false, // value can't be used for conditional visibility
            paramType: 'number',
        },
        {
            icon: "sap-icon://collapse-group",
            text: "Cascading Select",
            type: "CascSelect",
            parent: false,
            table: true,
            parameter: true, // value can be used for conditional visibility
            // parameter: false, // value can't be used for conditional visibility
            paramType: 'string',
        },
        {
            icon: "sap-icon://information",
            text: "Information",
            type: "Information",
            parent: false,
            table: true,
            parameter: true, // value can be used for conditional visibility
            // parameter: false, // value can't be used for conditional visibility
            paramType: 'string',
        },
        //       This was commented because it was a test done by KM. It was not an official Neptune change
        // {
        //     icon: "sap-icon://locked",
        //     text: "Non-Editable Input",
        //     type: "NonEditInp",
        //     parent: false,
        //     table: true,
        //     parameter: false, // value can't be used for conditional visibility
        //     paramType: '',
        // }
        // #70 - 2.1. - End
    ],

    initialData: {},

    resetBindingPath: function () {
        // Some UI elements need the binding path to be reset
        //tabMyCalc.mBindingInfos.items.path = "/items";
        tabCascSelectOutput.mBindingInfos.items.path = "/outputItems";
    },

    setCustomElement: function (element) {
        switch (element.type) {
            case "AngleCalc":
                element.decimals = 1;
                // IDs of input fields
                element.inpCrossingDistance1Id = "";
                element.inpCrossingDistance1Title = "";
                element.inpCrossingDistance2Id = "";
                element.inpCrossingDistance2Title = "";
                element.inpPipelineDistanceId = "";
                element.inpPipelineDistanceTitle = "";
                break;

            case "CascSelect":
                element.objectName = ""; //Cache Object
                element.key = "";
                element.parentSelectId = "";
                element.parentSelectTitle = "";
                element.keyPath = {};
                element.outputItems = [];
                element.columns = [];
                break;

            case "Information":
                element.hideElementActive = false;
                break;

            default:
                break;
        }
    },

    updateCustomReference: function (element) {
        function getTitle(id) {
            const refElement = FORMS.getObjectFromId(id);
            if (refElement !== null) {
                return refElement.title;
            } else {
                return "";
            }
        }

        switch (element.type) {
            case "AngleCalc":
                element.inpCrossingDistance1Title = getTitle(element.inpCrossingDistance1Id);
                element.inpCrossingDistance2Title = getTitle(element.inpCrossingDistance2Id);
                element.inpPipelineDistanceTitle = getTitle(element.inpPipelineDistanceId);
                break;

            case "CascSelect":
                element.parentSelectTitle = getTitle(element.parentSelectId);
                if (element.outputItems) { // Ensure outputItems is an initialized array
                    element.outputItems.forEach((item) => {
                        item.title = getTitle(item.id);
                    });
                }
                break;

            default:
                break;
        }
    },

    buildCustomElement: function (element) {
        switch (element.type) {
            case "AngleCalc":
                return buildElementAngleCalc(element);

            case "CascSelect":
                return buildElementCascSelect(element);

            case "Information":
                return buildElementInformation(element);

            default:
                break;
        }
    },

    buildRowTemplateValue: function (element) {
        switch (element.type) {
            case "CascSelect":
                return emptyKey;
            default:
                return "";
        }
    },

    objectCopyPostProcess: function (sourceElement, newElement) {
        if (sourceElement.type === "Form" || sourceElement.type === "Table") {
            let processTypes = [];
            sourceElement.elements.forEach((element) => {
                if (element.type === "AngleCalc" || element.type === "CascSelect") {
                    if (!processTypes.includes(element.type)) processTypes.push(element.type);
                }
            });
            processTypes.forEach((type) => {
                switch (type) {
                    case "AngleCalc":
                        sectionCopyAngleCalcPostProcess(sourceElement, newElement);
                        break;

                    case "CascSelect":
                        sectionCopyCascSelectPostProcess(sourceElement, newElement);
                        break;

                    default:
                        break;
                }
            });
        }
    },

    tablePostProcessing: function (section, element, fromIndex, toIndex) {
        switch (element.type) {
            case "AngleCalc":
                tablePostProcessingAngleCalc(section, element, fromIndex, toIndex);
                break;

            case "CascSelect":
                tablePostProcessingCascSelect(section, element, fromIndex, toIndex);
                break;

            default:
                break;
        }
    },

    tableProcessData: function (section, fromIndex, toIndex, data) {
        section.elements.forEach(function (element) {
            switch (element.type) {
                case "CascSelect":
                    tableProcessCascSelectData(section, element, fromIndex, toIndex, data);
                    break;

                default:
                    break;
            }
        });

        section.elements.forEach(function (element) {
            switch (element.type) {
                case "CascSelect":
                    tableProcessCascSelectEvents(section, element, fromIndex, toIndex);
                    break;

                default:
                    break;
            }
        });
    },

    setSelectFilterFunction: function (sel) {
        sel.setFilterFunction(function (sTerm, oItem) {
            // A case-insensitive 'string contains' filter
            return oItem.getText().match(new RegExp(sTerm, "i"));
        });
    },
};
