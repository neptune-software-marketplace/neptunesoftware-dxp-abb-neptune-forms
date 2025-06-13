console.log("Using OutlineItems@List drop");
// @ts-ignore
let oDraggedControl:sap.ui.core.Element = oEvent.getParameter("draggedControl");
// @ts-ignore
let oDroppedControl:sap.ui.core.Element = oEvent.getParameter("droppedControl");

let oDraggedContext = oDraggedControl.getBindingContext();
let oDroppedContext = oDroppedControl.getBindingContext();

if (!oDraggedContext && !oDroppedContext) return;

// @ts-ignore
const position = oEvent.getParameter("dropPosition");

let oDraggedData:any = oDraggedContext.getObject();
let oDroppedData:any = oDroppedContext.getObject();

let oDraggedParent;
let oDroppedParent;
// @ts-ignore
let {getParentFromId, getIndexFromId, elementTypes, dragElement, selectObjectFromId} = controller;
// @ts-ignore
let {arrayMove} = Utils;

if (["Form", "Table"].includes(oDraggedData.type)) {
    oDraggedParent = oDraggedData;
    oDroppedParent = getParentFromId(oDroppedData.id);
} else {
    oDraggedParent = getParentFromId(oDraggedData.id);

    if (["Form", "Table", "FormTitle"].includes(oDroppedData.type)) {
        oDroppedParent = oDroppedData;
    } else {
        oDroppedParent = getParentFromId(oDroppedData.id);
    }
}

let indexDrag = getIndexFromId(oDraggedData.id);
let indexDrop = getIndexFromId(oDroppedData.id);

// Allowed in Table ?
const library:any = ModelData.FindFirst(elementTypes, "type", dragElement.type);

if (oDroppedParent.type === "Table" && !library.table) {
    sap.m.MessageToast.show("Element not allowed in parent Table");
    return;
}

const rootType = ["Form", "Table"];

// FORM - TOP
if (rootType.includes(oDraggedData.type) && rootType.includes(oDroppedData.type)) {
    arrayMove(modeloPageDetail.getData().setup, indexDrag, indexDrop);
}

// Prevent Parents to be Dropped wrong
if (rootType.includes(oDraggedData.type) && !oDroppedData.elements) {
    return;
}

if (!rootType.includes(oDraggedData.type) && rootType.includes(oDroppedData.type)) {
    if (oDraggedParent.id === oDroppedParent.id) {
        arrayMove(oDroppedParent.elements, indexDrag, 0);
    } else {
        oDroppedParent.elements.splice(indexDrop, 0, oDraggedData);
        ModelData.Delete(oDraggedParent.elements, "id", oDraggedData.id);
    }
}

if (!rootType.includes(oDraggedData.type) && !rootType.includes(oDroppedData.type)) {
    if (oDraggedParent.id === oDroppedParent.id) {
        arrayMove(oDroppedParent.elements, indexDrag, indexDrop);
    } else {
        if (oDroppedParent.type === "FormTitle" && oDraggedData.type === "FormTitle") {
            ModelData.Delete(oDraggedParent.elements, "id", oDraggedData.id);
            const parent = getParentFromId(oDroppedParent.id);
            indexDrop++;
            parent.elements.splice(indexDrop, 0, oDraggedData);
        } else {
            oDroppedParent.elements.splice(indexDrop, 0, oDraggedData);
            ModelData.Delete(oDraggedParent.elements, "id", oDraggedData.id);
        }
    }
}

// @ts-ignore
controller.checkDuplicateGroupsValidation(); // #54
modeloPageDetail.refresh(true);
selectObjectFromId(oDraggedData.id);
