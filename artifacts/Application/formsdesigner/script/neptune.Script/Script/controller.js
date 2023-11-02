const controller = {
    filterGroupid: null,
    currentIndex: null,
    currentObject: null,
    currentFilter: null,
    enableMarker: true,
    previewData: null,
    markedElement: {
        elemDom: null,
        elemId: null,
    },
    pressedPreview: false,
    dragElement: null,
    tableReset: false,

    elementTypes: [
        { icon: "sap-icon://form", text: "Form", type: "Form", parent: true, descripton: "Present the data in Form layout" },
        { icon: "sap-icon://table-view", text: "Table", type: "Table", parent: true, descripton: "Present the data in Table layout" },
        { icon: "sap-icon://header", text: "Form Title", type: "FormTitle", parent: false, table: false },
        { icon: "sap-icon://calendar", text: "Date Picker", type: "DatePicker", parent: false, table: true },
        { icon: "sap-icon://date-time", text: "Date Time Picker", type: "DateTimePicker", parent: false, table: true },
        { icon: "sap-icon://fa-regular/check-square", text: "Check Box", type: "CheckBox", parent: false, table: true },
        { icon: "sap-icon://checklist", text: "Check List", type: "CheckList", parent: false, table: false, table: true },
        { icon: "sap-icon://request", text: "Input", type: "Input", parent: false, table: true },
        { icon: "sap-icon://fa-regular/file-image", text: "Image Upload", type: "Image", parent: false, table: true },
        { icon: "sap-icon://message-information", text: "Message Strip", type: "MessageStrip", parent: false, table: true },
        { icon: "sap-icon://number-sign", text: "Numeric", type: "Numeric", parent: false, table: true },
        { icon: "sap-icon://picture", text: "Picture", type: "Picture", parent: false, table: false },
        { icon: "sap-icon://feedback", text: "Rating", type: "Rating", parent: false, table: true },
        { icon: "sap-icon://numbered-text", text: "Step Input", type: "StepInput", parent: false, table: true },
        { icon: "sap-icon://switch-views", text: "Switch", type: "Switch", parent: false, table: true },
        { icon: "sap-icon://activities", text: "Segmented Button", type: "SegmentedButton", parent: false, table: true },
        { icon: "sap-icon://fa-solid/signature", text: "Signature", type: "Signature", parent: false, table: false },
        { icon: "sap-icon://fa-regular/circle", text: "Single Select Icon", type: "SingleSelectIcon", parent: false, table: true },
        { icon: "sap-icon://fa-regular/circle", text: "Single Select", type: "SingleSelect", parent: false, table: true },
        { icon: "sap-icon://fa-regular/circle", text: "Single Choice", type: "SingleChoice", parent: false, table: false },
        { icon: "sap-icon://multi-select", text: "Multiple Select", type: "MultipleSelect", parent: false, table: true },
        { icon: "sap-icon://multi-select", text: "Multiple Choice", type: "MultipleChoice", parent: false, table: false },
        { icon: "sap-icon://text", text: "Text", type: "Text", parent: false, table: true },
        { icon: "sap-icon://document-text", text: "Text Area", type: "TextArea", parent: false, table: true },
        { icon: "sap-icon://value-help", text: "Value Help", type: "ValueHelp", parent: false, table: true },
    ],

    init: function () {
        jQuery.sap.require("sap.m.MessageBox");

        if (!cockpitUtils.isCockpit) {
            sap.m.MessageBox.confirm("Neptune FORMS is only supported to run inside our Cockpit. Press OK and we will guide to to the right place.", {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "System Information",
                actions: [sap.m.MessageBox.Action.OK],
                initialFocus: "Ok",
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        location.href = location.origin + "/cockpit.html#forms-designer";
                    }
                },
            });
        }

        modellistElementTypes.setData(this.elementTypes);
        modellistTypes.setData(this.elementTypes);

        treeOutline.getBinding("items").filter([new sap.ui.model.Filter("option", "NE", "I")]);

        // Context Menu
        treeOutline.setContextMenu(controller.buildContextMenu());

        // ClickToPreview
        panPreview.attachBrowserEvent("click", function (e) {
            let target;

            if (e.target.id.indexOf("field") > -1) {
                target = e.target.id.substr(0, 41);
            } else if (e.target.parentElement.id.indexOf("field") > -1) {
                target = e.target.parentElement.id.substr(0, 41);
            } else if (e.target.parentElement.parentElement.id.indexOf("field") > -1) {
                target = e.target.parentElement.parentElement.id.substr(0, 41);
            } else if (e.target.parentElement.parentElement.parentElement.id.indexOf("field") > -1) {
                target = e.target.parentElement.parentElement.parentElement.id.substr(0, 41);
            } else if (e.target.parentElement.parentElement.parentElement.parentElement.id.indexOf("field") > -1) {
                target = e.target.parentElement.parentElement.parentElement.parentElement.id.substr(0, 41);
            } else if (e.target.parentElement.parentElement.parentElement.parentElement.parentElement.id.indexOf("field") > -1) {
                target = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.id.substr(0, 41);
            }

            if (target) {
                target = target.split("field")[1];
                if (target && target.substring) {
                    controller.pressedPreview = true;
                    controller.selectObjectFromId(target.substring(0, 36));
                }
            }
        });

        var binding = new sap.ui.model.Binding(modelpanTopProperties, "/", modelpanTopProperties.getContext("/"));

        binding.attachChange(function () {
            if (controller.previewData !== modeloPageDetail.getJSON()) {
                modeloPageDetail.refresh();
                controller.preview();
            }
        });

        // Adaptive Apps Columns
        adaptiveAppsOpenColsKeys.forEach(function (k) {
            const item = adaptiveAppsOpenColsMap[k];
            toolAppsCols.addItem(new sap.ui.core.ListItem({ key: k, text: item.text }));
        });

        modeloPageDetail.setSizeLimit(10000);

        // Get FORMS
        this.list();
    },

    buildContextMenu: function () {
        const outlineMenu = new sap.m.Menu();

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Copy",
                icon: "sap-icon://copy",
                enabled: "{appControl>/enableEdit}",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "copy");
                },
            })
        );

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Enable",
                // enabled: "{= ${appControl>/enableEdit} && ${appControl>/isForm}}",
                enabled: "{appControl>/enableEdit}",
                icon: "sap-icon://fa-solid/toggle-on",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "enable");
                },
            })
        );

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Disable",
                enabled: "{appControl>/enableEdit}",
                icon: "sap-icon://fa-solid/toggle-off",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "disable");
                },
            })
        );

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Delete",
                enabled: "{appControl>/enableEdit}",
                icon: "sap-icon://delete",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "delete");
                },
            })
        );

        const outlineMenuSubElement = new sap.m.MenuItem({
            text: "Add Element",
            enabled: "{appControl>/enableEdit}",
        });

        controller.elementTypes.forEach(function (item) {
            if (!item.parent) {
                if (item.table) {
                    outlineMenuSubElement.addItem(
                        new sap.m.MenuItem({
                            text: item.text,
                            icon: item.icon,
                            press: function (oEvent) {
                                controller.handleContextMenu(oEvent, "add", item);
                            },
                        })
                    );
                } else {
                    outlineMenuSubElement.addItem(
                        new sap.m.MenuItem({
                            visible: "{= ${appControl>/table} ? false:true}",
                            text: item.text,
                            icon: item.icon,
                            press: function (oEvent) {
                                controller.handleContextMenu(oEvent, "add", item);
                            },
                        })
                    );
                }
            }
        });

        outlineMenu.addItem(outlineMenuSubElement);

        return outlineMenu;
    },

    handleContextMenu: function (oEvent, key, item) {
        const context = oEvent.oSource.getBindingContext();
        const data = context.getObject();

        switch (key) {
            case "disable":
                data.disabled = true;
                controller.preview();
                break;

            case "enable":
                data.disabled = false;
                controller.preview();
                break;

            case "copy":
                controller.objectCopy();
                break;

            case "delete":
                controller.objectDelete();
                break;

            case "add":
                controller.currentObject = data;

                if (context.sPath.indexOf("elements") > -1) {
                    controller.currentIndex = parseInt(context.sPath.split("/")[4]) + 1;
                } else {
                    controller.currentIndex = null;
                }
                controller.addElement(item);
                break;

            default:
                break;
        }

        modeloPageDetail.refresh(true);
    },

    objectCopy: function () {
        const parent = controller.getParentFromId(modelpanTopProperties.oData.id);
        const newElement = JSON.parse(JSON.stringify(modelpanTopProperties.oData));
        let elementIndex = 0;

        if (modelpanTopProperties.oData.type === "Form" || modelpanTopProperties.oData.type === "Table") {
            modeloPageDetail.oData.setup.forEach(function (section, i) {
                if (section.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
            });

            newElement.id = ModelData.genID();
            newElement.title = newElement.title + " (COPY)";

            newElement.elements.forEach(function (element, i) {
                element.id = ModelData.genID();
                element.title = element.title + " (COPY)";

                if (element.items) {
                    element.items.forEach(function (items) {
                        items.id = ModelData.genID();
                    });
                }
            });

            modeloPageDetail.oData.setup.splice(elementIndex, 0, newElement);
        } else {
            parent.elements.forEach(function (element, i) {
                if (element.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
            });

            newElement.id = ModelData.genID();
            newElement.title = newElement.title + " (COPY)";

            if (newElement.items) {
                newElement.items.forEach(function (items) {
                    items.id = ModelData.genID();
                });
            }

            parent.elements.splice(elementIndex, 0, newElement);
        }

        modeloPageDetail.refresh();
        controller.selectObjectFromId(newElement.id);
    },

    objectDelete: function () {
        const id = modelpanTopProperties.oData.id;
        const parent = controller.getParentFromId(id);

        if (parent.id === id) {
            ModelData.Delete(modeloPageDetail.oData.setup, "id", id);
        } else {
            ModelData.Delete(parent.elements, "id", id);
        }

        // Remove field if used in conditional visibility
        modeloPageDetail.oData.setup.forEach(function (section, i) {
            if (section.visibleFieldName === id) controller.clearVisibleCondition(section);

            section.elements.forEach(function (element, i) {
                if (element.visibleFieldName === id) controller.clearVisibleCondition(element);

                if (element.elements) {
                    element.elements.forEach(function (element, i) {
                        if (element.visibleFieldName === id) controller.clearVisibleCondition(element);
                    });
                }
            });
        });

        modelpanTopProperties.setData({});
        modelpanTopProperties.refresh();

        modeloPageDetail.refresh();
    },

    clearVisibleCondition: function (element) {
        element.visibleFieldName = "";
        element.visibleCondition = "";
        element.visibleValue = "";
    },

    list: function () {
        apiList().then(function (res) {
            modeltabApps.setData(res.adaptiveApps);

            toolAppsPackage.destroyItems();

            if (res.package) {
                res.package.forEach(function (package) {
                    toolAppsPackage.addItem(new sap.ui.core.ListItem({ key: package.id, text: package.name, additionalText: package.description }));
                });
            }
        });
    },

    get: function (id, editable) {
        apiGet({
            parameters: {
                id: id,
            },
        }).then(function (req) {
            // Check for undefined elements
            if (req.setup && req.setup.forEach) {
                req.setup.forEach(function (section, i) {
                    section.elements = section.elements.filter((obj) => obj && Object.keys(obj).length !== 0);
                    section.elements.forEach(function (element, i) {
                        if (element.elements) {
                            element.elements = element.elements.filter((obj) => obj && Object.keys(obj).length !== 0);
                        }
                    });
                });
            }

            controller.tableReset = true;
            modeloPageDetail.setData(req);
            modelpanTopProperties.setData({});

            if (oApp.getCurrentPage() === oPageStart) {
                tabDetail.setSelectedItem(tabDetailInfo);
                treeOutline.expandToLevel(99);
            } else {
                treeOutline.fireItemPress();
            }

            controller.filterSubGroup();

            oApp.to(oPageDetail);

            cockpitUtils.toggleEdit(editable);
            cockpitUtils.dataSaved = modeloPageDetail.getJSON();
        });
    },

    save: function () {
        // Check Required Fields
        if (!sap.n.Planet9.requiredFieldsCheck(cockpitUtils.requiredFields)) {
            return;
        }

        // Cleanup if Something is wrong
        if (modeloPageDetail.oData.setup && modeloPageDetail.oData.setup.forEach) {
            modeloPageDetail.oData.setup.forEach(function (section, i) {
                section.elements = section.elements.filter((obj) => obj && Object.keys(obj).length !== 0);
                section.elements.forEach(function (element, i) {
                    if (element.elements) {
                        element.elements = element.elements.filter((obj) => obj && Object.keys(obj).length !== 0);
                    }
                });
            });
        }

        apiSave({
            data: modeloPageDetail.oData,
        }).then(function (req) {
            sap.m.MessageToast.show("Form Saved");
            modeloPageDetail.oData.id = req.id;
            modeloPageDetail.oData.updatedAt = req.updatedAt;
            modeloPageDetail.oData.updatedBy = req.updatedBy;
            modeloPageDetail.oData.createdAt = req.createdAt || req.updatedAt;
            modeloPageDetail.oData.createdBy = req.createdBy;
            modeloPageDetail.refresh();
            controller.list();

            cockpitUtils.dataSaved = modeloPageDetail.getJSON();
            cockpitUtils.toggleEdit(true);
        });
    },

    delete: function () {
        sap.n.Planet9.objectDelete(function () {
            oApp.setBusy(true);
            sap.n.Planet9.setToolbarButton(false);

            apiDelete({
                parameters: { id: modeloPageDetail.oData.id },
            }).then(function (req) {
                sap.m.MessageToast.show("Form Deleted");
                controller.list();
                oApp.setBusy(false);
                oApp.back();
            });
        }, "FORM");
    },

    copy: function () {
        // Copy Object
        delete modeloPageDetail.oData.id;
        delete modeloPageDetail.oData.updatedAt;
        delete modeloPageDetail.oData.updatedBy;
        delete modeloPageDetail.oData.createdBy;
        delete modeloPageDetail.oData.createdAt;

        modeloPageDetail.oData.name = modeloPageDetail.oData.name + " - Copy";
        modeloPageDetail.refresh(true);

        cockpitUtils.toggleCreate();
    },

    setElementsFilter: function (type) {
        if (type === "Parent") {
            listElementTypes.getBinding("items").filter([new sap.ui.model.Filter("parent", "EQ", true)]);
        } else {
            listElementTypes.getBinding("items").filter([new sap.ui.model.Filter("parent", "EQ", false)]);
        }

        controller.currentFilter = type;
    },

    getParentFromId: function (id) {
        let parentData = null;

        modeloPageDetail.oData.setup.forEach(function (section) {
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

    getIndexFromId: function (id) {
        let index = null;

        modeloPageDetail.oData.setup.forEach(function (section, iSec) {
            if (section.id === id) index = iSec;

            section.elements.forEach(function (element, iEle) {
                if (element.id === id) index = iEle;

                if (element.elements) {
                    // if (!parentData && element.id === id) parentData = element;
                    element.elements.forEach(function (subElement, iSub) {
                        if (subElement.id === id) index = iSub;
                    });
                }
            });
        });

        return index;
    },

    getObjectFromId: function (id) {
        let elementData = null;

        modeloPageDetail.oData.setup.forEach(function (section, i) {
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

    expandParent: function (id) {
        modeloPageDetail.oData.setup.forEach(function (section, i) {
            if (section.id === id) {
                treeOutline.onItemExpanderPressed(treeOutline.getItems()[i], true);
            }
        });
    },

    selectObjectFromId: function (id, forceMarking) {
        const parent = controller.getParentFromId(id);
        if (parent) controller.expandParent(parent.id);

        const items = treeOutline.getItems();

        items.forEach(function (item, i) {
            const context = item.getBindingContext();
            const data = context.getObject();

            if (data.id === id) {
                treeOutline.setSelectedItemById(item.sId);

                modelpanTopProperties.setData(data);
                modelpanTopProperties.refresh();

                if (!forceMarking) {
                    controller.pressedPreview = true;
                }

                controller.pressOutlineItem();
            }
        });
    },

    newForm: function () {
        modeloPageDetail.setData({
            name: "",
            description: "",
            released: false,
            setup: [],
        });
        tabDetail.setSelectedItem(tabDetailInfo);
        controller.preview();
        controller.filterSubGroup();
        cockpitUtils.toggleCreate();
        cockpitUtils.dataSaved = modeloPageDetail.getJSON();
        oApp.to(oPageDetail);
    },

    preview: function () {
        controller.previewData = modeloPageDetail.getJSON();

        const formData = FORMS.getData(null, true);
        let previewData = null;

        if (!controller.tableReset) {
            previewData = formData ? formData.data : null;
        }

        FORMS.build(panPreview, {
            id: modeloPageDetail.oData.id,
            data: previewData,
            config: modeloPageDetail.oData,
        });

        controller.tableReset = false;

        panPreview.onAfterRendering = function (oEvent) {
            controller.markElement();
        };
    },

    addElement: function (elementData, copy) {
        let newElement = {
            id: ModelData.genID(),
            type: elementData.type,
            enableDescription: false,
            enablePlaceholder: false,
            enableDuplicate: false,
            enableLabel: true,
            disabled: false,
            duplicateButtonText: "Add",
            duplicateButtonType: "Transparent",
            logButtonText: "Log",
            logButtonType: "Transparent",
            placeholder: "",
            option: "E",
            title: elementData.type,
            description: "",
            required: false,
            items: [],
        };

        switch (elementData.type) {
            // Parents
            case "Table":
                newElement.option = "P";
                newElement.elements = [];
                newElement.widths = [];
                newElement.rows = 5;
                newElement.paginationTake = 2;
                break;

            case "Form":
                newElement.expanded = false;
                newElement.expandable = false;
                newElement.option = "P";
                newElement.elements = [];
                newElement.layout = "ResponsiveGridLayout";
                break;

            case "FormTitle":
                newElement.option = "P";
                newElement.elements = [];
                break;

            // Elements
            case "Numeric":
                newElement.decimals = 2;
                break;

            case "Rating":
                newElement.maxValue = 5;
                break;

            case "Text":
                newElement.titleStyle = "Auto";
                break;

            case "MessageStrip":
                newElement.messageText = "";
                newElement.messageType = "Information";
                newElement.messageIcon = false;
                break;

            case "Image":
                newElement.text = "Upload";
                newElement.buttonType = "Emphasized";
                newElement.width = "200";
                newElement.widthMetric = "";
                break;

            case "CheckList":
                newElement.questionTitle = "Question";
                newElement.answerTitle = "Answer";

                newElement.items = [
                    { id: ModelData.genID(), question: "Question1", type: "Switch", option: "I" },
                    { id: ModelData.genID(), question: "Question2", type: "Switch", option: "I" },
                    { id: ModelData.genID(), question: "Question3", type: "Switch", option: "I" },
                ];
                break;

            case "SingleChoice":
                newElement.items = [
                    { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
                ];
                newElement.horizontal = false;
                break;

            case "SingleSelect":
                newElement.items = [
                    { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
                ];
                break;

            case "SingleSelectIcon":
                newElement.items = [
                    { id: ModelData.genID(), title: "Option1", key: "key1", icon: "", option: "I" },
                    { id: ModelData.genID(), title: "Option2", key: "key2", icon: "", option: "I" },
                    { id: ModelData.genID(), title: "Option3", key: "key3", icon: "", option: "I" },
                ];
                break;

            case "MultipleChoice":
                newElement.items = [
                    { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
                ];
                newElement.validationParam = 1;
                newElement.validationType = "noLimit";
                newElement.horizontal = false;
                break;

            case "MultipleSelect":
                newElement.items = [
                    { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
                ];
                newElement.validationParam = 1;
                newElement.validationType = "noLimit";
                break;

            case "SegmentedButton":
                newElement.width = 100;
                newElement.widthMetric = "per";
                newElement.items = [
                    { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
                ];
                break;

            case "ValueHelp":
                newElement.dialogHeight = 600;
                newElement.dialogWidth = 900;

                break;
        }

        if (copy) {
            return newElement;
        }

        if (controller.currentFilter === "Parent") {
            modeloPageDetail.oData.setup.push(newElement);
        } else {
            let currentObject = controller.currentObject.option === "P" ? controller.currentObject : controller.getParentFromId(controller.currentObject.id);

            if (currentObject.type !== "FormTitle" && controller.currentIndex) {
                currentObject.elements.splice(controller.currentIndex, 0, newElement);
            } else {
                currentObject.elements.splice(0, 0, newElement);
            }
        }

        modeloPageDetail.refresh(true);

        setTimeout(function () {
            controller.selectObjectFromId(newElement.id, true);
        }, 100);
    },

    markElement: function () {
        const element = modelpanTopProperties.oData;

        if (!element.id) return;

        let fieldPrefix = "field";
        if (["Table"].includes(element.type)) fieldPrefix = "section";

        let elementPreview = sap.ui.getCore().byId(fieldPrefix + element.id);
        let elementDom;

        if (elementPreview && elementPreview.getDomRef()) {
            switch (element.type) {
                case "Form":
                case "Table":
                    elementDom = elementPreview.getDomRef();
                    break;

                case "FormTitle":
                    elementDom = elementPreview.getDomRef().parentElement;
                    break;

                default:
                    elementDom = elementPreview.oParent.getDomRef();
                    break;
            }

            if (!elementDom) return;

            // Remove Mark from Current Selected Element in Preview
            if (controller.enableMarker && controller.markedElement.elemDom !== elementDom) {
                if (controller.markedElement.elemDom) controller.markedElement.elemDom.classList.remove("previewMarked");

                if (!elementDom || !elementDom.classList) {
                    debugger;
                } else {
                    elementDom.classList.add("previewMarked");
                }

                controller.markedElement.elemDom = elementDom;
                controller.markedElement.elemId = element.id;
            }

            // Navigate to Element
            if (!controller.pressedPreview) {
                scrollPreview.scrollToElement(elementPreview, 0);

                if (scrollPreview._oScroller._scrollY !== scrollPreview._oScroller.getMaxScrollTop()) {
                    const max = scrollPreview._oScroller.getMaxScrollTop() - 300;
                    let position = scrollPreview._oScroller._scrollY - 300;
                    if (position < 0) position = 0;
                    scrollPreview.scrollTo(0, position);
                }
            } else {
                controller.pressedPreview = false;
            }
        }
    },

    openTypes: function () {
        listTypesFilter.setValue();
        listTypesFilter.fireLiveChange();

        diaChangeType.open();
    },

    pressOutlineItem: function () {
        const element = modelpanTopProperties.oData;
        let elementParent = controller.getParentFromId(element.id);

        if (element.id === elementParent.id) elementParent = {};

        controller.markElement();

        // Build Table widths
        if (element.type === "Table") {
            let newWidths = [];
            let existingWidths = [];
            if (element.widths) existingWidths = JSON.parse(JSON.stringify(element.widths));

            element.elements.forEach(function (element) {
                let newWidth = {
                    id: element.id,
                    title: element.title,
                    width: null,
                };

                const existingWidth = ModelData.FindFirst(existingWidths, "id", element.id);

                if (existingWidth && existingWidth.width) newWidth.width = existingWidth.width;
                if (existingWidth && existingWidth.widthMetric) newWidth.widthMetric = existingWidth.widthMetric;
                if (existingWidth && existingWidth.minSize) newWidth.minSize = existingWidth.minSize;
                if (existingWidth && existingWidth.columnTitle) newWidth.columnTitle = existingWidth.columnTitle;

                newWidths.push(newWidth);
            });

            modelpanTopProperties.oData.widths = newWidths;
            modelpanTopProperties.refresh();
        }

        let visibilityFields = [];

        const addConditionalField = function (element) {
            if (element.id === modelpanTopProperties.oData.id) return;

            switch (element.type) {
                case "Image":
                case "MultipleChoice":
                case "MultipleSelect":
                case "MessageStrip":
                case "Text":
                case "FormTitle":
                case "Date":
                    break;

                default:
                    const parent = controller.getParentFromId(element.id);

                    switch (elementParent.type) {
                        case "Table":
                            if (elementParent.id !== parent.id) return;
                            break;

                        default:
                            if (parent.type === "Table") return;
                            break;
                    }

                    visibilityFields.push({
                        id: element.id,
                        text: element.title,
                        parent: parent.title,
                        index: visibilityFields.length + 1,
                    });

                    break;
            }
        };

        // Do not change type on parents
        if (element.elements) {
            elementToolbarChangeType.setVisible(false);
        } else {
            elementToolbarChangeType.setVisible(true);
        }

        // ValueHelp -> Get Adaptive Fields
        if (element.type === "ValueHelp") {
            controller.buildAdaptiveFields();
        }

        // Conditional Access
        modeloPageDetail.oData.setup.forEach(function (section) {
            section.elements.forEach(function (element) {
                addConditionalField(element);
                if (element.elements) {
                    element.elements.forEach(function (element) {
                        addConditionalField(element);
                    });
                }
            });
        });

        modellistVisibility.setData(visibilityFields);

        controller.visibleCondValue();
    },

    visibleCondValue: function () {
        if (!inElementFormVisibleField.getValue()) return;

        inElementFormVisibleValue.destroyItems();
        inElementFormVisibleValue.addItem(new sap.ui.core.Item());

        // Get visibleField
        const visibleField = controller.getObjectFromId(modelpanTopProperties.oData.visibleFieldName);

        if (!visibleField) return;

        switch (visibleField.type) {
            case "Switch":
            case "CheckBox":
                inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: false, text: "false" }));
                inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: true, text: "true" }));
                break;

            case "Input":
                inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: "empty", text: "Empty" }));
                break;

            default:
                if (visibleField.items) {
                    visibleField.items.forEach(function (item, i) {
                        inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: item.key, text: item.title }));
                    });
                }
                break;
        }
    },

    importPicture: function (oEvent) {
        try {
            const file = oEvent.target.files[0];
            const fileReader = new FileReader();

            if (file.size > 100000) {
                sap.m.MessageToast.show("File size is larger than max 100k");
                return;
            }

            fileReader.onload = async function (fileLoadedEvent) {
                modelpanTopProperties.oData.imageSrc = await FORMS.imageResize(fileLoadedEvent.target.result, modelpanTopProperties.oData);
                modelpanTopProperties.refresh();
                document.getElementById("pictureUploader").value = "";
            };

            fileReader.readAsDataURL(file);
        } catch (e) {
            console.log(e);
        }
    },

    filterSubGroup: function () {
        const binding = informDetailSubGroup.getBinding("items");

        const filter = new sap.ui.model.Filter({
            filters: [new sap.ui.model.Filter("groupid", "EQ", modeloPageDetail.oData.groupid), new sap.ui.model.Filter("name", "EQ", "")],
            and: false,
        });

        binding.filter([filter]);
    },

    buildAdaptiveFields: function () {
        if (!modelpanTopProperties.oData.adaptiveApp) return;

        const data = {
            id: modelpanTopProperties.oData.adaptiveApp,
        };

        sap.n.Adaptive.init(data).then(function (res) {
            inElementFormValueHelpField.destroyItems();
            inElementFormValueHelpField.addItem(new sap.ui.core.ListItem({ key: "", text: "" }));

            res.fieldsReport.forEach(function (item) {
                inElementFormValueHelpField.addItem(new sap.ui.core.ListItem({ key: item.name, text: item.text }));
            });
        });
    },

    exportForm: function () {
        var exportData = modeloPageDetail.getJSON();
        exportData = encodeURIComponent(exportData);
        a = document.createElement("a");
        a.setAttribute("href", "data:application/text;charset=utf-8," + exportData);
        a.setAttribute("target", "_blank");
        a.setAttribute("download", modeloPageDetail.oData.name + ".forms");
        a.click();
    },

    importForm: function (event) {
        $.each(event.target.files, function (i, file) {
            try {
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                    var appData = event.target.result.split(",")[1];
                    appData = Base64.decode(appData);

                    var appJSON = JSON.parse(appData);
                    appJSON.id = modeloPageDetail.oData.id;

                    modeloPageDetail.setData(appJSON);
                    modeloPageDetail.refresh();

                    controller.preview();

                    document.getElementById("formsUploader").value = "";
                };
                fileReader.readAsDataURL(file);
            } catch (e) {
                try {
                } catch (e) {}
            }
        });
    },
};

controller.init();

window.importPicture = controller.importPicture;
window.importForm = controller.importForm;
