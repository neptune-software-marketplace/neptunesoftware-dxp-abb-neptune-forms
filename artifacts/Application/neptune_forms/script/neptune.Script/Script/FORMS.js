jQuery.sap.require("sap.m.MessageBox");

const FORMS = {
    model: null,
    config: null,
    items: null,
    cache: [],
    customerParent: null,
    formParent: null,
    formTitleHide: [],
    editable: true,
    bindingPath: "",
    columnTemplate: null,
    formTemplate: null,
    sessionid: null,
    validationCheck: false,
    signatures: {},
    uploadObject: null,
    colHeaders: {},
    colSorting: {},
    paginationSetup: {},
    enhancement: {},
    allFileTypes: ["bmp","doc","docx","jpg","jpeg","heic","heif","pdf","png","ppt","pptx","xls","xlsx"],
    attachmentsPromise: [],
    fileUploaders: [],
    // fileUploader: new sap.ui.unified.FileUploader(),

    build: function (parent, options) {
        let formOptions;
        let formId;

        if (typeof options === "string") {
            formId = options;
            formOptions = {};
        } else {
            formId = options.id;
            formOptions = JSON.parse(JSON.stringify(options));
        }

        if (!parent) {
            sap.m.MessageToast.show("Parent UI Container is missing in the interface");
            return;
        }

        FORMS.customerParent = parent;

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
    },

    buildForm: function (parent, options) {
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
                backgroundDesign: "Transparent",
            }).addStyleClass("sapUiNoContentPadding");

            FORMS.formParent.onAfterRendering = function (oEvent) {
                FORMS.formTitleHide.forEach(function (fieldID) {
                    const formTitle = sap.ui.getCore().byId(fieldID);
                    const formTitleDomRef = formTitle.getDomRef();
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
        } else {
            formModel.setData({});
        }

        FORMS.formParent.setModel(formModel);
        if (!options.data) FORMS.setDefaultValues();
        formModel.refresh(true);

        let sectionParent;

        // Section
        options.config.setup.forEach(function (section, i) {
            if (!section) return;
            if (section.disabled) return;

            switch (section.type) {
                case "Form":
                    FORMS.bindingPath = "/";
                    sectionParent = FORMS.buildParentForm(section);
                    break;

                case "Table":
                    FORMS.bindingPath = "";
                    sectionParent = FORMS.buildParentTable(section);
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
            switch (section.type) {
                case "Table":
                    const tabModel = new sap.ui.model.json.JSONModel();
                    let modelData = [];

                    sectionParent.setModel(tabModel);

                    const bindingField = section.fieldName ? section.fieldName : section.id;

                    if (options.data && options.data[bindingField] && options.data[bindingField].length) {
                        // KW addition (add init. sort value) // 28.11.2023
                        var i = 0;
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
                    break;
            }
        });

        if (parent.addContent) parent.addContent(FORMS.formParent);
        if (parent.addItem) parent.addItem(FORMS.formParent);
    },

    setDefaultValues: function () {
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
                    formModel.oData[bindingField] = "";
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
    },

    buildRowTemplate: function (elements) {
        let newRec = { id: ModelData.genID() };

        elements.forEach(function (element, i) {
            const bindingField = element.fieldName ? element.fieldName : element.id;

            switch (element.type) {
                case "SingleChoice":
                case "SegmentedButton":
                    if (element.items && !element.noDefault) {
                        const firstItem = element.items[0];
                        newRec[bindingField] = firstItem.key;
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
                    break;
            }
        });

        return newRec;
    },

    paginationHandle: function (section, sort = false, lastPage = false) {
        const tabObject = sap.ui.getCore().byId("field" + section.id);
        const tabModel = tabObject.getModel();
        const take = parseInt(FORMS.paginationSetup[section.id].take);

        const tableData = FORMS.paginationSetup[section.id].data;
        let filterData = FORMS.paginationSetup[section.id].filter ? FORMS.filterArray(tableData, FORMS.paginationSetup[section.id].filter) : tableData;

        // Sorting
        if (sort && FORMS.paginationSetup[section.id].sortField) {
            filterData = FORMS.sortArray(filterData, FORMS.paginationSetup[section.id].sortField, FORMS.paginationSetup[section.id].sortOrder);
        }

        // Add RowNumber
        FORMS.tableAddRowNumber(filterData);

        // Total Number of Entries
        FORMS.paginationSetup[section.id].count = filterData.length;

        const counter = sap.ui.getCore().byId("counter" + section.id);
        if (counter) counter.setNumber("(" + FORMS.paginationSetup[section.id].count + ")");

        // Set Table Data
        let startIndex = take * FORMS.paginationSetup[section.id].index;

        if (startIndex === FORMS.paginationSetup[section.id].count) {
            startIndex = startIndex - take;
            FORMS.paginationSetup[section.id].index--;
        }

        tabModel.setData(filterData.slice(startIndex, startIndex + take));
        tabModel.refresh();

        // UI Setup
        let maxIndex = filterData.length / take;
        maxIndex = Math.ceil(maxIndex);

        if (filterData.length <= take) maxIndex = 1;

        let toolPaginationFirst = sap.ui.getCore().byId("paginationFirst" + section.id);
        let toolPaginationPrev = sap.ui.getCore().byId("paginationPrev" + section.id);
        let toolPaginationNext = sap.ui.getCore().byId("paginationNext" + section.id);
        let toolPaginationLast = sap.ui.getCore().byId("paginationLast" + section.id);
        let toolPaginationPages = sap.ui.getCore().byId("paginationPages" + section.id);
        let toolPaginationTitle = sap.ui.getCore().byId("paginationTitle" + section.id);

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

        for (i = startItem; i < maxIndex; i++) {
            if (numItems <= maxItems) toolPaginationPages.addItem(new sap.m.SegmentedButtonItem({ text: i + 1, key: i }));
            numItems++;
        }

        toolPaginationPages.setSelectedKey(FORMS.paginationSetup[section.id].index);
        toolPaginationTitle.setNumber(FORMS.paginationSetup[section.id].index + 1 + "/" + maxIndex);

        if (lastPage) {
            toolPaginationLast.firePress();
        }
    },

    filterArray: function (jsonArray, filter) {
        const result = jsonArray.filter((item) => {
            return Object.entries(item).some(([key, value]) => {
                return key !== "id" && key !== "rowNumber" && String(value).toLowerCase().includes(filter.toLowerCase());
            });
        });
        return result;
    },

    sortArray: function (jsonArray, field, sortOrder = "Ascending") {
        const sortedArray = jsonArray.sort((a, b) => {
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
        });
        return sortedArray;
    },

    tableAddRowNumber: function (modelData) {
        for (let i = 0; i < modelData.length; i++) {
            modelData[i].rowNumber = i + 1;
        }

        return modelData;
    },

    buildParentForm: function (section) {
        const sectionPanel = new sap.m.Panel(FORMS.buildElementFieldID(section), {
            headerText: section.title,
            backgroundDesign: "Solid",
            visible: FORMS.buildVisibleCond(section),
            expandable: section.expandable || false,
            expanded: section.expanded || false,
        }).addStyleClass("sapUiSmallMarginTopBottom sapUiNoContentPadding");

        const sectionForm = new sap.ui.layout.form.SimpleForm({
            layout: "ResponsiveGridLayout",
            editable: true,
            labelSpanL: parseInt(section.labelSpan) || 4,
            labelSpanM: parseInt(section.labelSpan) || 4,
            labelSpanS: 12,
            columnsL: parseInt(section.columns) || 2,
            columnsM: 2,
        }).addStyleClass("sapUiNoContentPadding");

        if (section.enableCompact) sectionForm.addStyleClass("sapUiSizeCompact");

        sectionForm.addStyleClass("FormsSimpleForm");

        sectionPanel.addContent(sectionForm);
        
        FORMS.formParent.addContent(sectionPanel);

        return sectionForm;
    },

    buildParentFormChildren: function (parent, element, section, index, elementField) {
        // Form Title
        if (element.type === "FormTitle") {
            parent.addContent(elementField);
            return;
        }

        // Label
        if (element.enableLabel) {
            const elementLabel = new sap.m.Label({
                text: element.title,
                required: element.required,
                design: "Bold",
            });

            if (section.labelLeftAlign) elementLabel.addStyleClass("nepLabelLeftAlign");

            parent.addContent(elementLabel);
        } else {
            parent.addContent(new sap.m.Label());
        }

        // Form Container
        const elementParent = new sap.m.VBox({
            width: "100%",
            wrap: "Wrap",
            visible: FORMS.buildVisibleCond(element),
        });

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
                        let options = {
                            parameters: {
                                formid: FORMS.config.id,
                                elementid: element.id,
                            },
                        };

                        if (FORMS.config.enablesession) {
                            options.parameters.sessionid = FORMS.sessionid;
                        }

                        apiElementLog(options).then(function (res) {
                            FORMS.buildLogDialog(res);
                        });
                    },
                }).addStyleClass("sapUiSizeCompact")
            );
        }

        // Duplicate
        if (element.enableDuplicate && FORMS.editable) {
            if (element.isDuplicate) {
                elementParent.addItem(
                    new sap.m.Button({
                        icon: "sap-icon://delete",
                        type: "Reject",
                        press: function (oEvent) {
                            let data = FORMS.getData();
                            data.completed = false;

                            let parent = FORMS.getDuplicateParentFromId(element.id, data);
                            parent.elements.splice(index, 1);

                            FORMS.build(FORMS.customerParent, data);
                        },
                    }).addStyleClass("sapUiSizeCompact")
                );
            } else {
                elementParent.addItem(
                    new sap.m.Button({
                        text: element.duplicateButtonText,
                        type: element.duplicateButtonType,
                        icon: element.duplicateButtonIcon,
                        press: function (oEvent) {
                            let data = FORMS.getData();
                            data.completed = false;

                            let newElement = JSON.parse(JSON.stringify(element));
                            newElement.id = ModelData.genID();
                            newElement.isDuplicate = true;

                            // Object Attribute
                            if (newElement.fieldName) newElement.fieldName = newElement.fieldName + "_" + ModelData.genID();

                            if (newElement.items) {
                                newElement.items.forEach(function (item) {
                                    item.id = ModelData.genID();
                                });
                            }

                            let parent = FORMS.getDuplicateParentFromId(element.id, data);
                            parent.elements.splice(index + 1, 0, newElement);

                            FORMS.build(FORMS.customerParent, data);
                        },
                    }).addStyleClass("sapUiSizeCompact")
                );
            }
        }

        parent.addContent(elementParent);
    },

    buildVisibleCond: function (element) {
        if (!element) return;
        if (!element.enableVisibleCond) return;

        // Migrate Old->New
        if (element.visibleFieldName && element.visibleCondition && element.visibleValue && !element.visibility?.length) {
            element.visibility = [
                {
                    visibleFieldName: element.visibleFieldName,
                    visibleCondition: element.visibleCondition,
                    visibleValue: [element.visibleValue],
                },
            ];
        }

        if (!element.visibility?.length) return;

        // Top Parameters
        let bindingPath = element.type === "Table" ? "/" : FORMS.bindingPath;
        let visibleStatement = element.visibleInverse === "hide" ? "false:true" : "true:false";

        let visibleWhere = "";
        let visibleWhereSep = "";
        let expression;

        element.visibility.forEach(function (condition, index) {
            if (!condition.visibleFieldName) return;
            if (!condition.visibleCondition) return;
            if (!condition.visibleValue?.length) return;

            let visibleValueSep = condition.visibleValue === "true" || condition.visibleValue === "false" ? "" : "'";
            let visibleFieldName = condition.visibleFieldName;

            // Check if field have object attributes
            const checkElement = FORMS.getElementFromId(condition.visibleFieldName);
            if (!checkElement) return;

            // Object Attributes vs Field ID
            if (checkElement.fieldName) visibleFieldName = checkElement.fieldName;

            let visibleFieldOptions = "";
            let visibleFieldOptionsSep = "";

            condition.visibleValue.forEach(function (value) {
                switch (checkElement.type) {
                    case "Switch":
                    case "CheckBox":
                        if (value === "true") {
                            visibleFieldOptions += visibleFieldOptionsSep + "${" + bindingPath + visibleFieldName + "}" + condition.visibleCondition + "true";
                        } else if (value === "false") {
                            visibleFieldOptions += visibleFieldOptionsSep + "${" + bindingPath + visibleFieldName + "}" + condition.visibleCondition + "false";
                        }
                        break;

                    case "Input":
                    case "TextArea":
                        if (condition.visibleCondition === "===") {
                            visibleFieldOptions += visibleFieldOptionsSep + "!${" + bindingPath + visibleFieldName + "}";
                        } else {
                            visibleFieldOptions += visibleFieldOptionsSep + "${" + bindingPath + visibleFieldName + "} !== ''";
                        }
                        break;

                    default:
                        visibleFieldOptions += visibleFieldOptionsSep + "${" + bindingPath + visibleFieldName + "}.includes('" + value + "')";
                        break;
                }

                switch (condition.visibleCondition) {
                    case "any":
                        visibleFieldOptionsSep = " || ";
                        break;

                    default:
                        visibleFieldOptionsSep = "  && ";
                        break;
                }
            });

            if (index !== 0) {
                visibleWhereSep = condition.visibleSep === "or" ? " || " : " && ";
            }

            if (visibleFieldOptions) {
                visibleWhere += visibleWhereSep + "(" + visibleFieldOptions + ")";
            }
        });

        if (visibleWhere) {
            expression = `{= ${visibleWhere} ? ${visibleStatement} }`;
        } else {
            expression = true;
        }

        console.log(expression);
        return expression;
    },

    buildParentTable: function (section) {
        const sectionTable = new sap.m.Table(FORMS.buildElementFieldID(section), {
            showSeparators: sap.m.ListSeparators.None,
            backgroundDesign: "Solid",
            contextualWidth: "Auto",
            sticky: ["ColumnHeaders", "HeaderToolbar"],
            showNoData: false,
            delete: function (oEvent) {
                const context = oEvent.mParameters.listItem.getBindingContext();
                const data = context.getObject();

                if (section.enablePagination) {
                    const model = FORMS.paginationSetup[section.id].data;
                    ModelData.Delete(model, "id", data.id);
                    FORMS.paginationHandle(section);
                } else {
                    const model = this.getModel();
                    ModelData.Delete(model, "id", data.id);
                    FORMS.tableAddRowNumber(model.oData);
                }
            },
            updateFinished: function (oEvent) {
                const counter = sap.ui.getCore().byId("counter" + section.id);
                if (counter) {
                    let length = 0;
                    if (section.enablePagination) {
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

        // Table Parent
        const sectionPanel = new sap.m.Panel("section" + section.id, {
            visible: FORMS.buildVisibleCond(section),
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
                type: "Emphasized",
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
                        FORMS.handleColumnSorting(sectionTable, bindingField, "Ascending");
                    }
                },
            })
        );

        // Enable Add
        if (section.enableCreate && FORMS.editable) {
            sectionToolbar.addContent(
                new sap.m.Button({
                    text: "Add",
                    type: "Emphasized",
                    press: function (oEvent) {
                        var newRec = FORMS.buildRowTemplate(section.elements);

                        if (section.enablePagination) {
                            const model = FORMS.paginationSetup[section.id].data;
                            newRec.initsort = model.length + 1;
                            model.push(newRec);
                            FORMS.paginationHandle(section, false, true);
                        } else {
                            const model = sectionTable.getModel();
                            newRec.initsort = model.oData.length + 1;
                            model.oData.push(newRec);
                            FORMS.tableAddRowNumber(model.oData);
                            model.refresh();
                        }
                    },
                })
            );
        }

        const butMultiSwitch = new sap.m.Button({
            icon: "sap-icon://multiselect-all",
            type: "Transparent",
            tooltip: "Switch to multi select",
            press: function (oEvent) {
                sectionTable.setMode("MultiSelect");
                butSingleSwitch.setVisible(true);
                butMultiDelete.setVisible(true);
                butMultiSwitch.setVisible(false);
            },
        }).addStyleClass("sapUiSizeCompact");

        const butSingleSwitch = new sap.m.Button({
            icon: "sap-icon://multiselect-none",
            type: "Transparent",
            tooltip: "Switch to single select",
            visible: false,
            press: function (oEvent) {
                sectionTable.setMode("Delete");
                butSingleSwitch.setVisible(false);
                butMultiDelete.setVisible(false);
                butMultiSwitch.setVisible(true);
            },
        }).addStyleClass("sapUiSizeCompact");

        const fieldID = section.fieldName ? section.fieldName : section.id;

        const butMultiDelete = new sap.m.Button({
            icon: "sap-icon://delete",
            type: "Reject",
            visible: false,
            press: function (oEvent) {
                const tabData = section.enablePagination ? FORMS.paginationSetup[section.id].data : sectionTable.getModel().oData;
                const selectedItems = sectionTable.getSelectedItems();
                const items = [];

                if (selectedItems) {
                    selectedItems.forEach(function (item) {
                        const context = item.getBindingContext();
                        if (context) {
                            const data = context.getObject();
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
            },
        }).addStyleClass("sapUiSizeCompact");

        sectionPanel.setHeaderToolbar(sectionToolbar);

        // Enable Delete
        if (section.enableDelete && FORMS.editable) {
            sectionTable.setMode("Delete");
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
        if (section.enableCopy && FORMS.editable) {
            const newColumn = new sap.m.Column({ width: "50px" });

            sectionTable.addColumn(newColumn);

            columListItem.addCell(
                new sap.m.Button({
                    icon: "sap-icon://copy",
                    type: "Transparent",
                    press: function (oEvent) {
                        const context = oEvent.oSource.getBindingContext();
                        const data = context.getObject();
                        FORMS.buildCopyDialog(section, columListItem, section.id, data.id);
                    },
                })
            );
        }

        // Show Row Number
        if (section.enableRowNumber) {
            const colRowNumber = new sap.m.Column({ width: "30px", sortIndicator: "Ascending", hAlign: "Center" });

            if (!section.enablePagination) {
                colRowNumber.setHeader(new sap.m.Label({ text: "" }));
                FORMS.setColumnSorting(section, sectionTable, colRowNumber, { id: "rowNumber" });
            }

            sectionTable.addColumn(colRowNumber);
            columListItem.addCell(new sap.m.ObjectNumber({ number: "{rowNumber}" }));
        }

        sectionPanel.addContent(sectionTable);

        FORMS.formParent.addContent(sectionPanel);
        FORMS.columnTemplate = columListItem;

        // Table Layout
        if (section.layout === "form") {
            FORMS.formTemplate = new sap.ui.layout.form.SimpleForm({
                layout: "ResponsiveGridLayout",
                backgroundDesign: "Transparent",
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
            const toolPagination = new sap.m.Toolbar({ width: "100%", design: "Transparent" }).addStyleClass("sapUiSizeCompact ");

            toolPagination.addContent(
                new sap.m.Text({
                    textAlign: "Center",
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
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 1, key: 1 }));
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 5, key: 5 }));
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 10, key: 10 }));
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 15, key: 15 }));
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 20, key: 20 }));
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 30, key: 30 }));
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 40, key: 40 }));
            toolPaginationShowItems.addItem(new sap.ui.core.ListItem({ text: 50, key: 50 }));
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

            const toolPaginationText = new sap.m.Text({ visible: false, textAlign: "Center", text: "0/0" });

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
        if (section.enableCreate && FORMS.editable) {
            sectionPanel.addContent(
                new sap.m.Button({
                    text: "Add",
                    type: "Emphasized",
                    press: function (oEvent) {
                        if (section.enablePagination) {
                            const model = FORMS.paginationSetup[section.id].data;
                            model.push({ id: ModelData.genID(), initsort: model.length + 1 });
                            FORMS.paginationHandle(section, false, true);
                        } else {
                            const model = sectionTable.getModel();
                            model.oData.push({ id: ModelData.genID(), initsort: model.oData.length + 1 });
                            FORMS.tableAddRowNumber(model.oData);
                            model.refresh();
                        }
                    },
                }).addStyleClass("sapUiSizeCompact sapUiSmallMargin")
            );
        }

        return sectionTable;
    },

    setColumnSorting: function (section, table, column, element) {
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
                    FORMS.handleColumnSorting(table, bindingField, sortModelOrder);
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
    },

    handleColumnSorting: function (table, bindingField, sortModelOrder) {
        const oSorter = new sap.ui.model.Sorter(bindingField, sortModelOrder, false);
        const binding = table.getBinding("items");
        binding.sort(oSorter);
    },

    handleTableFilter: function (section, table, value) {
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
                            filters.push(new sap.ui.model.Filter(bindingField, "Contains", value));
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
    },

    buildCopyDialog: function (section, columListItem, tableId, rowId) {
        const diaCopy = new sap.m.Dialog({
            draggable: true,
            contentHeight: "800px",
            contentWidth: "800px",
            stretch: sap.ui.Device.system.phone,
            title: "Copy Data",
            afterOpen: function (oEvent) {
                document.addEventListener("click", function closeDialog(oEvent) {
                    if (oEvent.target.id === "sap-ui-blocklayer-popup") {
                        diaCopy.close();
                        document.removeEventListener("click", closeDialog);
                    }
                });
            },
        }).addStyleClass("sapUiContentPadding");

        const bindingField = section.fieldName ? section.fieldName : section.id;
        const table = sap.ui.getCore().byId("field" + tableId);
        const tableData = FORMS.getData().data[bindingField];
        const rowData = ModelData.FindFirst(tableData, "id", rowId);

        // KW addition (add row numbers) // 13.11.2023
        diaCopy.setEndButton(
            new sap.m.Button({
                type: "Transparent",
                text: "Close",
                press: function (oEvent) {
                    // ------
                    let model = table.getModel();
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
                type: "Emphasized",
                text: "OK",
                press: function (oEvent) {
                    let numEntriesCopy = numCopy.getValue();

                    if (numEntriesCopy > maxCopyEntries) {
                        numEntriesCopy = maxCopyEntries;
                    }

                    for (let i = 0; i < numEntriesCopy; i++) {
                        let newRow = {
                            id: ModelData.genID(),
                        };

                        for (var key in rowData) {
                            if (key !== "id") {
                                const element = sap.ui.getCore().byId("include-" + key);
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
                        let model = table.getModel();
                        FORMS.tableAddRowNumber(model.oData);
                        model.refresh();
                    }

                    diaCopy.close();
                },
            }).addStyleClass("sapUiSizeCompact")
        );

        const panCopies = new sap.m.Panel();
        panCopies.addContent(new sap.m.Title({ text: "Number of copies" }));
        const numCopy = new sap.m.StepInput({ width: "100%", min: 1, max: maxCopyEntries, value: 1 }).addStyleClass("sapUiSmallMarginBottom");
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
            backgroundDesign: "Transparent",
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

        tabCopy.addColumn(new sap.m.Column({ width: "100px" }).setHeader(new sap.m.Label({ text: "Include", design: "Bold" })));
        tabCopy.addColumn(new sap.m.Column({ width: "200px" }).setHeader(new sap.m.Label({ text: "Field", design: "Bold" })));
        tabCopy.addColumn(new sap.m.Column({ width: "100%" }).setHeader(new sap.m.Label({ text: "Content", design: "Bold" })));

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
                    const selectedItem = ModelData.FindFirst(element.items, "key", selectedKey);

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
    },

    buildLogDialog: function (res) {
        const diaLog = new sap.m.Dialog({
            draggable: true,
            contentHeight: "800px",
            contentWidth: "800px",
            title: "Log History",
            afterOpen: function (oEvent) {
                document.addEventListener("click", function closeDialog(oEvent) {
                    if (oEvent.target.id === "sap-ui-blocklayer-popup") {
                        diaLog.close();
                        document.removeEventListener("click", closeDialog);
                    }
                });
            },
        }).addStyleClass("sapUiContentPadding");

        diaLog.setEndButton(
            new sap.m.Button({
                type: "Transparent",
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
                layout: "ResponsiveGridLayout",
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
            delete element.config.visibleFieldName;

            element.config._inDialog = true;

            let updatedAtValue = element.updatedAt;
            if (typeof updatedAtValue === "string") updatedAtValue = parseInt(updatedAtValue);

            const updatedAt = oDateFormat.format(new Date(updatedAtValue));

            FORMS.formParent = formParent;
            FORMS.buildElement(formParent, element.config, { type: "Form" }, i);

            var panel = new sap.m.Panel({
                backgroundDesign: "Solid",
                headerText: updatedAt + " - " + element.updatedBy,
            });
            panel.addContent(formParent);

            diaLog.addContent(panel);
        }

        FORMS.bindingPath = "/";
        FORMS.editable = currentEditable;
        FORMS.formParent = currentFormParent;

        diaLog.open();
    },

    buildParentTableChildren: function (parent, element, section, index, elementField) {
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
                newColumn.setPopinDisplay("Block");
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
                }
            }

            // Column Header
            newColumn.setHeader(
                new sap.m.Label(FORMS.buildElementFieldID(element), {
                    text: element.title,
                    required: element.required,
                    design: "Bold",
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
    },

    buildElement: function (parent, element, section, index) {
        let elementField;

        if (element.disabled) return;

        switch (element.type) {
            case "FormTitle":
                elementField = FORMS.buildElementFormTitle(element);
                break;

            case "MessageStrip":
                elementField = FORMS.buildElementMessageStrip(element);
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
                elementField = FORMS.buildElementSegmentedButton(element);
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
                elementField = FORMS.buildElementMediaLib(element, parent);
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

            default:
                break;
        }

        if (!elementField) return;

        // Custom CSS
        if (elementField.addStyleClass) elementField.addStyleClass("FormsInput");

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
    },

    buildElementFieldID: function (element) {
        if (element._inDialog) {
            return "log" + ModelData.genID();
        } else {
            return "field" + element.id;
        }
    },

    buildElementMessageStrip: function (element) {
        return new sap.m.MessageStrip(FORMS.buildElementFieldID(element), {
            text: element.text,
            showIcon: element.messageIcon,
            type: element.messageType || "Information",
            visible: FORMS.buildVisibleCond(element),
        });
    },

    buildElementFormTitle: function (element) {
        const newField = new sap.ui.core.Title(FORMS.buildElementFieldID(element), {
            text: element.enableLabel ? element.title : "",
        });

        if (!element.enableLabel) {
            FORMS.formTitleHide.push(FORMS.buildElementFieldID(element));
        }

        return newField;
    },

    buildElementInput: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            editable: FORMS.editable,
            placeholder: element.placeholder,
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
            },
        });

        return newField;
    },

    buildElementValueHelp: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            editable: FORMS.editable,
            placeholder: element.placeholder,
            valueHelpOnly: true,
            showValueHelp: true,
            visible: FORMS.buildVisibleCond(element),
            valueHelpRequest: function (oEvent) {
                if (!element.adaptiveApp) return;

                events = {
                    valueRequest: true,
                    valueRequestField: this.sId,
                    valueRequestKey: element.returnField ? element.returnField : "id",
                };

                navigation = {
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

                const adaptiveNavigation = sap.n.Adaptive ? sap.n.Adaptive.navigation : neptune.Adaptive.navigation;
                adaptiveNavigation(navigation, null, events);
            },
        });

        return newField;
    },

    buildElementPicture: function (element) {
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
    },

    buildElementSignature: function (element) {
        if (!element.signatureHeight) element.signatureHeight = 200;

        const newField = new sap.m.Panel(FORMS.buildElementFieldID(element), {
            width: "100%",
            height: element.signatureHeight + "px",
            backgroundDesign: "Transparent",
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
                let signatureCanvas = document.getElementById(canvasId);
                signatureCanvas.width = signatureCanvas.parentNode.clientWidth;
                signatureCanvas.height = element.signatureHeight;
                FORMS.signatures[element.id] = new Signature(signatureCanvas);
                if (signatureData) FORMS.signatures[element.id].fromDataURL(signatureData);
            }, 200);
        });

        newField.addContent(SignatureHTML);

        return newField;
    },

    buildElementText: function (element) {
        const newField = new sap.m.Title(FORMS.buildElementFieldID(element), {
            text: element.text,
            titleStyle: element.titleStyle,
            wrapping: true,
            visible: FORMS.buildVisibleCond(element),
        });

        return newField;
    },

    buildElementTextArea: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.TextArea(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            placeholder: element.placeholder,
            editable: FORMS.editable,
            growing: element.growing,
            rows: parseInt(element.rows),
            width: "100%",
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
            },
        });
        if (element.rows) newField.setRows(parseInt(element.rows));

        return newField;
    },

    buildElementRating: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.RatingIndicator(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            editable: FORMS.editable,
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
    },

    buildElementNumeric: function (element) {
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
                    resNum = parseFloat(float).toFixed(decimals);
                } else {
                    //Index of first full stop
                    const posFS = float.indexOf(".");

                    if (posFS === -1) {
                        //Uses commas and not full stops - swap them (e.g. 1,23 --> 1.23)
                        resNum = parseFloat(float.replace(/\,/g, ".")).toFixed(decimals);
                    } else {
                        //Uses both commas and full stops - ensure correct order and remove 1000s separators
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
            editable: FORMS.editable,
            // KW addition (number fields are empty after parsing on iOS) // 27.11.2023
            //type: "Number",
            change: function (oEvent) {
                this.setValue(fnParseFloat(this.getValue(), element.decimals));
            },
            liveChange: async function (oEvent) {
                this.setValueState();
            },
            visible: FORMS.buildVisibleCond(element),
        });

        // KW addition (number fields are empty after parsing on iOS) // 27.11.2023
        newField.addStyleClass("numField");
        return newField;
    },

    buildElementStepInput: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.StepInput(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            placeholder: element.placeholder,
            editable: FORMS.editable,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
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
    },

    buildElementSwitch: function (element) {
        // KW addition (parse "boolean strings" as boolean values) // 13.11.2023
        var SwitchBoolean = sap.ui.model.SimpleType.extend("sap.ui.model.type.Boolean", {
            formatValue: function (oValue) {
                var boolAns = false;
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
            },
            parseValue: function (oValue) {
                return oValue;
            },
            validateValue: function (oValue) {
                return true;
            },
        });

        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Switch(FORMS.buildElementFieldID(element), {
            // state: "{" + FORMS.bindingPath + bindingField + "}",
            // KW addition (parse "boolean strings" as boolean values) // 13.11.2023
            state: { path: FORMS.bindingPath + bindingField, type: new SwitchBoolean() },
            enabled: FORMS.editable,
            customTextOff: element.customTextOff,
            customTextOn: element.customTextOn,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.removeStyleClass("notValid");
            },
        });

        if (element.approveSwitch) {
            newField.setType("AcceptReject");
        }

        return newField;
    },

    buildElementCheckBox: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.CheckBox(FORMS.buildElementFieldID(element), {
            selected: "{" + FORMS.bindingPath + bindingField + "}",
            editable: FORMS.editable,
            text: element.text,
            visible: FORMS.buildVisibleCond(element),
            select: function (oEvent) {
                this.setValueState();
            },
        });

        return newField;
    },

    buildElementSegmentedButton: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.SegmentedButton(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            enabled: FORMS.editable,
            visible: FORMS.buildVisibleCond(element),
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
                newField.addItem(new sap.m.SegmentedButtonItem({ key: "", text: "", width: "0px" }));
                newField.addStyleClass("segmentedNoDefault");
            } else {
                const formModel = FORMS.formParent.getModel();
                if (!formModel.oData[bindingField]) element.defaultValue ? (formModel.oData[bindingField] = element.defaultValue) : (formModel.oData[bindingField] = element.items[0].key);
            }

            element.items.forEach(function (item, i) {
                const newItem = new sap.m.SegmentedButtonItem({ key: item.key, text: item.title, icon: item.icon });

                // Element Width
                if (element.width && element.noDefault) {
                    if (element.widthMetric) {
                        newItem.setWidth(widthItems + "%");
                    } else {
                        newItem.setWidth(widthItems + "px");
                    }
                }

                newField.addItem(newItem);
            });
        }

        return newField;
    },

    buildElementSingleSelectIcon: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Select(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            width: "100%",
            editable: FORMS.editable,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
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
    },

    buildElementSingleSelect: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.ComboBox(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            width: "100%",
            editable: FORMS.editable,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
            },
        });

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

        return newField;
    },

    buildElementSingleChoice: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        let newField;

        newField = new sap.m.RadioButtonGroup(FORMS.buildElementFieldID(element), {
            selectedIndex: null,
            visible: FORMS.buildVisibleCond(element),
        });

        if (element.horizontal) newField.setColumns(10);

        const formModel = FORMS.formParent.getModel();

        element.items.forEach(function (item, i) {
            // Always set first field as default value, as the parent is RadioButtonGroup
            if (i === 0 && !formModel.oData[bindingField]) formModel.oData[bindingField] = item.key;

            const elementRadio = new sap.m.RadioButton("item" + item.id, {
                text: item.title,
                groupName: newField.sId,
                editable: FORMS.editable,
                select: function (oEvent) {
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

        return newField;
    },

    buildElementMultipleSelect: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.MultiComboBox(FORMS.buildElementFieldID(element), {
            selectedKeys: "{" + FORMS.bindingPath + bindingField + "}",
            width: "100%",
            editable: FORMS.editable,
            showSelectAll: true,
            visible: FORMS.buildVisibleCond(element),
            change: function (oEvent) {
                this.setValueState();
            },
        });

        element.items.forEach(function (item, i) {
            newField.addItem(new sap.ui.core.ListItem({ key: item.key, text: item.title }));
        });

        return newField;
    },

    buildElementMultipleChoice: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        let newField;

        if (element.horizontal) {
            newField = new sap.m.HBox(FORMS.buildElementFieldID(element), {
                wrap: "Wrap",
                renderType: "Bare",
                visible: FORMS.buildVisibleCond(element),
            });
        } else {
            newField = new sap.m.VBox(FORMS.buildElementFieldID(element), {
                wrap: "Wrap",
                renderType: "Bare",
                visible: FORMS.buildVisibleCond(element),
            });
        }

        const formModel = FORMS.formParent.getModel();

        element.items.forEach(function (item, i) {
            const elementCheckBox = new sap.m.CheckBox("item" + item.id, {
                text: item.title,
                editable: FORMS.editable,
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
    },

    buildElementDatePicker: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.DatePicker(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            displayFormat: element.displayFormat ? element.displayFormat : "dd.MM.yyyy",
            // KW addition (date from SN not interpreted correctly) // 15.11.2023
            valueFormat: "yyyy-MM-dd",
            editable: FORMS.editable,
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
            },
            change: function (oEvent) {
                this.setValueState();
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

        return newField;
    },

    buildElementImage: function (element, parent) {
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
            enabled: FORMS.editable,
            press: function (oEvent) {
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

        if (element.enableMulti) {
            const tabImages = new sap.f.GridList({
                mode: "Delete",
                showSeparators: "None",
                showNoData: false,
                delete: function (oEvent) {
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
                design: "Transparent",
                height: "2rem",
            }).addStyleClass("sapUiSizeCompact noBorder");

            tabImages.setHeaderToolbar(Toolbar);
            Toolbar.addContent(elementUploader);

            newField.addItem(tabImages);
        } else {
            newField.addItem(elementHBox);
            newField.addItem(elementImage);

            elementHBox.addItem(
                new sap.m.Button({
                    type: "Reject",
                    enabled: FORMS.editable,
                    icon: "sap-icon://delete",
                    tooltip: "Delete Image",
                    visible: "{= ${" + FORMS.bindingPath + bindingField + "} ? true:false}",
                    press: function (oEvent) {
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
    },

    buildElementFile: function (element, parent) {

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
            
            const date = new Date();
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
                    let fileData  = fileLoadedEvent.target.result;
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
                console.log(e);
            }
        };

        const randomId = ModelData.genID();
        const allowedFileTypes = element.fileTypes && element.fileTypes.length > 0 ? element.fileTypes : FORMS.allFileTypes;

        const fnTypeMissmatch = () => {
            const allowedTypesString = allowedFileTypes.join(", ");
            // const allowedTypesString = allowedFileTypes.slice(0, -1).join(", ") + " and " + allowedFileTypes[allowedFileTypes.length - 1];
            
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

        /* Upload start event -> creating a promise */ 
        const fnUploadStart = (oEvent) => {
            let externalResolve, externalReject;
    
            let prUpload = new Promise((resolve, reject) => {
                externalResolve = resolve;
                externalReject  = reject;
            });
            prUpload.id = oEvent.getParameter("id");

            // Attach the resolve and reject methods to the promise to make
            // them triggerable from outside of this method
            prUpload.resolve = externalResolve;
            prUpload.reject  = externalReject;

            FORMS.attachmentsPromise.push(prUpload);
        }

        const elementUploader = new sap.ui.unified.FileUploader("f"+randomId+"inFiles", {
            sendXHR:             true,
            sameFilenameAllowed: true,
            multiple:            false,
            buttonOnly:          true,
            buttonText:          element.text,
            enabled:             FORMS.editable,
            uploadOnChange:      false,
            fileType:            allowedFileTypes,
            visible:             "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/srcExists" + "} ? false:true}",
            uploadUrl:           "/api/functions/Media/FileSave",
            change:              uploadEvent,
            typeMissmatch:       fnTypeMissmatch,
            uploadComplete:      fnUploadComplete,
            uploadStart:         fnUploadStart

        }).addStyleClass("sapUiSizeCompact");

        elementUploader.setAdditionalData(element.selectedFolderName ? element.selectedFolderName + "/" : "/");
        elementUploader.getProcessedBlobsFromArray = function getProcessedBlobsFromArray(arrBlobs) {

            return Promise.all(
                Array.from(arrBlobs).map(async (oldBlob) => {
                    try {
                        let newBlob = oldBlob.slice();
                        // fetch the name from the model because we need to add a timestamp to the filename to make it unique 
                        let newname = FORMS.formParent.getModel().getData()[element.id].name;
                        newBlob.name = newname;
                        return newBlob;
                    } catch (err) {
                        console.log(err);
                        return oldBlob;
                    }
                })
            );
        };

        FORMS.fileUploaders.push({uploader: elementUploader, elem: element});


        /* Link (to the media library), when doc is uploaded */
        const elementFile = new sap.m.Link({
            text: "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/name" + "} && ${" + FORMS.bindingPath + bindingField + "/name" + "}.length > 0 ? ${" + FORMS.bindingPath + bindingField + "/name" + "} :'File'}",
            // icon: "sap-icon://show",
            press: async function (oEvent) {
                const fileAttr = this.getModel().getData()[bindingField];
                let id = fileAttr && fileAttr.id ? fileAttr.id : null;
                if (id) {

                    let blob    = "";
                    let blobUrl = "";

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
            new sap.m.Button({
                type: "Reject",
                enabled: FORMS.editable,
                icon: "sap-icon://delete",
                tooltip: "Remove File",
                visible: "{= ${" + FORMS.bindingPath + bindingField + "} && ${" + FORMS.bindingPath + bindingField + "/srcExists" + "} ? true:false}",
                press: function (oEvent) {
                    let id = this.getModel().getData()[bindingField] && this.getModel().getData()[bindingField].id ? this.getModel().getData()[bindingField].id : null;
                    if (id) {

                        let md = this.getModel();
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
                                                        md.getData()[bindingField] = "";
                                                        md.refresh();
                                                    }
                                                });
                                            });
                                       
                                    } else {
                                        // delete from local object
                                        sap.m.MessageToast.show("File deleted successfully.");
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
    },


    buildElementMediaLib: function (element) {

        let newField;

        if (element.filename && element.link) {

            newField = new sap.m.Link({
                text: element.filename,
                press: function (oEvent) {
                    let t = MediaFunctions.buildLink({url: element.link});
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
    },

    buildElementDateTimePicker: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.DateTimePicker(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            displayFormat: element.displayFormat ? element.displayFormat : "dd.MM.yyyy HH:mm",
            editable: FORMS.editable,
            visible: FORMS.buildVisibleCond(element),
            liveChange: function (oEvent) {
                this.setValueState();
            },
            change: function (oEvent) {
                this.setValueState();
            },
        });

        return newField;
    },

    buildElementCheckList: function (element) {
        const tabCheckList = new sap.m.Table(FORMS.buildElementFieldID(element), {
            showSeparators: sap.m.ListSeparators.None,
            backgroundDesign: "Transparent",
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
            popinDisplay: "Inline",
            minScreenWidth: "Tablet",
            width: "30%",
        });

        tabCheckList.addColumn(colAnswer);

        colAnswer.setHeader(new sap.m.Text({ text: element.answerTitle }));

        // Items
        element.items.forEach(function (item, index) {
            const itemCheckList = new sap.m.ColumnListItem("field" + item.id);

            itemCheckList.addCell(
                new sap.m.Label({
                    text: item.question,
                    required: item.required,
                    wrapping: true,
                })
            );

            let itemAnswer;

            switch (item.type) {
                case "Input":
                    itemAnswer = new sap.m.Input({
                        value: "{/" + item.id + "}",
                        editable: FORMS.editable,
                    });
                    break;

                case "AcceptReject":
                    itemAnswer = new sap.m.Switch({
                        state: "{/" + item.id + "}",
                        enabled: FORMS.editable,
                        type: "AcceptReject",
                    });
                    break;

                case "CheckBox":
                    itemAnswer = new sap.m.CheckBox({
                        selected: "{/" + item.id + "}",
                        editable: FORMS.editable,
                    });
                    break;

                default:
                    itemAnswer = new sap.m.Switch({
                        state: "{/" + item.id + "}",
                        enabled: FORMS.editable,
                    });
                    break;
            }

            itemCheckList.addCell(itemAnswer);
            tabCheckList.addItem(itemCheckList);
        });

        return tabCheckList;
    },

    getValid: function () {
        return FORMS.validate("OnlyCheck");
    },

    getData: async function (complete, isDesigner, bUploadFiles) {
        if (!FORMS.formParent) return null;

        if (FORMS.config.savedata && bUploadFiles) {
            await FORMS.uploadAttachments();
        }

        const formModel = FORMS.formParent.getModel();
        const outputData = {};

        let completed = false;
        const process = complete ? "" : "OnlyCheck";
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
                    element.items.forEach(function (item) {
                        if (formModel.oData[item.id]) {
                            outputData[item.id] = formModel.oData[item.id];
                        }
                    });
                    break;

                default:
                    if (element.fieldName) {
                        // KW addition (post false boolean values) // 13.11.2023
                        if (typeof formModel.oData[element.fieldName] == "object" && typeof formModel.oData[element.fieldName].getMonth == "function") {
                            outputData[element.fieldName] = formModel.oData[element.fieldName].toString();
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

                const tabData = section.enablePagination ? FORMS.paginationSetup[section.id].data : tabObject.getModel().oData;

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

        const formData = {
            data: outputData,
            config: FORMS.config,
            completed: completed,
            valid: valid,
        };

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
    },

    clear: function () {
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
                        const field = sap.ui.getCore().byId("item" + item.id);
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
                    const model = field.getModel();
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
    },

    validate: function (process) {
        let validForm = true;
        let fieldCompleted;
        const formModel = FORMS.formParent.getModel();

        const validateElement = function (element) {
            const field = sap.ui.getCore().byId("field" + element.id);
            const bindingField = element.fieldName ? element.fieldName : element.id;

            // Disabled Field
            if (element.disabled) {
                return;
            }

            // Field not visible -> Do not show value
            if (!field?.getDomRef()) {
                delete formModel.oData[bindingField];
                return;
            }

            // If field is required, check value and mark if not valid
            if (element.required) {
                fieldCompleted = formModel.oData[bindingField] ? true : false;
                if (validForm) validForm = fieldCompleted;
                FORMS.validateMarkField(element.id, fieldCompleted, process);
            }

            // MultipleSelect/MultipleChoice
            if (formModel.oData[element.id] && element.validationType !== "noLimit" && (element.type === "MultipleChoice" || element.type === "MultipleSelect")) {
                switch (element.validationType) {
                    case "equalTo":
                        if (formModel.oData[element.id].length !== parseInt(element.validationParam)) {
                            FORMS.validateMarkField(element.id, false, process);
                        }
                        break;

                    case "atMost":
                        if (formModel.oData[element.id].length > parseInt(element.validationParam)) {
                            FORMS.validateMarkField(element.id, false, process);
                        }
                        break;

                    case "atLeast":
                        if (formModel.oData[element.id].length < parseInt(element.validationParam)) {
                            FORMS.validateMarkField(element.id, false, process);
                        }
                        break;

                    default:
                        break;
                }
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
        };

        FORMS.config.setup.forEach(function (section) {
            if (!section) return;
            if (section.type === "Table") {
                const validTable = FORMS.validateTableContentRequired(section, process);
                if (!validTable) validForm = false;
            } else {
                section.elements.forEach(function (element) {
                    validateElement(element);

                    if (element.elements) {
                        element.elements.forEach(function (subElement) {
                            validateElement(subElement);
                        });
                    }
                });
            }
        });

        return validForm;
    },

    validateTableContentRequired: function (section, process) {
        const table = sap.ui.getCore().byId("field" + section.id);

        if (!table) return false;

        const model = table.getModel();

        let validTable = true;
        let requiredFields = [];

        section.elements.forEach(function (element) {
            if (element.required) requiredFields.push(element.fieldName ? element.fieldName : element.id);
        });

        if (model.oData && model.oData.length) {
            model.oData.forEach(function (rowData) {
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

        model.refresh();

        return validTable;
    },

    validateMarkField: function (id, valid, process) {
        if (process === "OnlyCheck") return;
        const validStatus = process === "Reset" ? true : valid;
        const field = sap.ui.getCore().byId("field" + id);

        if (!field) return;

        if (validStatus) {
            if (field.setValueState) {
                field.setValueState();
            } else {
                field.removeStyleClass("notValid");
            }

            if (field.setHighlight) field.setHighlight();
        } else {
            if (field.setValueState) {
                field.setValueState("Error");
            } else {
                field.addStyleClass("notValid");
            }

            if (field.setHighlight) field.setHighlight("Error");
        }
    },

    getElementFromId: function (id) {
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
    },

    getDuplicateParentFromId: function (id, data) {
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
    },

    apiGetForm: function (id) {
        return new Promise(function (resolve) {
            $.ajax({
                type: "GET",
                url: "/api/serverscript/formsclient/get?id=" + id,
                success: function (req, status, xhr) {
                    resolve(req);
                },
                error: function (xhr, status, error) {
                    resolve();
                },
            });
        });
    },

    importImages: function (oEvent) {
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

                    document.getElementById("imageUploader").value = "";
                    document.getElementById("imagesUploader").value = "";
                };

                fileReader.readAsDataURL(file);
            }
        } catch (e) {
            console.log(e);
        }
    },

    imageResize: function (imageData, element) {
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
    },

    getObjectFromId: function (id) {
        let elementData = null;

        FORMS.config.setup.forEach(function (section, i) {
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
    },

    openFile: function(blobUrl) {
        setTimeout(() => {
            var target = "_blank";
            if (sap.ui.Device.system.combi || (sap.ui.Device.os.ios && sap.ui.Device.system.tablet) && window.matchMedia('(display-mode: standalone)').matches) {
                target = '_top';
            }
            window.open(blobUrl, target);
        });
    },

    uploadAttachments: async function() {
            for (const up of FORMS.fileUploaders) {
                up.uploader.upload(true);
            }

            return await Promise.all(FORMS.attachmentsPromise);
    },

    b64toBlob: function (b64Data, contentType='', sliceSize=512) {
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
    },
};

window.importImage  = FORMS.importImage;
window.importImages = FORMS.importImages;
