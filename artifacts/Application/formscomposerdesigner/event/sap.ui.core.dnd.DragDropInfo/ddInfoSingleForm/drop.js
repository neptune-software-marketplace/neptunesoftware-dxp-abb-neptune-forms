// drop
let loData = modelappData.getData()?.selectedForm?.setup?.forms;
if (!Array.isArray(loData)) {
    console.warn(`Drag&Drop failed: bad list data (path: "/selectedForm/setup/forms", data: ${String(loData)}).`);
    return false;
}
let loDragged = oEvent.getParameter("draggedControl");
let loDropped = oEvent.getParameter("droppedControl");
if (loDragged === loDropped) {
    return true; /* Same control, nothing to do */
}
let lvDraggedIndex = Number.parseInt(loDragged.getBindingContext("appData").getPath().replace(/.*\//, ""));
let lvDroppedIndex = Number.parseInt(loDropped.getBindingContext("appData").getPath().replace(/.*\//, ""));
let loDraggedData = loData[lvDraggedIndex];
if (isNaN(lvDraggedIndex) || isNaN(lvDroppedIndex)) {
    console.warn(`Drag&Drop failed: bad index found (from: ${lvDraggedIndex}, to: ${lvDroppedIndex}).`);
    return false;
}
if (lvDraggedIndex < lvDroppedIndex) {
    loData.splice(lvDroppedIndex + 1, 0, loDraggedData);
    loData.splice(lvDraggedIndex, 1);
} else {
    loData.splice(lvDraggedIndex, 1);
    loData.splice(lvDroppedIndex, 0, loDraggedData);
}

//LP Ticket 22681 BEGIN
debugger;
modelappData.getData().selectedForm.setup.forms = loData;
modelappData.refresh();
const formIds = loData.map(lD => lD.id);
modeloPageDetail.getData().setup.forms = formIds;
modeloPageDetail.refresh();
// let appControl = modelappControl.getData();
// appControl.hasChanges = true;
// modelappControl.setData(appControl);
// modelappControl.refresh();
Utils.increaseChangeCountAllForms(modelappData.getData().selectedForm);
Utils.updatesFormChangesState();
// modeloPageDetail.refresh();
// Adds the single form to the list
//LP Ticket 22681 END

// Utils.increaseChangeCountAllForms(modelappData.getData().selectedForm);
// modelappData.refresh();
 controller.setSelectedItemSingleForm(controller.getItemSingleFormById(loDraggedData.id));

return true;
