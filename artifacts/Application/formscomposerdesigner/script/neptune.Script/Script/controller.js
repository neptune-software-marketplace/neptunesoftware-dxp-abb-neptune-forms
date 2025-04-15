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
    errors: {},

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

    debugInit: function () {
        function executeWhenData( pfCallback ) {
            if (Array.isArray(modelappData.getData()?.forms)) {
                pfCallback();
                return true;
            }
            setTimeout( function() { executeWhenData(pfCallback); }, 250 );
            return false;
        }
        executeWhenData( function() {
            tabData.setSelectedIndex(0);
            setTimeout( function() {
                tabDetail.setSelectedKey("DESIGNER");
                splitLayoutOutline.setSize("300px");
                splitLayoutProperties.setSize("300px");
            }, 500 );
        });
        window.DEBUG = { controller, Utils, modelappData, modelappControl, vFORMSCOMPOSER: sap.ui.getCore().byId("FORMSCOMPOSER"), diaCustomizeRenderers };
    },
    init: function () {
        jQuery.sap.require("sap.m.MessageBox");

        if (!cockpitUtils.isCockpit) {
            sap.m.MessageBox.confirm("The FORMS Composer is only supported to run inside our Cockpit. Press OK and we will guide to to the right place.", {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "System Information",
                actions: [sap.m.MessageBox.Action.OK],
                initialFocus: "Ok",
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        location.href = location.origin + "/cockpit.html#forms-composer";
                    }
                },
            });
        }

        modelappControl.setData({
            "selectedHideFilter": 0,
            "selectedRenderer": {
                nameSpace: FORMS.NAMESPACE.NEPTUNE,
                nameSpace: FORMS.RENDERER.STANDARD
            }
        });

        modellistElementTypes.setData(this.elementTypes);
        // modellistTypes.setData(this.elementTypes);

        controller.applyToTreeOutline((tree) => {
            tree.getBinding("items").filter([new sap.ui.model.Filter("option", "NE", "I")]);
            
            // Context Menu
            // tree.setContextMenu(controller.buildContextMenu()); // TODO: DELETE
        });

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
                // controller.preview(); // TODO: DELETE
            }
        });

        // Adaptive Apps Columns
        // adaptiveAppsOpenColsKeys.forEach(function (k) {
        //     const item = adaptiveAppsOpenColsMap[k];
        //     toolAppsCols.addItem(new sap.ui.core.ListItem({ key: k, text: item.text }));
        // });

        modeloPageDetail.setSizeLimit(10000);

        // Get FORMS
        this.list();
        // this.debugInit();
    },

    // buildContextMenu: function () { // TODO: DELETE
    //     const outlineMenu = new sap.m.Menu();

    //     outlineMenu.addItem(
    //         new sap.m.MenuItem({
    //             text: "Copy",
    //             icon: "sap-icon://copy",
    //             enabled: "{appControl>/enableEdit}",
    //             press: function (oEvent) {
    //                 controller.handleContextMenu(oEvent, "copy");
    //             },
    //         })
    //     );

    //     outlineMenu.addItem(
    //         new sap.m.MenuItem({
    //             text: "Enable",
    //             // enabled: "{= ${appControl>/enableEdit} && ${appControl>/isForm}}",
    //             enabled: "{appControl>/enableEdit}",
    //             icon: "sap-icon://fa-solid/toggle-on",
    //             press: function (oEvent) {
    //                 controller.handleContextMenu(oEvent, "enable");
    //             },
    //         })
    //     );

    //     outlineMenu.addItem(
    //         new sap.m.MenuItem({
    //             text: "Disable",
    //             enabled: "{appControl>/enableEdit}",
    //             icon: "sap-icon://fa-solid/toggle-off",
    //             press: function (oEvent) {
    //                 controller.handleContextMenu(oEvent, "disable");
    //             },
    //         })
    //     );

    //     outlineMenu.addItem(
    //         new sap.m.MenuItem({
    //             text: "Delete",
    //             enabled: "{appControl>/enableEdit}",
    //             icon: "sap-icon://delete",
    //             press: function (oEvent) {
    //                 controller.handleContextMenu(oEvent, "delete");
    //             },
    //         })
    //     );

    //     const outlineMenuSubElement = new sap.m.MenuItem({
    //         text: "Add Element",
    //         enabled: "{appControl>/enableEdit}",
    //     });

    //     controller.elementTypes.forEach(function (item) {
    //         if (!item.parent) {
    //             if (item.table) {
    //                 outlineMenuSubElement.addItem(
    //                     new sap.m.MenuItem({
    //                         text: item.text,
    //                         icon: item.icon,
    //                         press: function (oEvent) {
    //                             controller.handleContextMenu(oEvent, "add", item);
    //                         },
    //                     })
    //                 );
    //             } else {
    //                 outlineMenuSubElement.addItem(
    //                     new sap.m.MenuItem({
    //                         visible: "{= ${appControl>/table} ? false:true}",
    //                         text: item.text,
    //                         icon: item.icon,
    //                         press: function (oEvent) {
    //                             controller.handleContextMenu(oEvent, "add", item);
    //                         },
    //                     })
    //                 );
    //             }
    //         }
    //     });

    //     outlineMenu.addItem(outlineMenuSubElement);

    //     return outlineMenu;
    // },

    // handleContextMenu: function (oEvent, key, item) { // TODO: DELETE
    //     const context = oEvent.oSource.getBindingContext();
    //     const data = context.getObject();

    //     switch (key) {
    //         case "disable":
    //             data.disabled = true;
    //             controller.preview();
    //             break;

    //         case "enable":
    //             data.disabled = false;
    //             controller.preview();
    //             break;

    //         case "copy":
    //             controller.objectCopy();
    //             break;

    //         case "delete":
    //             controller.objectDelete();
    //             break;

    //         case "add":
    //             controller.currentObject = data;

    //             if (context.sPath.indexOf("elements") > -1) {
    //                 controller.currentIndex = parseInt(context.sPath.split("/")[4]) + 1;
    //             } else {
    //                 controller.currentIndex = null;
    //             }
    //             controller.addElement(item);
    //             break;

    //         default:
    //             break;
    //     }

    //     modeloPageDetail.refresh(true);
    // },

    // objectCopy: function () { // TODO: DELETE
    //     const parent = controller.getParentFromId(modelpanTopProperties.oData.id);
    //     const newElement = JSON.parse(JSON.stringify(modelpanTopProperties.oData));
    //     let elementIndex = 0;

    //     if (modelpanTopProperties.oData.type === "Form" || modelpanTopProperties.oData.type === "Table") {
    //         modeloPageDetail.oData.setup.forEach(function (section, i) {
    //             if (section.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
    //         });

    //         newElement.id = ModelData.genID();
    //         newElement.title = newElement.title + " (COPY)";

    //         newElement.elements.forEach(function (element, i) {
    //             element.id = ModelData.genID();
    //             element.title = element.title + " (COPY)";

    //             if (element.items) {
    //                 element.items.forEach(function (items) {
    //                     items.id = ModelData.genID();
    //                 });
    //             }
    //         });

    //         modeloPageDetail.oData.setup.splice(elementIndex, 0, newElement);
    //     } else {
    //         parent.elements.forEach(function (element, i) {
    //             if (element.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
    //         });

    //         newElement.id = ModelData.genID();
    //         newElement.title = newElement.title + " (COPY)";

    //         if (newElement.items) {
    //             newElement.items.forEach(function (items) {
    //                 items.id = ModelData.genID();
    //             });
    //         }

    //         parent.elements.splice(elementIndex, 0, newElement);
    //     }

    //     modeloPageDetail.refresh();
    //     controller.selectObjectFromId(newElement.id);
    // },

    // objectDelete: function () { // TODO: DELETE
    //     const id = modelpanTopProperties.oData.id;
    //     const parent = controller.getParentFromId(id);

    //     if (parent.id === id) {
    //         ModelData.Delete(modeloPageDetail.oData.setup, "id", id);
    //     } else {
    //         ModelData.Delete(parent.elements, "id", id);
    //     }

    //     // Remove field if used in conditional visibility
    //     modeloPageDetail.oData.setup.forEach(function (section, i) {
    //         if (section.visibleFieldName === id) controller.clearVisibleCondition(section);

    //         section.elements.forEach(function (element, i) {
    //             if (element.visibleFieldName === id) controller.clearVisibleCondition(element);

    //             if (element.elements) {
    //                 element.elements.forEach(function (element, i) {
    //                     if (element.visibleFieldName === id) controller.clearVisibleCondition(element);
    //                 });
    //             }
    //         });
    //     });

    //     modelpanTopProperties.setData({});
    //     modelpanTopProperties.refresh();

    //     modeloPageDetail.refresh();
    // },

    // clearVisibleCondition: function (element) { // TODO: DELETE
    //     element.visibleFieldName = "";
    //     element.visibleCondition = "";
    //     element.visibleValue = "";
    // },

    list: function () { /* KEEP => part of the composer solution */
        // oApp.setBusy(true);
        apiList().then(function (res) {
            // oApp.setBusy(false);
            // controller.list is called when adding/removing Single Forms.
            // copy the selected form and selected elements' information to put it back, if they are valid
            let loSelectedForm = modelappData.getData().selectedForm;
            let loSelectedElement = modelappData.getData().loSelectedElement;
            modelappData.setData(res);
            if (loSelectedForm) {
                modelappData.getData().selectedForm = loSelectedForm;
                if (loSelectedElement && (loSelectedForm.setup.forms[loSelectedElement[C_FIELD_ID_SINGLE_FORM]])) {
                    modelappData.getData().loSelectedElement = loSelectedElement;
                }
            }
            modelappData.refresh();
            
            // DEL begin
            // // info: {
            // //     user: "paulo.reis.rosa@neptune-software.com",
            // //     reason: "this model is not found in anywhere, nor is its usage clear. it's commented"
            // // }
            // modeltabApps.setData(res.adaptiveApps);
            // DEL end

            // toolAppsPackage.destroyItems();

            // if (res.package) {
            //     res.package.forEach(function (package) {
            //         toolAppsPackage.addItem(new sap.ui.core.ListItem({ key: package.id, text: package.name, additionalText: package.description }));
            //     });
            // }
            // API ListSingleForm is needed for Select Single Form dialog
            apiListSingleForm().then(function (res) {
                modelappData.getData().formsSingle = res.forms;
                selSingleSelectFormGroup.destroyItems();
                for (let loGroup of res.group) {
                    let loItem = new sap.ui.core.ListItem({"key": loGroup.id, "text": (loGroup.id) ? loGroup.name : txtAll.getText()});
                    // console.info("Item:", loItem);
                    selSingleSelectFormGroup.addItem(loItem);
                }
            })
        });
    },

    get: function (id, editable) { /* KEEP => part of the composer solution */
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
            modelappData.getData().selectedForm = $.extend(true, {}, req);
            controller.processListSingleForm( true );
            modelappData.refresh();

            req._validFrom = Utils.convIsoToYyyymmddDate(req.validFrom);
            req._validTo = Utils.convIsoToYyyymmddDate(req.validTo);

            modeloPageDetail.setData(req);
            controller.resetDetailPageSelections();
            toolProjectViewCollapse.firePress({});
            modelpanTopProperties.setData({});

            if (oApp.getCurrentPage() === oPageStart) {
                tabDetail.setSelectedItem(tabDetailInfo);
                // // The project tree view starts collapsed 
                // controller.applyToTreeOutline((tree) => { tree.expandToLevel(99); });
                // // treeOutline.expandToLevel(99);
            } else {
                treeOutline.fireItemPress();
            }

            controller.filterSubGroup();
            controller.addRendererCustomizableFields();

            oApp.to(oPageDetail);

            cockpitUtils.toggleEdit(editable);
            cockpitUtils.dataSaved = modeloPageDetail.getJSON();
            cockpitUtils.configSaved = Utils.getFormConfigJSON();
            Utils.updatesFormChangesState();
        });
    },

    save: function () { /* KEEP => part of the composer solution */
        // Check Required Fields
        if (!sap.n.Planet9.requiredFieldsCheck(cockpitUtils.requiredFields)) {
            return;
        }

        // Cleanup the config data and assign it to the modeloPageDetail model
        // NOTE: the setup field already contains all the forms (handled in the add/remove functions)
        let loStrippedConfig = Utils.stripEmptyDataFromConfig(modelappData.getData().selectedForm.config);
        modeloPageDetail.getData().config = loStrippedConfig;

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
            modelappData.getData().selectedForm.id = req.id;
            modelappData.refresh();
            modelappControl.getData().isNew = false;
            modelappControl.getData().hasChanges = false;
            modelappControl.refresh();
            controller.list();

            cockpitUtils.dataSaved = modeloPageDetail.getJSON();
            cockpitUtils.configSaved = Utils.getFormConfigJSON();
            cockpitUtils.toggleEdit(true);
        });
    },

    delete: function () { /* KEEP => part of the composer solution */
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

    copy: function () { // TODO: UNCERTAIN
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

    // setElementsFilter: function (type) { // TODO: DELETE
    //     if (type === "Parent") {
    //         listElementTypes.getBinding("items").filter([new sap.ui.model.Filter("parent", "EQ", true)]);
    //     } else {
    //         listElementTypes.getBinding("items").filter([new sap.ui.model.Filter("parent", "EQ", false)]);
    //     }

    //     controller.currentFilter = type;
    // },

    // getParentFromId: function (id) { // TODO: DELETE
    //     let parentData = null;

    //     modeloPageDetail.oData.setup.forEach(function (section) {
    //         if (section.id === id) parentData = section;

    //         section.elements.forEach(function (element) {
    //             if (element.id === id) parentData = section;

    //             if (element.elements) {
    //                 if (!parentData && element.id === id) parentData = element;
    //                 element.elements.forEach(function (subElement) {
    //                     if (subElement.id === id) parentData = element;
    //                 });
    //             }
    //         });
    //     });

    //     return parentData;
    // },

    // getIndexFromId: function (id) { // TODO: DELETE
    //     let index = null;

    //     modeloPageDetail.oData.setup.forEach(function (section, iSec) {
    //         if (section.id === id) index = iSec;

    //         section.elements.forEach(function (element, iEle) {
    //             if (element.id === id) index = iEle;

    //             if (element.elements) {
    //                 // if (!parentData && element.id === id) parentData = element;
    //                 element.elements.forEach(function (subElement, iSub) {
    //                     if (subElement.id === id) index = iSub;
    //                 });
    //             }
    //         });
    //     });

    //     return index;
    // },

    // getObjectFromId: function (id) { // TODO: DELETE
    //     let elementData = null;

    //     modeloPageDetail.oData.setup.forEach(function (section, i) {
    //         if (section.id === id) elementData = section;

    //         section.elements.forEach(function (element, i) {
    //             if (element.id === id) elementData = element;

    //             if (element.elements) {
    //                 element.elements.forEach(function (element, i) {
    //                     if (element.id === id) elementData = element;
    //                 });
    //             }
    //         });
    //     });

    //     return elementData;
    // },

    // expandParent: function (id) { // TODO: DELETE
    //     modeloPageDetail.oData.setup.forEach(function (section, i) {
    //         if (section.id === id) {
    //             treeOutline.onItemExpanderPressed(treeOutline.getItems()[i], true);
    //         }
    //     });
    // },

    // selectObjectFromId: function (id, forceMarking) { // TODO: DELETE
    //     const parent = controller.getParentFromId(id);
    //     if (parent) controller.expandParent(parent.id);

    //     const items = treeOutline.getItems();

    //     items.forEach(function (item, i) {
    //         const context = item.getBindingContext();
    //         const data = context.getObject();

    //         if (data.id === id) {
    //             treeOutline.setSelectedItemById(item.sId);

    //             modelpanTopProperties.setData(data);
    //             modelpanTopProperties.refresh();

    //             if (!forceMarking) {
    //                 controller.pressedPreview = true;
    //             }

    //             controller.pressOutlineItem();
    //         }
    //     });
    // },

    newForm: function () {
        modeloPageDetail.setData(this.getEmptyCompoundedForm());
        modelappData.getData().selectedForm = this.getEmptyCompoundedForm();
        modelappData.refresh();
        controller.setSelectedItemSingleForm();
        toolProjectViewCollapse.firePress({});
        tabDetail.setSelectedItem(tabDetailInfo);
        // controller.preview(); // TODO: DELETE
        controller.filterSubGroup();
        cockpitUtils.toggleCreate();
        cockpitUtils.dataSaved = modeloPageDetail.getJSON();
        cockpitUtils.configSaved = Utils.getFormConfigJSON();
        modelappControl.getData().enablePreview = false;
        modelappControl.refresh();
        // updates form changes state
        Utils.updatesFormChangesState();

        oApp.to(oPageDetail);
    },
    getEmptyCompoundedForm: function() {
        return {
            name: "",
            description: "",
            draft: true,
            released: false,
            obsolete: false,
            setup: { forms: [] },
            config: {
                compounded: true,
                control: {}
            }
        }
    },

    // preview: function () { // TODO: DELETE
    //     controller.previewData = modeloPageDetail.getJSON();

    //     const formData = FORMS.getData(null, true);
    //     let previewData = null;

    //     if (!controller.tableReset) {
    //         previewData = formData ? formData.data : null;
    //     }

    //     // FORMS.build(panPreview, {
    //     //     id: modeloPageDetail.oData.id,
    //     //     data: previewData,
    //     //     config: modeloPageDetail.oData,
    //     // });

    //     controller.tableReset = false;

    //     panPreview.onAfterRendering = function (oEvent) {
    //         controller.markElement();
    //     };
    // },

    // addElement: function (elementData, copy) { // TODO: DELETE
    //     let newElement = {
    //         id: ModelData.genID(),
    //         type: elementData.type,
    //         enableDescription: false,
    //         enablePlaceholder: false,
    //         enableDuplicate: false,
    //         enableLabel: true,
    //         disabled: false,
    //         duplicateButtonText: "Add",
    //         duplicateButtonType: "Transparent",
    //         logButtonText: "Log",
    //         logButtonType: "Transparent",
    //         placeholder: "",
    //         option: "E",
    //         title: elementData.type,
    //         description: "",
    //         required: false,
    //         items: [],
    //     };

    //     switch (elementData.type) {
    //         // Parents
    //         case "Table":
    //             newElement.option = "P";
    //             newElement.elements = [];
    //             newElement.widths = [];
    //             newElement.rows = 5;
    //             newElement.paginationTake = 2;
    //             break;

    //         case "Form":
    //             newElement.expanded = false;
    //             newElement.expandable = false;
    //             newElement.option = "P";
    //             newElement.elements = [];
    //             newElement.layout = "ResponsiveGridLayout";
    //             break;

    //         case "FormTitle":
    //             newElement.option = "P";
    //             newElement.elements = [];
    //             break;

    //         // Elements
    //         case "Numeric":
    //             newElement.decimals = 2;
    //             break;

    //         case "Rating":
    //             newElement.maxValue = 5;
    //             break;

    //         case "Text":
    //             newElement.titleStyle = "Auto";
    //             break;

    //         case "MessageStrip":
    //             newElement.messageText = "";
    //             newElement.messageType = "Information";
    //             newElement.messageIcon = false;
    //             break;

    //         case "Image":
    //             newElement.text = "Upload";
    //             newElement.buttonType = "Emphasized";
    //             newElement.width = "200";
    //             newElement.widthMetric = "";
    //             break;

    //         case "CheckList":
    //             newElement.questionTitle = "Question";
    //             newElement.answerTitle = "Answer";

    //             newElement.items = [
    //                 { id: ModelData.genID(), question: "Question1", type: "Switch", option: "I" },
    //                 { id: ModelData.genID(), question: "Question2", type: "Switch", option: "I" },
    //                 { id: ModelData.genID(), question: "Question3", type: "Switch", option: "I" },
    //             ];
    //             break;

    //         case "SingleChoice":
    //             newElement.items = [
    //                 { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
    //                 { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
    //                 { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
    //             ];
    //             newElement.horizontal = false;
    //             break;

    //         case "SingleSelect":
    //             newElement.items = [
    //                 { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
    //                 { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
    //                 { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
    //             ];
    //             break;

    //         case "SingleSelectIcon":
    //             newElement.items = [
    //                 { id: ModelData.genID(), title: "Option1", key: "key1", icon: "", option: "I" },
    //                 { id: ModelData.genID(), title: "Option2", key: "key2", icon: "", option: "I" },
    //                 { id: ModelData.genID(), title: "Option3", key: "key3", icon: "", option: "I" },
    //             ];
    //             break;

    //         case "MultipleChoice":
    //             newElement.items = [
    //                 { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
    //                 { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
    //                 { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
    //             ];
    //             newElement.validationParam = 1;
    //             newElement.validationType = "noLimit";
    //             newElement.horizontal = false;
    //             break;

    //         case "MultipleSelect":
    //             newElement.items = [
    //                 { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
    //                 { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
    //                 { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
    //             ];
    //             newElement.validationParam = 1;
    //             newElement.validationType = "noLimit";
    //             break;

    //         case "SegmentedButton":
    //             newElement.width = 100;
    //             newElement.widthMetric = "per";
    //             newElement.items = [
    //                 { id: ModelData.genID(), title: "Option1", key: "key1", option: "I" },
    //                 { id: ModelData.genID(), title: "Option2", key: "key2", option: "I" },
    //                 { id: ModelData.genID(), title: "Option3", key: "key3", option: "I" },
    //             ];
    //             break;

    //         case "ValueHelp":
    //             newElement.dialogHeight = 600;
    //             newElement.dialogWidth = 900;

    //             break;
    //     }

    //     if (copy) {
    //         return newElement;
    //     }

    //     if (controller.currentFilter === "Parent") {
    //         modeloPageDetail.oData.setup.push(newElement);
    //     } else {
    //         let currentObject = controller.currentObject.option === "P" ? controller.currentObject : controller.getParentFromId(controller.currentObject.id);

    //         if (currentObject.type !== "FormTitle" && controller.currentIndex) {
    //             currentObject.elements.splice(controller.currentIndex, 0, newElement);
    //         } else {
    //             currentObject.elements.splice(0, 0, newElement);
    //         }
    //     }

    //     modeloPageDetail.refresh(true);

    //     setTimeout(function () {
    //         controller.selectObjectFromId(newElement.id, true);
    //     }, 100);
    // },

    // markElement: function () { // TODO: DELETE
    //     const element = modelpanTopProperties.oData;

    //     if (!element.id) return;

    //     let fieldPrefix = "field";
    //     if (["Table"].includes(element.type)) fieldPrefix = "section";

    //     let elementPreview = sap.ui.getCore().byId(fieldPrefix + element.id);
    //     let elementDom;

    //     if (elementPreview && elementPreview.getDomRef()) {
    //         switch (element.type) {
    //             case "Form":
    //             case "Table":
    //                 elementDom = elementPreview.getDomRef();
    //                 break;

    //             case "FormTitle":
    //                 elementDom = elementPreview.getDomRef().parentElement;
    //                 break;

    //             default:
    //                 elementDom = elementPreview.oParent.getDomRef();
    //                 break;
    //         }

    //         if (!elementDom) return;

    //         // Remove Mark from Current Selected Element in Preview
    //         if (controller.enableMarker && controller.markedElement.elemDom !== elementDom) {
    //             if (controller.markedElement.elemDom) controller.markedElement.elemDom.classList.remove("previewMarked");

    //             if (!elementDom || !elementDom.classList) {
    //                 debugger;
    //             } else {
    //                 elementDom.classList.add("previewMarked");
    //             }

    //             controller.markedElement.elemDom = elementDom;
    //             controller.markedElement.elemId = element.id;
    //         }

    //         // Navigate to Element
    //         if (!controller.pressedPreview) {
    //             scrollPreview.scrollToElement(elementPreview, 0);

    //             if (scrollPreview._oScroller._scrollY !== scrollPreview._oScroller.getMaxScrollTop()) {
    //                 const max = scrollPreview._oScroller.getMaxScrollTop() - 300;
    //                 let position = scrollPreview._oScroller._scrollY - 300;
    //                 if (position < 0) position = 0;
    //                 scrollPreview.scrollTo(0, position);
    //             }
    //         } else {
    //             controller.pressedPreview = false;
    //         }
    //     }
    // },

    openTypes: function () { // TODO: UNCERTAIN
        listTypesFilter.setValue();
        listTypesFilter.fireLiveChange();

        diaChangeType.open();
    },

    // pressOutlineItem: function () { // TODO: DELETE
    //     const element = modelpanTopProperties.oData;
    //     let elementParent = controller.getParentFromId(element.id);

    //     if (element.id === elementParent.id) elementParent = {};

    //     controller.markElement();

    //     // Build Table widths
    //     if (element.type === "Table") {
    //         let newWidths = [];
    //         let existingWidths = [];
    //         if (element.widths) existingWidths = JSON.parse(JSON.stringify(element.widths));

    //         element.elements.forEach(function (element) {
    //             let newWidth = {
    //                 id: element.id,
    //                 title: element.title,
    //                 width: null,
    //             };

    //             const existingWidth = ModelData.FindFirst(existingWidths, "id", element.id);

    //             if (existingWidth && existingWidth.width) newWidth.width = existingWidth.width;
    //             if (existingWidth && existingWidth.widthMetric) newWidth.widthMetric = existingWidth.widthMetric;
    //             if (existingWidth && existingWidth.minSize) newWidth.minSize = existingWidth.minSize;
    //             if (existingWidth && existingWidth.columnTitle) newWidth.columnTitle = existingWidth.columnTitle;

    //             newWidths.push(newWidth);
    //         });

    //         modelpanTopProperties.oData.widths = newWidths;
    //         modelpanTopProperties.refresh();
    //     }

    //     let visibilityFields = [];

    //     const addConditionalField = function (element) {
    //         if (element.id === modelpanTopProperties.oData.id) return;

    //         switch (element.type) {
    //             case "Image":
    //             case "MultipleChoice":
    //             case "MultipleSelect":
    //             case "MessageStrip":
    //             case "Text":
    //             case "FormTitle":
    //             case "Date":
    //                 break;

    //             default:
    //                 const parent = controller.getParentFromId(element.id);

    //                 switch (elementParent.type) {
    //                     case "Table":
    //                         if (elementParent.id !== parent.id) return;
    //                         break;

    //                     default:
    //                         if (parent.type === "Table") return;
    //                         break;
    //                 }

    //                 visibilityFields.push({
    //                     id: element.id,
    //                     text: element.title,
    //                     parent: parent.title,
    //                     index: visibilityFields.length + 1,
    //                 });

    //                 break;
    //         }
    //     };

    //     // Do not change type on parents
    //     if (element.elements) {
    //         elementToolbarChangeType.setVisible(false);
    //     } else {
    //         elementToolbarChangeType.setVisible(true);
    //     }

    //     // ValueHelp -> Get Adaptive Fields
    //     if (element.type === "ValueHelp") {
    //         controller.buildAdaptiveFields();
    //     }

    //     // Conditional Access
    //     modeloPageDetail.oData.setup.forEach(function (section) {
    //         section.elements.forEach(function (element) {
    //             addConditionalField(element);
    //             if (element.elements) {
    //                 element.elements.forEach(function (element) {
    //                     addConditionalField(element);
    //                 });
    //             }
    //         });
    //     });

    //     modellistVisibility.setData(visibilityFields);

    //     controller.visibleCondValue();
    // },

    // visibleCondValue: function () { // TODO: DELETE
    //     if (!inElementFormVisibleField.getValue()) return;

    //     inElementFormVisibleValue.destroyItems();
    //     inElementFormVisibleValue.addItem(new sap.ui.core.Item());

    //     // Get visibleField
    //     const visibleField = controller.getObjectFromId(modelpanTopProperties.oData.visibleFieldName);

    //     if (!visibleField) return;

    //     switch (visibleField.type) {
    //         case "Switch":
    //         case "CheckBox":
    //             inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: false, text: "false" }));
    //             inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: true, text: "true" }));
    //             break;

    //         case "Input":
    //             inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: "empty", text: "Empty" }));
    //             break;

    //         default:
    //             if (visibleField.items) {
    //                 visibleField.items.forEach(function (item, i) {
    //                     inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: item.key, text: item.title }));
    //                 });
    //             }
    //             break;
    //     }
    // },

    // importPicture: function (oEvent) { // TODO: DELETE 
    //     try {
    //         const file = oEvent.target.files[0];
    //         const fileReader = new FileReader();

    //         if (file.size > 100000) {
    //             sap.m.MessageToast.show("File size is larger than max 100k");
    //             return;
    //         }

    //         fileReader.onload = async function (fileLoadedEvent) {
    //             modelpanTopProperties.oData.imageSrc = await FORMS.imageResize(fileLoadedEvent.target.result, modelpanTopProperties.oData);
    //             modelpanTopProperties.refresh();
    //             document.getElementById("pictureUploader").value = "";
    //         };

    //         fileReader.readAsDataURL(file);
    //     } catch (e) {
    //         console.log(e);
    //     }
    // },

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

    exportForm: function () { // TODO: UNCERTAIN 
        var exportData = modeloPageDetail.getJSON();
        exportData = encodeURIComponent(exportData);
        a = document.createElement("a");
        a.setAttribute("href", "data:application/text;charset=utf-8," + exportData);
        a.setAttribute("target", "_blank");
        a.setAttribute("download", modeloPageDetail.oData.name + ".forms");
        a.click();
    },

    importForm: function (event) { // TODO: UNCERTAIN 
        $.each(event.target.files, function (i, file) {
            try {
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                    var appData = event.target.result.split(",")[1];
                    appData = Base64.decode(appData);

                    var appJSON = JSON.parse(appData);
                    appJSON.id = modeloPageDetail.oData.id;

                    appJSON._validFrom = Utils.convIsoToYyyymmddDate(appJSON.validFrom);
                    appJSON._validTo = Utils.convIsoToYyyymmddDate(appJSON.validTo);

                    modeloPageDetail.setData(appJSON);
                    modeloPageDetail.refresh();
                    controller.setSelectedItemSingleForm();
                    toolProjectViewCollapse.firePress({});

                    // controller.preview();// TODO: DELETE

                    document.getElementById("formsUploader").value = "";
                };
                fileReader.readAsDataURL(file);
            } catch (e) {
                try {
                } catch (e) {}
            }
        });
    },
    clearAllErrors: function () {
        this.errors = {};
    },
    clearErrors: function (context) {
        let lvCtxId = String(context);
        if (typeof this.errors !== "object") {this.errors = {};}
        this.errors[lvCtxId] = [];
    },
    getErrors: function (context) {
        let lvCtxId = String(context);
        return (Array.isArray(this.errors[lvCtxId]) && this.errors[lvCtxId]) || [];
    },
    addError: function (context, error) {
        let lvCtxId = String(context);
        if (typeof this.errors !== "object") {this.errors = {};}
        if (!Array.isArray(this.errors[lvCtxId])) {this.errors[lvCtxId] = [];}
        if (error?.responseText && error?.status && error?.statusText) {
            this.errors[lvCtxId].push({id: null, text:error.responseText});
        }
        else if (error?.id) {
            if (error?.text) {this.errors[lvCtxId].push(error);}
            else {
                let lvText = "Unknown error";
                try {
                    lvText = JSON.stringify(error);
                } catch(e) {
                    /* Nothing to do */
                }
                this.errors[lvCtxId].push({id: error.id, text: lvText});
            }
        }
        else {
            this.errors[lvCtxId].push({id: null, text: String(error)});
        }
    },
    getErrorContexts: function() {
        return Object.getOwnPropertyNames(this.errors || {});
    },
    processListSingleForm: function( init = false, inLoop = false ) {
        let loSingleForms = (Array.isArray(modelappData.getData()?.selectedForm?.setup?.forms))
                                ? modelappData.getData().selectedForm.setup.forms
                                : [];
        let loConfig = modelappData.getData().selectedForm.config;
        // debugger;
        if (init && !inLoop) {
            // It's the full loading of the form. Remove all error messages
            this.clearErrors(C_CONTEXT_LIST_SINGLE_FORM);
        }
        if (this.getErrors(C_CONTEXT_LIST_SINGLE_FORM).length) {
            // Dialog to show the errors and request for action
            diaDisplayErrors.OPTIONS = {
                context: C_CONTEXT_LIST_SINGLE_FORM,
                title: (init) ?txtCompoundedFormLoading.getText() :txtSingleFormLoading.getText(),
                message: txtErrorsFoundLoadingSingleForms.getText(),
                buildErrorList: () => { modellistDisplayErrors.setData(controller.getErrors(C_CONTEXT_LIST_SINGLE_FORM)); },
                actions: [txtCancelButton.getText(), txtStripFormsButtonText.getText(), txtRetryButtonText.getText()],
                tooltips: [txtCancelTooltip.getText(), txtStripFormsButtonTooltip.getText(), txtRetryButtonTooltip.getText()],
                pressEvents: [
                    // Cancel
                    () => {
                        diaDisplayErrors.close();
                        butDetailBack.firePress();
                    },
                    // Strip forms that can't be loaded
                    () => {
                        let loErrors = controller.getErrors(C_CONTEXT_LIST_SINGLE_FORM);
                        for (let loError of loErrors) {
                            let lvIndex = modeloPageDetail.getData().setup.forms.indexOf(loError.id);
                            modeloPageDetail.getData().setup.forms.splice(lvIndex, 1);
                            loSingleForms.splice(lvIndex, 1);
                        }
                        controller.clearErrors(C_CONTEXT_LIST_SINGLE_FORM);
                        diaDisplayErrors.close();
                        controller.processListSingleForm(init, true);
                    },
                    // Retry
                    () => {
                        controller.clearErrors(C_CONTEXT_LIST_SINGLE_FORM);
                        diaDisplayErrors.close();
                        controller.processListSingleForm(init, true);
                    },
                ]
            }
            if (!init) {
                // The is related to adding a single form manually
                // Cancel action does the same as the strip
                diaDisplayErrors.OPTIONS.actions.splice(1,1); // Removes the "Strip" button
                diaDisplayErrors.OPTIONS.tooltips.splice(1,1); // Removes the "Strip" tooltip
                diaDisplayErrors.OPTIONS.pressEvents.splice(0,1); // Removes the "Cancel" code and uses the "Strip" code
            }
            diaDisplayErrors.open();
            return; // The decision is taken in the form;
        }
        // Check if it contains any form at all
        if (!loSingleForms.length) {
            // It's empty - continue
            modelappData.getData().selectedForm.setup = { forms:[] };
            modelappData.refresh();
            return; // COMPLETE!!
        }        
        controller.clearErrors(C_CONTEXT_LIST_SINGLE_FORM);
        // Check if all the forms were loaded.
        // If yes, then refreshes the model and exits the Single Form loading
        // If not, then attempts to load them
        let lvTotalGets = loSingleForms.length;
        let lvDoneGets = 0;
        // let lvFailedGets = 0;
        oApp.setBusy(true);
        for (let loForm of loSingleForms) {
            if (typeof loForm === "object") {
                lvDoneGets++;
            }
            else {
                let lvFormId = loForm;
                apiGetSingleForm({parameters:{id:lvFormId}})
                .then(function (poResult, pvState, poXhr) {
                    lvDoneGets++;

                    let lvIndex = loSingleForms.indexOf(poResult.id);
                    if (lvIndex < 0) {
                        // lvFailedGets++;
                        controller.addError(C_CONTEXT_LIST_SINGLE_FORM, {id: lvFormId, text: txtIndexNotFound.getText()});
                    }
                    else {
                        // makes sure that the <form>.config.control structure exists
                        if (!loConfig?.control) {loConfig.control = {};}
                        if (!loConfig.control[poResult.id]) { loConfig.control[poResult.id] = {}; }
                        // adds the Single FORM id to every child to the field "_sfId"
                        // also adds the config field if it exists
                        let loOptions = {
                            "field": C_FIELD_ID_SINGLE_FORM,
                            // "fieldConfig": C_FIELD_CONFIG_ELEMENT,
                            // "applyConfig": true,
                            // "formConfig": loConfig.control[poResult.id],
                            "children": ["elements"]
                        };
                        loOptions[C_FIELD_ID_SINGLE_FORM] = poResult.id;
                        controller.applySingleFormIdToChildrenOf(poResult?.setup, loOptions);
                        loSingleForms[lvIndex] = poResult;
                    }
                    if (lvDoneGets === lvTotalGets) {
                        oApp.setBusy(false);
                        controller.processListSingleForm( init, true /* inLoop = true */ );
                    }
                })
                .catch(function (poXhr, pvState) {
                    lvDoneGets++;
                    // lvFailedGets++
                    controller.addError(C_CONTEXT_LIST_SINGLE_FORM, {id: lvFormId, text: poXhr.responseText});
                    if (lvDoneGets === lvTotalGets) {
                        oApp.setBusy(false);
                        controller.processListSingleForm( init, true /* inLoop = true */ );
                    }
                })
            }
        }
        if (lvDoneGets === lvTotalGets) {
            // This only occurs if all the ids in the forms array became objects (i.e.: where loaded)
            oApp.setBusy(false);
            modelappData.refresh();

            modelappControl.getData().enablePreview = !!(  Array.isArray(modelappData.getData().selectedForm?.setup?.forms) 
                                                            && 
                                                            modelappData.getData().selectedForm.setup.forms.length           );
            modelappControl.refresh();
            return; // COMPLETE!!
        }
    },
    applySingleFormIdToChildrenOf: function(source, options) {
        if (source && !Array.isArray(source) && typeof source === "object") {
            // This is an object. apply the field and check for children
            source[options.field] = options[C_FIELD_ID_SINGLE_FORM];
            // // Adds its config part if it exists
            // if (options.applyConfig && options.formConfig[source.id]) {
            //     source[options.fieldConfig] = options.formConfig[source.id];
            // }
            if (Array.isArray(options.children)) {
                for (let lvChildName of options.children) {
                    if (source[lvChildName] && typeof source[lvChildName] === "object") {
                        controller.applySingleFormIdToChildrenOf(source[lvChildName], options);
                    }
                }
            }
        }
        else if (source && Array.isArray(source)) {
            for (let loItem of source) {
                if (loItem && typeof loItem === "object") {controller.applySingleFormIdToChildrenOf(loItem, options)};
            }
        }
    },
    applyToTreeOutline: function( callbackCode ) {
        for (let item of listProjectView.getItems()) {
            callbackCode( item.getContent()[0] );
        }
    },
    getItemSingleFormById: function( id ) {
        if (!Array.isArray(modelappData.getData()?.selectedForm?.setup?.forms)) { return null; /* No data */ }
        let loForms = modelappData.getData().selectedForm.setup.forms;
        let lvIndex = loForms.map(x=>x.id).indexOf(id);
        if ( lvIndex < 0 || lvIndex >= loForms.length ) { return null; /* Out of bounds */}
        return listSingleForm.getItems()[lvIndex];
    },
    getItemProjectViewCounterpart: function ( ui5Item, ignoreWrapper = false ) {
        let lvIndex = Number.parseInt(ui5Item.getBindingContext("appData").getPath().replace(/.*\//, ""));
        // There's a bug changing the css class of the counterpart, so the wrapper was added
        //
        // By default, instead of returning the counterpart itself, it is returned a wrapper that will set/remove the class
        // directly from the DOM as well.
        //
        // ignoreWrapper === true => the counterpart is directly returned
        let loCounterpart = (isNaN(lvIndex) || (lvIndex >= listProjectView.getItems().length))
                            ? null
                            : listProjectView.getItems()[lvIndex];
        if (ignoreWrapper) { return loCounterpart; }
        if (!loCounterpart) { 
            return { 
                self:null, 
                addStyleClass: ()=>{}, 
                removeStyleClass: ()=>{},
                hasStyleClass: ()=>{},
                toggleStyleClass: ()=>{},
                focus: ()=>{}
            }; 
        }
        let loCounterpartDOM = loCounterpart.getDomRef();
        return {
            self: loCounterpart,
            addStyleClass: (className) => {
                loCounterpart.addStyleClass(className);
                loCounterpartDOM.classList.add(className);
                return loCounterpart;
            },
            removeStyleClass: (className) => {
                loCounterpart.removeStyleClass(className);
                loCounterpartDOM.classList.remove(className);
                return loCounterpart;
            },
            hasStyleClass: (className) => loCounterpartDOM.classList.contains(className),
            toggleStyleClass: (className) => {
                loCounterpart.toggleStyleClass(className);
                loCounterpartDOM.classList.toggle(className);
                return loCounterpart;
            },
            focus: () => loCounterpartDOM.focus()
        }
    },
    setSelectedItemSingleForm: function( ui5Item, ignoreWrapper = false ) {
        // if (typeof modelappControl.getData() !== "object") {
        //     modelappControl.setData( {
        //         itemSingleForm: {
        //             selected: ui5Item
        //         }
        //     });
        // }
        // else {
            if (!modelappControl.getData().itemSingleForm) {modelappControl.getData().itemSingleForm = {}}
            let loItemSingleFormData = modelappControl.getData().itemSingleForm;
            if (loItemSingleFormData.selected instanceof sap.ui.core.Control) {
                loItemSingleFormData.selected.removeStyleClass(C_CSS_LIST_ITEM_SELECTED);
                this.getItemProjectViewCounterpart(loItemSingleFormData.selected).removeStyleClass(C_CSS_LIST_ITEM_SELECTED);
            }
            loItemSingleFormData.selected = ui5Item;
            modelappControl.refresh();
        // }
        if (ui5Item) {
            ui5Item.addStyleClass(C_CSS_LIST_ITEM_SELECTED);
            ui5Item.focus();
            let loCounterpardWrapper = this.getItemProjectViewCounterpart(ui5Item);
            loCounterpardWrapper.addStyleClass(C_CSS_LIST_ITEM_SELECTED);
            loCounterpardWrapper.focus();
        }
    },
    resetDetailPageSelections: () => {
        // Remove the class' on the selection
        controller.setSelectedItemSingleForm();
        // Delete all the selections' data;
        delete modelappControl.getData().itemSingleForm.selected;
        delete modelappControl.getData().projectItemSelected;
        delete modelappData.getData().selectedElement
        modelpanTopProperties.setData();
        // Traverse the forms' elements and increase the _changeCount value
        Utils.increaseChangeCountAllForms(modelappData.getData().selectedForm);
        // Refresh the model
        modelappControl.refresh();
        modelappData.refresh();
    },
    filterProjectViewItemsByWhatToHide: () => {
        let loFilters = [new sap.ui.model.Filter("option", "NE", "I")];
        let lvUpdateDisabled, lvUpdateExcluded;
        switch( modelappControl.getData().selectedHideFilter ) {
            case "1":
                // loFilters.push(new sap.ui.model.Filter("_disabled", "NE", true));
                loFilters.push(
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("_disabled", "NE", true),
                            new sap.ui.model.Filter("_excluded", "EQ", true)
                        ],
                        and: false
                    })
                )
                lvUpdateDisabled = true;
                break;
            case "2":
                loFilters.push(
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("_disabled", "EQ", true),
                            new sap.ui.model.Filter("_excluded", "NE", true)
                        ],
                        and: false
                    })
                )

                lvUpdateExcluded = true;
                break;
            case "3":
                loFilters.push(new sap.ui.model.Filter("_disabled", "NE", true));
                loFilters.push(new sap.ui.model.Filter("_excluded", "NE", true));
                lvUpdateDisabled = true;
                lvUpdateExcluded = true;
                break;
            default:
        }
        controller.updateChildrenOfDisabled();
        controller.updateChildrenOfExcluded();

        controller.applyToTreeOutline((tree) => {
            tree.getBinding("items").filter(loFilters);
        });
    },
    updateChildrenOfDisabled: () => {
        const fnUpdateArray = (pvSfId, poElements, pvForce) => {
            if (!Array.isArray(poElements)) { return; }
            for (let loElement of poElements) {
                loElement._disabled = !!(pvForce || loElement.disabled);
                if (Array.isArray(loElement?.elements) && loElement.elements.length) {fnUpdateArray(pvSfId, loElement.elements, loElement._disabled);}
            }
        }
        let loSingleForms = Array.isArray(modelappData?.getData()?.selectedForm?.setup?.forms) ? modelappData.getData().selectedForm.setup.forms : [];
        for (let loSForm of loSingleForms) { fnUpdateArray(loSForm.id, loSForm.setup); }
    },
    updateChildrenOfExcluded: () => {
        let loMasterConfig = modelappData?.getData()?.selectedForm?.config?.control;
            loMasterConfig = ((typeof loMasterConfig === "object") && loMasterConfig) ? loMasterConfig : {};
        const fnUpdateArray = (pvSfId, poElements, pvForce) => {
            if (!Array.isArray(poElements)) { return; }
            for (let loElement of poElements) {
                loElement._excluded = !!(pvForce || (loMasterConfig[pvSfId] && loMasterConfig[pvSfId][loElement.id] && loMasterConfig[pvSfId][loElement.id].excluded));
                if (Array.isArray(loElement?.elements) && loElement.elements.length) {fnUpdateArray(pvSfId, loElement.elements, loElement._excluded);}
            }
        }
        let loSingleForms = Array.isArray(modelappData?.getData()?.selectedForm?.setup?.forms) ? modelappData.getData().selectedForm.setup.forms : [];
        for (let loSForm of loSingleForms) { fnUpdateArray(loSForm.id, loSForm.setup); }
    },
    addRendererCustomizableFields: () => {
        // Removes previous items
        let parentOptions = insectionSettingsRendererOptions.getParent();
        let optionsIndex = parentOptions.indexOfItem(insectionSettingsRendererOptions)+1;
        while (parentOptions.getItems().length > optionsIndex) {
            parentOptions.removeItem(parentOptions.getItems()[optionsIndex]); }
        let parentFields = insectionPropertiesRendererOptions.getParent();
        while (!parentFields.getContent) {parentFields = parentFields.getParent()};
        let fieldsIndex = parentFields.indexOfContent(insectionPropertiesRendererOptions)+1;
        while (parentFields.getContent().length > fieldsIndex) {
            parentFields.removeContent(parentFields.getContent()[fieldsIndex]); }
        // Adds the items of the subscribed renderers
        let createdIds = [];
        for (let renderer of modelrendererCustomization.getData() ?? []) {
            let properties;
            if ((properties=renderer.composerFields?.fields ?? []) && properties.length) {
                let groupId = renderer.composerId ?? `${renderer.nameSpace}--${renderer.displayType}`;
                if (createdIds.includes(groupId)) {continue; /* already generate for this groupId */}
                //
                // Creates the group id
                let optionsCheckbox = buildOptionsForCheckboxGroup(groupId,renderer);
                let ui5CheckboxGroup = new sap.m.CheckBox(
                    APPVIEW.createId(groupId), optionsCheckbox._new);
                delete optionsCheckbox._new;
                for (let bindingName of Object.getOwnPropertyNames(optionsCheckbox)) {
                    ui5CheckboxGroup.bindProperty(bindingName, optionsCheckbox[bindingName]);}
                parentOptions.addItem(ui5CheckboxGroup);
                //
                // Creates the fields
                let propertiesTitleId = `${groupId}-propertiesTitle`;
                let optionsGroup = buildOptionsForPropertiesTitle(groupId,propertiesTitleId,renderer);
                let ui5PropertiesTitle = new sap.m.Title(
                    APPVIEW.createId(propertiesTitleId), optionsGroup._new);
                ui5PropertiesTitle.addStyleClass("sapUiTinyMarginTop");
                delete optionsGroup._new;
                for (let bindingName of Object.getOwnPropertyNames(optionsGroup)) {
                    ui5PropertiesTitle.bindProperty(bindingName, optionsGroup[bindingName]);}
                parentFields.addContent(ui5PropertiesTitle);
                for (let field of properties) {
                    let fieldInputName = `${groupId}-inp${field.id}`;
                    let fieldLabelName = `${groupId}-lbl${field.id}`;
                    let optionsLabel = buildOptionsForPropertiesLabel(groupId,fieldLabelName,field);
                    let optionsInput = buildOptionsForPropertiesInput(groupId,fieldInputName,field);
                    let label = new sap.m.Label(
                        APPVIEW.createId(fieldLabelName), optionsLabel._new);
                    let input = new sap.m.Input(
                        APPVIEW.createId(fieldInputName), optionsInput._new);
                    delete optionsLabel._new;
                    delete optionsInput._new;
                    for (let bindingName of Object.getOwnPropertyNames(optionsLabel)) {
                        label.bindProperty(bindingName, optionsLabel[bindingName]);}
                    for (let bindingName of Object.getOwnPropertyNames(optionsInput)) {
                        input.bindProperty(bindingName, optionsInput[bindingName]);}
                    parentFields.addContent(label);
                    parentFields.addContent(input);
                }
                //
                // Adds this groupId
                createdIds.push(groupId);
            }
        }
        
        function buildOptionsForCheckboxGroup(groupId,renderer) {
            return {
                "_new": {
                    "visible": { parts: ["/_data/id", "/_data/_sfId", "/_data/_changeCount"] },
                    "text": renderer.composerFields?.checkboxLabel ?? `Use ${groupId}`,
                    "selected": { parts: ["/_data/id", "/_data/_sfId", "/_data/_changeCount"] },
                    "editable": "{appControl>/enableEdit}",
                    "select": function(oEvent) {
                        let loData = modelpanTopProperties.getData()._data;
                        let loConfig = modelpanTopProperties.getData()._config[loData.id];
                        if (!loConfig) {
                            loConfig = {};
                            modelpanTopProperties.getData()._config[loData.id] = loConfig;
                        }
                        if (!loConfig.useRenderer) {loConfig.useRenderer = {}};
                        loData._changeCount++; if (isNaN(loData._changeCount)) {loData._changeCount=0;}

                        loConfig.useRenderer[groupId] = oEvent.getParameter("selected");
                        modelpanTopProperties.refresh();
                        modelappData.refresh();

                        // updates form changes state
                        Utils.updatesFormChangesState();
                    }
                },
                "selected": {
                    "parts": ["/_data/id", "/_data/_sfId", "/_data/_changeCount"],
                    "formatter": function (_dataid, _data_sfId, _data_changeCount) {
                        if (typeof _dataid === "undefined" || _dataid === null || _dataid === "") {
                            return;
                        }
                        let loData = modelpanTopProperties.getData()._data;
                        let loConfig = modelpanTopProperties.getData()._config[loData.id];
                        return !!loConfig?.useRenderer?.[groupId];
                    }
                },
                "visible": {
                    "parts": ["/_data/id", "/_data/_sfId", "/_data/_changeCount"],
                    "formatter": function (_dataid, _data_sfId, _data_changeCount) {
                        if (typeof _dataid === "undefined" || _dataid === null || _dataid === "") {
                            return false;
                        }
                        if (typeof _data_sfId === "undefined" || _data_sfId === null || _data_sfId === "") {
                            return false;
                        }
                        let loThisSfData = ModelData.FindFirst(modelappData.getData().selectedForm.setup.forms, "id", _data_sfId);
                        if (Array.isArray(loThisSfData?.setup)) {
                            let lohisElementIsSection = ModelData.FindFirst(loThisSfData.setup, "id", _dataid);
                            if (lohisElementIsSection) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }
        };
        function buildOptionsForPropertiesTitle(groupId,propertiesTitleId,renderer) {
            return {
                "_new": {
                    "text": renderer?.composerFields?.groupTitle ?? propertiesTitleId,
                    "visible": { parts: ["/_data/id", "/_data/_sfId", "/_data/_changeCount"] },
                },
                "visible": {
                    "parts": ["/_data/id", "/_data/_sfId", "/_data/_changeCount"],
                    "formatter": function (_dataid, _data_sfId, _data_changeCount) {
                        if (typeof _dataid === "undefined" || _dataid === null || _dataid === "") { return; } 
                        let loData = modelpanTopProperties.getData()._data;
                        let loConfig = modelpanTopProperties.getData()._config[loData.id];
                        return !!loConfig?.useRenderer?.[groupId];
                    }
                }
            }
        };
        function buildOptionsForPropertiesInput(groupId,fieldInputName,field) {
            return {
                "_new": {
                    "value": { parts: ["/_data/id", "/_data/_sfId", "/_data/_changeCount"] },
                    "visible": { parts: ["/_data/id", "/_data/_sfId", "/_data/_changeCount"] },
                    "editable": "{appControl>/enableEdit}",
                    "change": function(oEvent) {
                        let data = modelpanTopProperties.getData()._data;
                        let config = modelpanTopProperties.getData()._config[data.id];
                        if (!config) {
                            config = { renderer:{} };
                            modelpanTopProperties.getData()._config[data.id] = config;
                        }
                        if (!config.renderer) {
                            config.renderer = {};
                        }
                        if (!config.renderer[groupId]) {
                            config.renderer[groupId] = {};
                        }
                        data._changeCount++; if (isNaN(data._changeCount)) {data._changeCount = 0;}

                        config.renderer[groupId][field.id] = oEvent.getParameter("newValue");

                        modelpanTopProperties.refresh();
                        modelappData.refresh();

                        // updates form changes state
                        Utils.updatesFormChangesState();
                    }
                },
                "value": {
                    "parts": ["/_data/id", "/_data/_sfId", "/_data/_changeCount"],
                    "formatter": function (_dataid, _data_sfId, _data_changeCount) {
                        if (typeof _dataid === "undefined" || _dataid === null || _dataid === "") { return; } 
                        let loData = modelpanTopProperties.getData()._data;
                        let loConfig = modelpanTopProperties.getData()._config[loData.id];
                        if (loConfig?.renderer?.[groupId]?.[field.id]) {
                            return loConfig.renderer[groupId][field.id];
                        }
                        else {
                            return ;
                        }
                    }
                },
                "visible": {
                    "parts": ["/_data/id", "/_data/_sfId", "/_data/_changeCount"],
                    "formatter": function (_dataid, _data_sfId, _data_changeCount) {
                        if (typeof _dataid === "undefined" || _dataid === null || _dataid === "") { return; } 
                        let loData = modelpanTopProperties.getData()._data;
                        let loConfig = modelpanTopProperties.getData()._config[loData.id];
                        return !!loConfig?.useRenderer?.[groupId];
                    }
                }
            }
        };
        function buildOptionsForPropertiesLabel(groupId,fieldLabelName,field) {
            return {
                "_new": {
                    "text": field?.label ?? field?.id,
                    "visible": { parts: ["/_data/id", "/_data/_sfId", "/_data/_changeCount"] },
                },
                "visible": {
                    "parts": ["/_data/id", "/_data/_sfId", "/_data/_changeCount"],
                    "formatter": function (_dataid, _data_sfId, _data_changeCount) {
                        if (typeof _dataid === "undefined" || _dataid === null || _dataid === "") { return; } 
                        let loData = modelpanTopProperties.getData()._data;
                        let loConfig = modelpanTopProperties.getData()._config[loData.id];
                        return !!loConfig?.useRenderer?.[groupId];
                    }
                }
            }
        };
    }
};

sap.ui.getCore().attachInit(function(startParams) {
    new Promise(r=>r()).then(function() {
        controller.init();

        window.importPicture = controller.importPicture;
        window.importForm = controller.importForm;
    })
});
