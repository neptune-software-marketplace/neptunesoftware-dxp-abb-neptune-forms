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
    sessionid: null,
    validationCheck: false,
    signatures: {},
    uploadObject: null,
    colHeaders: {},
    colSorting: {},

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

        FORMS.editable = true;
        FORMS.formTitleHide = [];
        FORMS.signatures = {};
        FORMS.colHeaders = {};
        FORMS.colSorting = {};
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
                        FORMS.buildElement(sectionParent, subElement, section, iSub);
                    });
                }
            });

            // Post processing
            switch (section.type) {
                case "Table":
                    const tabModel = new sap.ui.model.json.JSONModel();
                    sectionParent.setModel(tabModel);

                    if (options.data && options.data[section.id] && options.data[section.id].length) {
                        tabModel.setData(options.data[section.id]);
                    } else {
                        let modelData = [];
                        let rows = section.rows || 1;

                        for (let i = 0; i < rows; i++) {
                            let newRec = { id: ModelData.genID() };

                            // Default Data
                            section.elements.forEach(function (element, i) {
                                switch (element.type) {
                                    case "SingleChoice":
                                    case "SegmentedButton":
                                        if (element.items) {
                                            const firstItem = element.items[0];
                                            newRec[element.id] = firstItem.key;
                                        }
                                        break;

                                    default:
                                        break;
                                }
                            });

                            modelData.push(newRec);
                        }

                        tabModel.setData(modelData);
                    }

                    // Row Number
                    if (section.enableRowNumber) FORMS.tableAddRowNumber(tabModel.oData);

                    sectionParent.bindAggregation("items", { path: "/", template: FORMS.columnTemplate, templateShareable: false });
                    break;
            }
        });

        if (parent.addContent) parent.addContent(FORMS.formParent);
        if (parent.addItem) parent.addItem(FORMS.formParent);
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
        }).addStyleClass("sapUiSmallMarginTopBottom");

        const sectionForm = new sap.ui.layout.form.SimpleForm({
            layout: "ResponsiveGridLayout",
            editable: true,
            labelSpanL: parseInt(section.labelSpan) || 4,
            labelSpanM: parseInt(section.labelSpan) || 4,
            labelSpanS: 12,
            columnsL: parseInt(section.columns) || 2,
            columnsM: parseInt(section.columns) || 2,
        });

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
                    text: element.logButtonText,
                    type: element.logButtonType,
                    icon: element.logButtonIcon,
                    press: function (oEvent) {
                        const options = {
                            parameters: {
                                formid: FORMS.config.id,
                                elementid: element.id,
                            },
                        };

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

                            let parentData = ModelData.FindFirst(data.config.setup, "id", section.id);
                            if (parentData) parentData.elements.splice(index, 1);

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

                            if (newElement.items) {
                                newElement.items.forEach(function (item) {
                                    item.id = ModelData.genID();
                                });
                            }

                            let parentData = ModelData.FindFirst(data.config.setup, "id", section.id);
                            if (parentData) parentData.elements.splice(index + 1, 0, newElement);

                            FORMS.build(FORMS.customerParent, data);
                        },
                    }).addStyleClass("sapUiSizeCompact")
                );
            }
        }

        parent.addContent(elementParent);
    },

    buildVisibleCond: function (element) {
        if (!element.enableVisibleCond) return;
        if (!element.visibleFieldName) return;
        if (!element.visibleCondition) return;
        if (!element.visibleValue) return;

        let bindingPath = "/"; //element.type === "Table" ? "/" : FORMS.bindingPath;
        let visibleStatement = element.visibleInverse ? "false:true" : "true:false";
        let visibleValueSep = element.visibleValue === "true" || element.visibleValue === "false" ? "" : "'";
        let visibleFieldName = element.visibleFieldName;
        let visibleCond;

        // Check if field have object attributes
        const checkElement = FORMS.getElementFromId(element.visibleFieldName);
        if (checkElement.fieldName) visibleFieldName = checkElement.fieldName;

        if (checkElement.type === "Input" || checkElement.type === "TextArea") {
            if (element.visibleValue === "empty") {
                if (element.visibleCondition === "===") {
                    visibleCond = "{= ${" + bindingPath + visibleFieldName + "} ? false:true }";
                } else {
                    visibleCond = "{= ${" + bindingPath + visibleFieldName + "} ? true:false }";
                }
            }
        } else {
            visibleCond = "{= ${" + bindingPath + visibleFieldName + "} " + element.visibleCondition + " " + visibleValueSep + element.visibleValue + visibleValueSep + " ? " + visibleStatement + " }";
        }

        return visibleCond;
    },

    buildParentTable: function (section) {
        const sectionTable = new sap.m.Table(FORMS.buildElementFieldID(section), {
            showSeparators: sap.m.ListSeparators.None,
            backgroundDesign: "Transparent",
            contextualWidth: "Auto",
            showNoData: false,
            delete: function (oEvent) {
                const model = this.getModel();
                const context = oEvent.mParameters.listItem.getBindingContext();
                const data = context.getObject();
                ModelData.Delete(model, "id", data.id);
                FORMS.tableAddRowNumber(model.oData);
            },
        });

        sectionTable.addStyleClass("FormsTable");

        // Popin
        if (section.popin && sectionTable.setAutoPopinMode) {
            sectionTable.setAutoPopinMode(true);
        }

        // Show Separators
        if (section.enableSeparators) {
            sectionTable.setShowSeparators(sap.m.ListSeparators.Inner);
        }

        const sectionPanel = new sap.m.Panel("section" + section.id, {
            visible: FORMS.buildVisibleCond(section),
        }).addStyleClass("sapUiSmallMarginTopBottom");

        const sectionToolbar = new sap.m.Toolbar().addStyleClass("sapUiSizeCompact");

        sectionToolbar.addContent(
            new sap.m.Title({
                text: section.title,
            })
        );

        sectionToolbar.addContent(new sap.m.ToolbarSpacer());

        // Search Bar
        if (section.enableFilter) {
            sectionToolbar.addContent(
                new sap.m.SearchField({
                    width: "230px",
                    liveChange: function (oEvent) {
                        FORMS.handleTableFilter(sectionTable, this.getValue());
                    },
                })
            );
            sectionToolbar.addContent(new sap.m.ToolbarSeparator());
        }

        // Enable Add
        if (section.enableCreate && FORMS.editable) {
            sectionToolbar.addContent(
                new sap.m.Button({
                    text: "Add",
                    type: "Transparent",
                    press: function (oEvent) {
                        const model = sectionTable.getModel();
                        model.oData.push({ id: ModelData.genID() });
                        FORMS.tableAddRowNumber(model.oData);
                        model.refresh();
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

        const butMultiDelete = new sap.m.Button({
            text: "Delete Selected",
            type: "Reject",
            visible: false,
            press: function (oEvent) {
                const tabModel = sectionTable.getModel();
                const selectedItems = sectionTable.getSelectedItems();

                if (selectedItems) {
                    selectedItems.forEach(function (item) {
                        const context = item.getBindingContext();
                        const data = context.getObject();
                        data.delete = true;
                    });
                    ModelData.Delete(tabModel, "delete", true);
                }

                sectionTable.removeSelections();
            },
        }).addStyleClass("sapUiSizeCompact");

        sectionPanel.setHeaderToolbar(sectionToolbar);

        // Enable Delete
        if (section.enableDelete && FORMS.editable) {
            sectionTable.setMode("Delete");
            sectionToolbar.addContent(butMultiDelete);
            sectionToolbar.addContent(new sap.m.ToolbarSeparator());
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
            const newColumn = new sap.m.Column({ width: "40px" });

            sectionTable.addColumn(newColumn);

            columListItem.addCell(
                new sap.m.Button({
                    icon: "sap-icon://copy",
                    type: "Transparent",
                    press: function (oEvent) {
                        const context = oEvent.oSource.getBindingContext();
                        const data = context.getObject();
                        FORMS.buildCopyDialog(columListItem, section.id, data.id);
                    },
                })
            );
        }

        // Show Row Number
        if (section.enableRowNumber) {
            const colRowNumber = new sap.m.Column({ width: "40px", sortIndicator: "Ascending" });

            colRowNumber.setHeader(new sap.m.Label({ text: "" }));

            FORMS.setColumnSorting(sectionTable, colRowNumber, { id: "rowNumber" });
            sectionTable.addColumn(colRowNumber);

            columListItem.addCell(new sap.m.Input({ value: "{rowNumber}", enabled: false }));
        }

        sectionPanel.addContent(sectionTable);

        FORMS.formParent.addContent(sectionPanel);
        FORMS.columnTemplate = columListItem;

        // Enable Add
        if (section.enableCreate && FORMS.editable) {
            FORMS.formParent.addContent(
                new sap.m.Button({
                    text: "Add",
                    type: "Transparent",
                    press: function (oEvent) {
                        const model = sectionTable.getModel();
                        model.oData.push({ id: ModelData.genID() });
                        FORMS.tableAddRowNumber(model.oData);
                        model.refresh();
                    },
                }).addStyleClass("sapUiSizeCompact")
            );
        }

        return sectionTable;
    },

    setColumnSorting: function (table, column, element) {
        var _column_delegate = {
            onclick: function (e) {
                FORMS.handleColumnSorting(table, column, element);
            },
        };

        column.addEventDelegate(_column_delegate);

        column.exit = function () {
            column.removeEventDelegate(_column_delegate);
        };

        column.setStyleClass("nepMTableSortCell");

        if (!FORMS.colHeaders[table.sId]) FORMS.colHeaders[table.sId] = {};
        FORMS.colHeaders[table.sId][column.sId] = column;
    },

    handleColumnSorting: function (table, column, element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;
        const sortIndicatorOrder = column.getSortIndicator();
        let sortModelOrder;

        // Clear All
        const keys = Object.keys(FORMS.colHeaders[table.sId]);

        keys.forEach(function (key) {
            FORMS.colHeaders[table.sId][key].setSortIndicator("None");
        });

        if (sortIndicatorOrder === "Ascending") {
            column.setSortIndicator("Descending");
            sortModelOrder = true;
        } else {
            column.setSortIndicator("Ascending");
            sortModelOrder = false;
        }

        const oSorter = new sap.ui.model.Sorter(bindingField, sortModelOrder, false);
        const binding = table.getBinding("items");
        binding.sort(oSorter);
    },

    handleTableFilter: function (table, value) {
        const binding = table.getBinding("items");
        const filters = [];

        if (FORMS.colSorting[table.sId] && FORMS.colSorting[table.sId].forEach) {
            FORMS.colSorting[table.sId].forEach(function (element) {
                const bindingField = element.fieldName ? element.fieldName : element.id;
                filters.push(new sap.ui.model.Filter(bindingField, "Contains", value));
            });
        }

        const filter = new sap.ui.model.Filter({
            filters: filters,
            and: false,
        });

        binding.filter([filter]);
    },

    buildCopyDialog: function (columListItem, tableId, rowId) {
        const diaCopy = new sap.m.Dialog({
            draggable: true,
            contentHeight: "800px",
            contentWidth: "800px",
            title: "Copy Data",
        }).addStyleClass("sapUiContentPadding");

        diaCopy.setEndButton(
            new sap.m.Button({
                type: "Transparent",
                text: "Close",
                press: function (oEvent) {
                    diaCopy.close();
                },
            }).addStyleClass("sapUiSizeCompact")
        );

        diaCopy.setBeginButton(
            new sap.m.Button({
                type: "Emphasized",
                text: "OK",
                press: function (oEvent) {
                    for (let i = 0; i < numCopy.getValue(); i++) {
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

                        tableData.push(newRow);
                    }

                    let model = table.getModel();
                    FORMS.tableAddRowNumber(model.oData);
                    model.refresh();

                    diaCopy.close();
                },
            }).addStyleClass("sapUiSizeCompact")
        );

        const panCopies = new sap.m.Panel();
        panCopies.addContent(new sap.m.Title({ text: "Number of copies" }));
        const numCopy = new sap.m.StepInput({ width: "100%", min: 1, max: 1000 }).addStyleClass("sapUiSmallMarginBottom");
        panCopies.addContent(numCopy);
        diaCopy.addContent(panCopies);

        const table = sap.ui.getCore().byId("field" + tableId);

        const tableData = FORMS.getData().data[tableId];
        const rowData = ModelData.FindFirst(tableData, "id", rowId);

        const tabCopy = new sap.m.Table({
            showSeparators: sap.m.ListSeparators.Inner,
            backgroundDesign: "Transparent",
        });

        const cells = columListItem.getCells();

        tabCopy.addColumn(new sap.m.Column({ width: "100px" }).setHeader(new sap.m.Label({ text: "Include", design: "Bold" })));
        tabCopy.addColumn(new sap.m.Column({ width: "200px" }).setHeader(new sap.m.Label({ text: "Field", design: "Bold" })));
        tabCopy.addColumn(new sap.m.Column({ width: "100%" }).setHeader(new sap.m.Label({ text: "Content", design: "Bold" })));

        for (let i = 1; i < cells.length; i++) {
            const fieldId = cells[i].sId.split("field")[1];

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

            delete element.config.enableLog;
            const updatedAt = oDateFormat.format(new Date(element.updatedAt));

            FORMS.formParent = formParent;
            FORMS.buildElement(formParent, element.config, { type: "Form" }, i);

            var panel = new sap.m.Panel({
                backgroundDesign: "Solid",
                headerText: updatedAt + " - " + element.updatedBy,
            });
            panel.addContent(formParent);

            diaLog.addContent(panel);
        }

        FORMS.editable = currentEditable;
        FORMS.formParent = currentFormParent;

        diaLog.open();
    },

    buildParentTableChildren: function (parent, element, section, index, elementField) {
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

        FORMS.setColumnSorting(parent, newColumn, element);
        FORMS.columnTemplate.addCell(elementField);
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
        return "field" + element.id;
    },

    buildElementMessageStrip: function (element) {
        return new sap.m.MessageStrip(FORMS.buildElementFieldID(element), {
            text: element.text,
            showIcon: element.messageIcon,
            type: element.messageType || "Information",
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

                sap.n.Adaptive.navigation(navigation, null, events);
            },
        });

        return newField;
    },

    buildElementPicture: function (element) {
        const newField = new sap.m.Image(FORMS.buildElementFieldID(element), {
            src: element.imageSrc,
        });

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
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Input(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            placeholder: element.placeholder,
            editable: FORMS.editable,
            type: "Number",
            change: function (oEvent) {
                this.setValue(parseFloat(this.getValue()).toFixed(element.decimals));
            },
        });

        return newField;
    },

    buildElementStepInput: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.StepInput(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            placeholder: element.placeholder,
            editable: FORMS.editable,
        });

        if (element.min) newField.setMin(parseInt(element.min));
        if (element.max) newField.setMax(parseInt(element.max));

        return newField;
    },

    buildElementSwitch: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Switch(FORMS.buildElementFieldID(element), {
            state: "{" + FORMS.bindingPath + bindingField + "}",
            enabled: FORMS.editable,
            customTextOff: element.customTextOff,
            customTextOn: element.customTextOn,
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
        });

        return newField;
    },

    buildElementSegmentedButton: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.SegmentedButton(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            enabled: FORMS.editable,
        });

        if (element.width) {
            if (element.widthMetric) {
                newField.setWidth(element.width + "%");
            } else {
                newField.setWidth(element.width + "px");
            }
        }

        if (element.items) {
            element.items.forEach(function (item, i) {
                newField.addItem(new sap.m.SegmentedButtonItem({ key: item.key, text: item.title, icon: item.icon }));
            });

            // Set Default Value
            const formModel = FORMS.formParent.getModel();
            if (!formModel.oData[bindingField]) element.defaultValue ? (formModel.oData[bindingField] = element.defaultValue) : (formModel.oData[bindingField] = element.items[0].key);
        }

        return newField;
    },

    buildElementSingleSelectIcon: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.Select(FORMS.buildElementFieldID(element), {
            selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
            width: "100%",
            editable: FORMS.editable,
            // showIcon: true,
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
            });
        } else {
            newField = new sap.m.VBox(FORMS.buildElementFieldID(element), {
                wrap: "Wrap",
                renderType: "Bare",
            });
        }

        const formModel = FORMS.formParent.getModel();

        element.items.forEach(function (item, i) {
            const elementCheckBox = new sap.m.CheckBox("item" + item.id, {
                text: item.title,
                editable: FORMS.editable,
                select: function (oEvent) {
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

        return newField;
    },

    buildElementDatePicker: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.DatePicker(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            displayFormat: element.displayFormat ? element.displayFormat : "dd.MM.yyyy",
            editable: FORMS.editable,
        });

        return newField;
    },

    buildElementImage: function (element, parent) {
        const meta = parent.getMetadata();
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.VBox(FORMS.buildElementFieldID(element), {
            width: "100%",
        });

        const elementUploader = new sap.m.Button({
            type: element.buttonType,
            text: element.text,
            enabled: FORMS.editable,
            press: function (oEvent) {
                FORMS.uploadObject = {
                    bindingField: bindingField,
                    context: null,
                };

                if (meta._sClassName === "sap.m.Table") {
                    const context = oEvent.oSource.getBindingContext();
                    const data = context.getObject();
                    FORMS.uploadObject.context = data;
                    FORMS.uploadObject.model = parent.getModel();
                }

                $("#imageUploader").click();
            },
        }).addStyleClass("sapUiSizeCompact");

        const elementImage = new sap.m.Image({
            src: "{" + FORMS.bindingPath + bindingField + "}",
        });

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

        elementHBox.addItem(
            new sap.m.Button({
                type: "Transparent",
                enabled: FORMS.editable,
                icon: "sap-icon://clear-all",
                tooltip: "Delete Image",
                visible: "{= ${" + FORMS.bindingPath + bindingField + "} ? true:false}",
                press: function (oEvent) {
                    elementImage.setSrc();
                },
            }).addStyleClass("sapUiSizeCompact")
        );

        newField.addItem(elementHBox);
        newField.addItem(elementImage);

        return newField;
    },

    buildElementDateTimePicker: function (element) {
        const bindingField = element.fieldName ? element.fieldName : element.id;

        const newField = new sap.m.DateTimePicker(FORMS.buildElementFieldID(element), {
            value: "{" + FORMS.bindingPath + bindingField + "}",
            displayFormat: element.displayFormat ? element.displayFormat : "dd.MM.yyyy HH:mm",
            editable: FORMS.editable,
        });

        return newField;
    },

    buildElementCheckList: function (element) {
        const tabCheckList = new sap.m.Table(FORMS.buildElementFieldID(element), {
            showSeparators: sap.m.ListSeparators.None,
            backgroundDesign: "Transparent",
            contextualWidth: "Auto",
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

    getData: function (complete, isDesigner) {
        if (!FORMS.formParent) return null;

        const formModel = FORMS.formParent.getModel();
        const outputData = {};

        let completed = false;

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
                        if (formModel.oData[element.fieldName]) outputData[element.fieldName] = formModel.oData[element.fieldName];
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

        const process = complete ? "" : "OnlyCheck";
        const valid = FORMS.validate(process);

        if (complete && valid) completed = true;

        // Cleanup fields
        FORMS.config.setup.forEach(function (section) {
            if (!section) return;

            if (section.type === "Table") {
                const tabObject = sap.ui.getCore().byId("field" + section.id);
                const tabModel = tabObject.getModel();

                if (tabModel) {
                    outputData[section.id] = tabModel.oData;

                    if (outputData[section.id] && outputData[section.id].forEach) {
                        outputData[section.id].forEach(function (data) {
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
        formModel.refresh();

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
                        newData.push({
                            id: oldData[i].id,
                        });
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
    },

    validate: function (process) {
        let validForm = true;
        let fieldCompleted;
        const formModel = FORMS.formParent.getModel();

        const validateElement = function (element) {
            const field = sap.ui.getCore().byId("field" + element.id);
            const bindingField = element.fieldName ? element.fieldName : element.id;

            if (element.required && !element.disabled && field.getDomRef()) {
                fieldCompleted = formModel.oData[bindingField] ? true : false;
                if (validForm) validForm = fieldCompleted;
                FORMS.validateMarkField(element.id, fieldCompleted, process);
            } else {
                delete formModel.oData[bindingField];
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

    importImage: function (oEvent) {
        try {
            const file = oEvent.target.files[0];
            const fileReader = new FileReader();

            fileReader.onload = function (fileLoadedEvent) {
                let formModel;

                if (!FORMS.formParent) {
                    const formParent = sap.ui.getCore().byId("_nepFormParent");
                    formModel = formParent.getModel();
                } else {
                    formModel = FORMS.formParent.getModel();
                }

                if (FORMS.uploadObject.context) {
                    FORMS.uploadObject.context[FORMS.uploadObject.bindingField] = fileLoadedEvent.target.result;
                    FORMS.uploadObject.model.refresh();
                } else {
                    formModel.oData[FORMS.uploadObject.bindingField] = fileLoadedEvent.target.result;
                    formModel.refresh();
                }

                document.getElementById("imageUploader").value = "";
            };

            fileReader.readAsDataURL(file);
        } catch (e) {
            console.log(e);
        }
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
};

window.importImage = FORMS.importImage;
