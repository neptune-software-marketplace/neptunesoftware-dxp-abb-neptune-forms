const listItem = oEvent.getParameter("listItem");
const context = listItem.getBindingContext();
const data = context.getObject();
const parent = controller.getParentFromId(data.id);

if (data.type === "Table" || parent.type === "Table") {
    modelappControl.oData.table = true;
} else {
    modelappControl.oData.table = false;
}

modelappControl.refresh();

controller.currentFilter = "Element";
controller.selectObjectFromId(data.id);
