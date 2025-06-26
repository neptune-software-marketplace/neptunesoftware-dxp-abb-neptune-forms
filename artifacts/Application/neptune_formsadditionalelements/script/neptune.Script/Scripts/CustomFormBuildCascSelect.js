const emptyKey = " ";

const cascSelectController = {
    parentSelItems: [],
    members: [],

    consolidate: function () {
        var newMembers = [];
        cascSelectController.members.forEach((member) => {
            if (FORMS.getElementFromId(member.id.substring(0, 36)) !== null) {
                member.listeners = [];
                newMembers.push(member);
            }
        });

        newMembers.forEach((member) => {
            const parent = FORMS.getElementFromId(member.element.parentSelectId.substring(0, 36));
            if (parent !== null) {
                cascSelectController.parentListenerAdd(member.element);
            } else {
                member.element.parentSelectId = "";
                member.element.parentSelectTitle = "";
            }
        });
        cascSelectController.members = newMembers;
    },

    memberAdd: function (element) {
        if (element.id === "") return;
        const member = cascSelectController.members.find((item) => item.id === element.id);
        if (typeof member === "undefined") {
            cascSelectController.members.push({ id: element.id, element: element, listeners: [] });
        } else {
            member.element = element;   
        }
    },

    parentListenerAdd: function (element) {
        if (element.parentSelectId === "") return;
        const member = cascSelectController.members.find(
            (item) => item.id === element.parentSelectId
        );
        if (typeof member !== "undefined") {
            const listener = member.listeners.find((item) => item.id === element.id);
            if (typeof listener === "undefined") {
                member.listeners.push({ id: element.id, element: element });
            }
        }
    },
};

function buildElementCascSelect(element) {
    const bindingField = element.fieldName ? element.fieldName : element.id;

    const cacheObject = CacheManager.objects.find((item) => item.objectName === element.objectName);
    if (!cacheObject) {
        element.objectName = "";
        element.key = "";
        element.keyPath = {};
        element.outputItems = [];
        element.columns = [];
    }

    // Name has prefix "model"
    const appControlName = FORMS.modelAppControlName.substring(5);

    const newField = new sap.m.ComboBox(FORMS.buildElementFieldID(element), {
        selectedKey: "{" + FORMS.bindingPath + bindingField + "}",
        width: "100%",
        // editable: FORMS.editable,
        editable: "{" + appControlName + ">/formControl/formEditable}",
        visible: FORMS.buildVisibleCond(element),
        change: function (oEvent) {
            cascSelectController.consolidate();

            const elementAttribute = this.getCustomData().find(
                (item) => item.getKey() === "element"
            );
            if (typeof elementAttribute === "undefined") return;
            const element = elementAttribute.getValue();

            if (element.outputItems.length > 0) {
                if (this.getSelectedKey() === emptyKey) {
                    element.outputItems.forEach((item) => {
                        const inputField = sap.ui.getCore().byId("field" + item.id);
                        if (typeof inputField !== "undefined") inputField.setValue("");
                    });
                } else {
                    const selectedItem = this.getSelectedItem();
                    if (!!selectedItem) {
                        const customAttribute = selectedItem
                            .getCustomData()
                            .find((item) => item.getKey() === "myData");
                        if (typeof customAttribute !== "undefined") {
                            const myData = customAttribute.getValue();
                            element.outputItems.forEach((item) => {
                                const inputField = sap.ui.getCore().byId("field" + item.id);
                                if (typeof inputField !== "undefined")
                                    inputField.setValue(myData[item.column]);
                            });
                        }
                    }
                }
            }

            const member = cascSelectController.members.find((item) => item.id === element.id);
            if (typeof member === "undefined") return;
            member.listeners.forEach((listener) => {
                const sel = sap.ui.getCore().byId("field" + listener.id);
                if (typeof sel !== "undefined") {
                    //const listener = FORMS.getElementFromId(id);
                    let subscriber = {
                        sel: sel,
                        element: listener.element,
                        process: function () {
                            setCascSelectItems(this.sel, this.element);
                            sel.fireChange();
                        },
                    };
                    CacheManager.subscribeAfterSynch(element.objectName, subscriber);
                }
            });
        },
    });
    
    if (!FORMS.parentIsTable(element.id)) prepareCascSelect(newField, element);

    return newField;
}

function prepareCascSelect(field, element, ind = -1, originalId = "", sectionId = "") {
    // Workaround for bug in sap.m.ComboBox
    setTimeout(() => {
        field.setEditable(FORMS.editable);
    }, 500);

    customFORMS.setSelectFilterFunction(field);
    field.addCustomData(new sap.ui.core.CustomData({ key: "element", value: element }));

    cascSelectController.memberAdd(element);

    // for CascSelects in forms, not tables
    if (ind === -1) {
        const mdata = FORMS.formParent.getModel().getData()[element.id];
        if (!!mdata) customFORMS.initialData[element.id] = mdata;
    } else {
        const marray = FORMS.formParent.getModel().getData()[sectionId];
        if (!!marray && Array.isArray(marray) && marray.length >= ind) {
            const mdata = marray[ind];
            //CE - Added check for when mdata is null
            if (!!mdata && !!mdata[originalId]) customFORMS.initialData[element.id] = mdata[originalId];
        }
    }

    if (element.parentSelectId === "") {
        let subscriber = {
            field: field,
            element: element,
            process: function () {
                setCascSelectItems(this.field, this.element);
                //this.newField.setBusy(false);
                sap.ui.core.BusyIndicator.hide();
            },
        };
        // CHE - Only subscribe if a Cache Object has been set
        if (!!element.objectName) {
            sap.ui.core.BusyIndicator.show(0);
            //newField.setBusy(true);
            //newField.setBusyIndicatorDelay(0);
            CacheManager.subscribeAfterSynch(element.objectName, subscriber);
        }
    }
}

function setCascSelectItems(sel, element) {
    resetSel(sel);
    if (typeof element === "undefined") {
        const elementAttribute = sel.getCustomData().find((item) => item.getKey() === "element");
        if (typeof elementAttribute === "undefined") return;
        element = elementAttribute.getValue();
    }
    element.keyPath = {};
    element.outputItems.forEach((item) => {
        const inputField = sap.ui.getCore().byId("field" + item.id);
        if (typeof inputField !== "undefined") {
            inputField.setValue("");
        }
    });
    if (element.key === "") return;

    let bitems = true;
    let parentSelectedData = false;
    const member = cascSelectController.members.find((item) => item.id === element.parentSelectId);
    let parentElement = null;
    if (typeof member !== "undefined") {
        parentElement = member.element;

        if (parentElement.key !== "") {
            const field = sap.ui.getCore().byId("field" + parentElement.id);
            if (typeof field !== "undefined") {
                element.keyPath = JSON.parse(JSON.stringify(parentElement.keyPath));
                element.keyPath[parentElement.key] = field.getSelectedKey();
                if (field.getSelectedKey() === emptyKey) {
                    bitems = false;
                } else {
                    const selectedItem = field.getSelectedItem();
                    if (!!selectedItem) {
                        const customAttribute = selectedItem
                            .getCustomData()
                            .find((item) => item.getKey() === "myData");
                        if (typeof customAttribute !== "undefined") {
                            parentSelectedData = customAttribute.getValue();
                        }
                    }
                }
            }
        } else {
            return;
        }
    }

    let items = [];
    if (bitems) {
        if (parentElement === null) {
            items = selGetItems(element);
        } else {
            items = selGetItems(element, parentSelectedData.lineIndexes);
        }
    }

    sel.destroyCustomData();
    let cd = new sap.ui.core.CustomData({ key: "element", value: "" });
    cd.setValue(element);
    //sel.addCustomData(new sap.ui.core.CustomData({ key: "element", value: element }));
    sel.addCustomData(cd);

    sel.removeAllItems();
    sel.setEditable(true);
    sel.addItem(new sap.ui.core.Item({ key: emptyKey, text: emptyKey }));
    sel.setSelectedKey(emptyKey);
    items.forEach((item, index) => {
        let text = "";
        if (typeof item.key === "string") {
            text = item.key.replace(/[{}[\]"\\]/g, " "); // AR TBC
        }
        if (text !== "") {
            var newItem = new sap.ui.core.Item({ key: text, text: text }); // AR TBC text or index as key
            newItem.addCustomData(new sap.ui.core.CustomData({ key: "myData", value: item }));
            sel.addItem(newItem);
        }
    });

    // Set initial values if available
    //console.log(element.title);
    if (!!customFORMS.initialData[element.id]) {
        //console.log(customFORMS.initialData[element.id]);
        sel.setSelectedKey(customFORMS.initialData[element.id]);
        delete customFORMS.initialData[element.id];
        // Caution: We only need to fire change for top elements
        //          since change already fires change of subsequent elements (listeners)
        if (element.parentSelectId === "") sel.fireChange();
    }
}

function selGetItems(element, lineIndexes) {
    const items = [];

    if (element.parentSelectId === "") {
        const storedItems = cascSelectController.parentSelItems.find(
            (item) => item.objectName === element.objectName && item.key === element.key
        );
        if (typeof storedItems !== "undefined") {
            return storedItems.items;
        }
    }

    const data = CacheManager.getObjectData(element.objectName);
    if (!data.length || data.length === 0) {
        sap.m.MessageToast.show("No model data loaded");
        return items;
    }
    const headers = data[0].split("\t");
    const mheaders = new Map();
    for (i = 0; i < headers.length; i++) {
        mheaders.set(headers[i], i);
    }
    const mitems = new Map();

    let dataLength = data.length;
    if (typeof lineIndexes !== "undefined") dataLength = lineIndexes.length + 1; // loop starts with i=1
    for (var i = 1; i < dataLength; i++) {
        let lineIndex = -1;
        if (typeof lineIndexes === "undefined") {
            lineIndex = i;
        } else {
            lineIndex = lineIndexes[i - 1];
        }
        row = data[lineIndex];

        if (typeof row === "string" && row !== "") {
            var currentline = row.split("\t");

            const ind = mheaders.get(element.key);
            if (typeof ind !== "undefined") {
                let mdata = { key: currentline[ind] };

                let mitem = mitems.get(mdata.key);
                if (typeof mitem !== "undefined") {
                    mitem.lineIndexes.push(lineIndex);
                } else {
                    element.outputItems.forEach((item) => {
                        const ind = mheaders.get(item.column);
                        if (typeof ind !== "undefined") mdata[item.column] = currentline[ind];
                    });
                    mdata.lineIndexes = [lineIndex];
                    mitems.set(mdata.key, mdata);
                }
            }
        }
    }

    const iterator = mitems.values();
    for (const item of iterator) {
        items.push(item);
    }
    items.sort((a, b) => {
        const nameA = a.key.toUpperCase(); // ignore upper and lowercase
        const nameB = b.key.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
    });

    if (element.parentSelectId === "") {
        cascSelectController.parentSelItems.push({
            objectName: element.objectName,
            key: element.key,
            items: items,
        });
    }

    return items;
}

function resetSel(sel) {
    sel.removeAllItems();
    sel.setSelectedKey(emptyKey);
}

function tablePostProcessingCascSelect(section, element, fromIndex, toIndex) {
    for (i = fromIndex; i < toIndex; i++) {
        const rowSid = "-field" + section.id + "-" + i;
        const rowSel = sap.ui.getCore().byId("field" + element.id + rowSid);

        if (typeof rowSel !== "undefined") {
            let rowElement = JSON.parse(JSON.stringify(element));
            rowElement.id = rowElement.id + rowSid;
            if (rowElement.parentSelectId !== "")
                rowElement.parentSelectId = rowElement.parentSelectId + rowSid;
            rowElement.outputItems.forEach((item) => {
                item.id = item.id + rowSid;
            });

            prepareCascSelect(rowSel, rowElement, i, element.id, section.id);
        }
    }
}

function tableProcessCascSelectData(section, element, fromIndex, toIndex, data) {
    for (i = fromIndex; i < toIndex; i++) {
        const rowSid = "-field" + section.id + "-" + i;
        const rowSel = sap.ui.getCore().byId("field" + element.id + rowSid);
        const mdata = data[i];

        if (typeof rowSel !== "undefined" && !!mdata) {
            if (!!mdata[element.id]) {
                //console.log(mdata[element.id]);
                const id = element.id + rowSid;
                customFORMS.initialData[id] = mdata[element.id];
                rowSel.setSelectedKey(mdata[element.id]);
            }
        }
    }
}

function tableProcessCascSelectEvents(section, element, fromIndex, toIndex) {
    for (i = fromIndex; i < toIndex; i++) {
        const rowSid = "-field" + section.id + "-" + i;
        const rowSel = sap.ui.getCore().byId("field" + element.id + rowSid);

        if (typeof rowSel !== "undefined" && element.parentSelectId === "") {
            // Caution: We only need to fire change for top elements
            //          since change already fires change of subsequent elements (listeners)
            rowSel.fireChange();
        }
    }
}

function sectionCopyCascSelectPostProcess(sourceElement, newElement) {
    sourceElement.elements.forEach((element, ind) => {
        if (element.type === "CascSelect") {
            newElement.elements[ind].objectName = element.objectName; //Cache Object
            newElement.elements[ind].key = element.key;
            newElement.elements[ind].keyPath = element.keyPath;
            newElement.elements[ind].columns = element.columns;

            sourceElement.elements.find((inp, i) => {
                if (inp.id === element.parentSelectId) {
                    newElement.elements[ind].parentSelectId = newElement.elements[i].id;
                    newElement.elements[ind].parentSelectTitle = newElement.elements[i].title;
                }
            });

            element.outputItems.forEach((item, i) => {
                sourceElement.elements.find((inp, j) => {
                    if (inp.id === item.id) {
                        newElement.elements[ind].outputItems[i].id = newElement.elements[j].id;
                        newElement.elements[ind].outputItems[i].title =
                            newElement.elements[j].title;
                    }
                });
            });
        }
    });
}
