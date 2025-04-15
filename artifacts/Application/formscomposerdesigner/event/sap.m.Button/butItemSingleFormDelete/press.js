let loSfContext = this.getBindingContext("appData");
let loSfData = loSfContext.getObject();
let lvSfIndex = Number.parseInt(loSfContext.getPath().replace(/.*\//g, ""));
if (isNaN(lvSfIndex)) {
    return;
}
//
// Adjusts selected Form (Single) and deletes the selected Element,  (if it belongs to the deleted SF)
if (modelappData.getData().selectedElement?._data[C_FIELD_ID_SINGLE_FORM] === loSfData.id) {
    delete modelappData.getData().selectedElement;
}
// Handles the single form selection
let loSfSelectedItem = modelappControl.getData().itemSingleForm?.selected;
let loSfSelectedData = (loSfSelectedItem && loSfSelectedItem.getBindingContext("appData").getObject()) || {}; // Makes sure that the outcome is always an object (even if empty)
// Remove the selection before deleting the Single form
if (loSfSelectedItem) {
    loSfSelectedItem.removeStyleClass(C_CSS_LIST_ITEM_SELECTED);
    controller.getItemProjectViewCounterpart(loSfSelectedItem).removeStyleClass(C_CSS_LIST_ITEM_SELECTED);
}
if (loSfSelectedData?.id === loSfData.id) {
    delete modelappControl.getData().itemSingleForm.selected;
}
// Handles the element selection
if (modelappControl.getData().projectItemSelected?._sfId === loSfData.id) {
    delete modelappControl.getData().projectItemSelected;
    modelpanTopProperties.setData();
}
modeloPageDetail.getData().setup.forms.splice(lvSfIndex, 1);
modelappData.getData().selectedForm.setup.forms.splice(lvSfIndex, 1);
if (modeloPageDetail.getData().config.control) {
    delete modeloPageDetail.getData().config.control[loSfData.id];
}

delete modelappData.getData().selectedForm.config.control[loSfData.id];

modelappControl.getData().enablePreview = !!(Array.isArray(modelappData.getData().selectedForm?.setup?.forms) && modelappData.getData().selectedForm.setup.forms.length);

Utils.increaseChangeCountAllForms(modelappData.getData().selectedForm);
// updates form changes state
Utils.updatesFormChangesState();

modeloPageDetail.refresh();
modelappControl.refresh();
modelappData.refresh();
if (loSfSelectedData.id && loSfSelectedData.id !== loSfData.id) {
    controller.setSelectedItemSingleForm(controller.getItemSingleFormById(loSfSelectedData.id));
}
