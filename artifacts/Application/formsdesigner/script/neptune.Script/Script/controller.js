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

    elementTypes: FORMS.elementTypes,

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

        // // TODO: review ListMediaFolders
        // TreeTable.bindRows({path:"/children"});

        // Adaptive Apps Columns
        adaptiveAppsOpenColsKeys.forEach(function (k) {
            const item = adaptiveAppsOpenColsMap[k];
            toolAppsCols.addItem(new sap.ui.core.ListItem({ key: k, text: item.text }));
        });

        modeloPageDetail.setSizeLimit(10000);

        // Get FORMS
        this.list();

        // prepares the monaco code editor
        controller.setMonacoEditor();

        Loader.markDone("controller"); // #57 #58
    },

    setMonacoEditor: () => {
        let parentId = htmlTopCodeEditor.getId();
        let editorId = `${parentId}--core`;
        htmlTopCodeEditor
            .setContent(`<div id='${parentId}' style='height:calc(100% - 2rem)'><div id='${editorId}' style='height:100%'/></div>`);
        neptune.Utils.waitForElement(editorId)
            .then(() => {
                MonacoEditor.instance = monaco.editor.create(document.getElementById(editorId),{
                    value: "",
                    automaticLayout: true,
                    readOnly: true,
                    language: "javascript"
                });
                MonacoEditor.instance.getModel().onDidChangeContent(function() {
                    let data = modelpanTopProperties.getData();
                    if (!data.formatterConfig?.visible) {
                        FORMS.bindingWrapper.Advanced.Configuration.setFormatterConfig( data );
                        data.formatterConfig.visible = {paramList:[], code: ''}
                    }
                    data.formatterConfig.visible.code = MonacoEditor.instance.getValue();
                });
                MonacoEditor.fulfillMonacoCreated(MonacoEditor.instance);
            });
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

                let parent = context._parentContext ? context._parentContext.getObject() : context.getObject();
                controller.addElement(item, null, parent.type);
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

        let isFormTitle = modelpanTopProperties.oData.type === "FormTitle";

        if (modelpanTopProperties.oData.type === "Form" || modelpanTopProperties.oData.type === "Table" || isFormTitle) {
            modeloPageDetail.oData.setup.forEach(function (section, i) {
                if (section.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
            });

            newElement.id    = ModelData.genID();
            newElement.title = newElement.title + " (COPY)";

            newElement.elements.forEach(function (element, i) {
                element.originId = element.id;
                element.id       = ModelData.genID();
                element.title    = element.title + (isFormTitle ? "" : " (COPY)");

                if (element.items) {
                    element.items.forEach(function (items) {
                        items.id = ModelData.genID();
                    });
                }
            });

            // KW #22271 - if a whole section is being copied, the conditional visiblity inside of it should reference
            // to the also copied field. Not the original one.
            newElement.elements.forEach(function (element) {
                
                delete element.fieldName;
                delete element.fieldId;

                if (element.enableVisibleCond && element.visibleFieldName && element.visibleFieldName != "") {
                    let iCondElement = newElement.elements.findIndex(e => e.originId == element.visibleFieldName);
                    if (iCondElement >= 0) {
                        element.visibleFieldName = newElement.elements[iCondElement].id;
                    }
                }
            });
            newElement.elements.forEach(function (element) {delete element.originId;});

            if (isFormTitle) {
                parent.elements.forEach(function (element, i) {
                    if (element.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
                });
                parent.elements.splice(elementIndex, 0, newElement);
            } else {
                modeloPageDetail.oData.setup.splice(elementIndex, 0, newElement);
            }

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

        // Remove field if used in conditional visibility (old - backwards compatible)
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

        // Recheck if used in an advanced conditional visibility (report error/warning, but does not delete)
        if (controller.getAllVisibilityConditionsById(id).length) { controller.checkVisCondParamValidation(); }

        modelpanTopProperties.setData({});
        modelpanTopProperties.refresh();
        modelpanTopEditor.setData({});

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

            // Applies backward compatibility
            controller.applyBackwardCompatibility(req);

            controller.tableReset = true;
            modeloPageDetail.setData(req);
            modelpanTopProperties.setData({});
            modelpanTopEditor.setData({});

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

        let visCondParamValidation = controller.checkVisCondParamValidation();
        let canSave = true;
        for (let condition of visCondParamValidation) {
            if (condition.hasErrors) {
                let objectOutline = controller.getOutlineElementById(condition.fieldId);
                if (!objectOutline.disabled) {
                    canSave = false;
                    break;
                }
            }
        }            
        if (!canSave) {
            tabDetail.setSelectedItem(tabDetailDesigner);
            sap.m.MessageBox.error("Please check the elements in the outline\nand related errors.", {title: 'Errors detected'});          
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
            })
            // PRR - forms/#17 - role access to forms (ADD - Begin)
            .catch(function (result) {
                oApp.setBusy(false);
                sap.m.MessageToast.show( result?.responseJSON?.status 
                                            ? result.responseJSON.status 
                                            : `Error deleting form.`);
            });
            // PRR - forms/#17 - role access to forms (ADD - End)
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

                modelpanTopEditor.setData(data);

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

    addElement: function (elementData, copy, parentType) {
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
            useFormatterConfig:{},
            formatterConfig: {},
            hasInfoButton: false,
            sectionType: parentType
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

            case "MessagePopup":
                newElement.text = "";
                break;

            case "Image":
                newElement.text = "Upload";
                newElement.buttonType = "Emphasized";
                newElement.width = "200";
                newElement.widthMetric = "";
                break;

            case "File":
                newElement.text = "Upload";
                newElement.buttonType = "Emphasized";
                newElement.fileTypes = [];
                newElement.selectedFolderName = "";
                newElement.selectedFolderId = null;
                break;

            case "MediaLib":
                newElement.link = "";
                newElement.filename = "";
                newElement.txtNoLinkProvided = "There is no file selected";
                newElement.hideNoFile = false;
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
                    // debugger;
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
                case "MessagePopup":
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

        // Conditional Visibility
        if (element.enableVisibleCond && !element.visibility) {
            element.visibility = [];
            // Migrate Old->New Setup
            if (element.visibleFieldName && element.visibleCondition && element.visibleValue) {
                element.visibility.push({
                    id: ModelData.genID(),
                    visibleFieldName: element.visibleFieldName,
                    visibleCondition: element.visibleCondition,
                    visibleValue: [element.visibleValue],
                });
                modelpanTopProperties.refresh();
            }
        }
    },

    importPicture: function (oEvent) {
        try {
            const file = oEvent.target.files[0];
            const fileReader = new FileReader();

            if (file.size > 500000) {
                sap.m.MessageToast.show("File size is larger than max 500k");
                return;
            }

            fileReader.onload = async function (fileLoadedEvent) {
                if (!controller.imageTarget) {
                    modelpanTopProperties.oData.imageSrc = await FORMS.imageResize(fileLoadedEvent.target.result, modelpanTopProperties.oData);
                    modelpanTopProperties.refresh();
                } else {
                    controller.imageTarget.setSrc(await FORMS.imageResize(fileLoadedEvent.target.result, modelpanTopProperties.oData));
                    controller.imageTarget = null;
                }
                document.getElementById("pictureUploader").value = "";
            };

            fileReader.readAsDataURL(file);
        } catch (e) {
            console.log(e);
        }
    },

    // KW
    importFile: function (oEvent) {
        try {
            const file = oEvent.target.files[0];
            const fileReader = new FileReader();

            if (file.size > 10000000) {
                sap.m.MessageToast.show("File size is larger than max 10mb"); // KW ??
                return;
            }

            fileReader.onload = async function (fileLoadedEvent) {
                // modelpanTopProperties.oData.imageSrc = await FORMS.imageResize(fileLoadedEvent.target.result, modelpanTopProperties.oData);
                // modelpanTopProperties.refresh();
                // document.getElementById("pictureUploader").value = "";
            };

            fileReader.readAsDataURL(file);
        } catch (e) {
            console.log(e);
        }
    },

    filterSubGroup: function () {
        const binding = informDetailSubGroup.getBinding("items");

        // MOD #(20250319-1114) begin
        // INFO: { reason: "an exception occurs when .getData().groupid is undefined" }
        // const filter = new sap.ui.model.Filter({
        //     filters: [new sap.ui.model.Filter("groupid", "EQ", modeloPageDetail.oData.groupid), new sap.ui.model.Filter("name", "EQ", "")],
        //     and: false,
        // });
        // MOD #(20250319-1114) ---
        const filter = new sap.ui.model.Filter({
            filters: [
                new sap.ui.model.Filter("groupid", "EQ", modeloPageDetail.getData()?.groupid ?? null), 
                new sap.ui.model.Filter("name", "EQ", "")],
            and: false,
        });
        // MOD #(20250319-1114) end

        binding.filter([filter]);
    },

    buildAdaptiveFields: function () {
        if (!modelpanTopProperties.oData.adaptiveApp) return;

        const data = {
            id: modelpanTopProperties.oData.adaptiveApp,
        };

        const adaptiveInit = sap.n.Adaptive ? sap.n.Adaptive.init : neptune.Adaptive.init;

        adaptiveInit(data).then(function (res) {
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

    elementHasInfoButton: function (elem) {
        return (elem.infobuttonText && elem.infobuttonText != "") || (elem.infobuttonImageSrc && elem.infobuttonImageSrc != "");
    },
    openDiaInfoButton: function () {
        let parent = controller.getParentFromId(modelpanTopProperties.getData().id);
        if (parent.type == "Table") {
            sap.m.MessageToast.show("This option is not available for Table objects");
        } else {
            diaInfoButton.open();
        }
    },
    applyBackwardCompatibility: (data) => {
        if (!data.setup) {return;}
        FORMS.applyBackwardCompatibility(data.setup);
    },
    getElementType: (elemType) => controller.elementTypes.find(
            element=>element.type.toLocaleLowerCase("en") === elemType.toLocaleLowerCase("en")
    ),
    getVisCondParamTypeOf: function (elementData) {
        let elementConfig = controller.getElementType(elementData.type);
        if (!elementConfig?.parameter) {return "undefined";}
        return elementConfig.paramType + (elementData.enableDuplicate ? "[]" : "");
    },
    getVisCondParamFieldIdsOf: function (elementData) {
        return elementData.id;
    },
    getOutlineElementById: id => {
        function findItem(items) {
            if (!(Array.isArray(items)&&items.length)) {return {};}
            for (let item of items) {
                if (item.id === id) {return item;}
            }
            return {};
        }
        function findElement(elements) {
            if (!(Array.isArray(elements)&&elements.length)) {return {};}
            for (let element of elements) {
                if (element.id === id) {return element;}
                let childElement = findElement(element.elements);
                if (childElement.id === id) {return childElement;}
                let itemElement = findItem(element.items);
                if (itemElement.id === id) {return element;}
            }
            return {};
        }
        for (let section of modeloPageDetail.getData().setup) {
            if (section.id === id) {return section;}
            let childElement = findElement(section.elements);
            if (childElement.id === id) {return childElement;}
            let itemElement = findItem(section.items);
            if (itemElement.id === id) {return section;}
        }
        return null;
    },
    getAllVisibilityConditions: function (includeDisabled = false, includeNoCode = false) {
        // THIS IS CODE COPIED from BindingWrapper.Advanced.Configuration.getAllConditions
        // copy all the code except for lines that end with /* ADAPT FROM COPY */ which you must adapt to the designer's reality
        const thisInstance = FORMS.bindingWrapper; /* ADAPT FROM COPY */
        function reduceElements(elements) {
            if (!(Array.isArray(elements) && elements.length)) {return [];}
            return elements.reduce((bag, element) => {
                let newElBag = bag;
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
        return reduceElements(modeloPageDetail.getData().setup);  /* ADAPT FROM COPY */
    },
    getAllVisibilityConditionsById: function (id, includeDisabled = false, includeNoCode = false) {
        // THIS IS CODE COPIED from BindingWrapper.Advanced.Configuration.getAllConditionsWithParamId
        // copy all the code except for lines that end with /* ADAPT FROM COPY */ which you must adapt to the designer's reality
        const thisInstance = FORMS.bindingWrapper; /* ADAPT FROM COPY */
        function reduceElements(elements) {
            if (!(Array.isArray(elements) && elements.length)) {return [];}
            return elements.reduce((bag, element) => {
                let newElBag = bag;
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
        return reduceElements(modeloPageDetail.getData().setup); /* ADAPT FROM COPY */
    },
    checkVisCondParamValidation: function (property = "visible") {
        let result = [];
        let allConditions = controller.getAllVisibilityConditions();
        for (let condition of allConditions) {
            let variables = [];
            let entry = {fieldId: condition.id, hasErrors: false, error:{}};
            let errorFound = false;
            // Check parameters
            const formatterConfig = FORMS.bindingWrapper.Advanced.Configuration.getFormatterConfig(condition, property);
            for (let param of formatterConfig.paramList ?? []) {
                entry.error[param.fieldId] = {};
                param.error = {};
                param.hasErrors = false;
                if (variables.includes(param.variable)) {
                    param.hasErrors = true;
                    entry.hasErrors = true;
                    entry.error[param.fieldId].duplicated = true;
                    param.error.duplicated = true;
                }
                else { variables.push(param.variable); }
                let sourceObject = controller.getOutlineElementById(param.fieldId);
                if (!sourceObject) {
                    param.hasErrors = true;
                    entry.hasErrors = true;
                    entry.error[param.fieldId].missing = true;
                    param.error.missing = true;
                }
                errorFound ||= param.hasErrors;
            }
            // Check function creation
            const errorReturn = {};
            const fnFormatter = FORMS.bindingWrapper.Advanced.Generator.formatterFunction(formatterConfig, false, errorReturn);
            if (!fnFormatter) {
                errorFound = true;
                entry.hasErrors = errorFound;
                entry.error.code = errorReturn.text ?? "Activation error";
                condition.codeError = entry.error.code;
            }
            else {delete condition.codeError};
            condition.hasErrors = errorFound;
            result.push(entry);
        }
        modelpanTopEditor.refresh();
        modeloPageDetail.refresh();
        return result;
    }

};

controller.init();

window.importPicture = controller.importPicture;
window.importForm = controller.importForm;
