const deleteItem = oEvent.getParameter("listItem");
const context = deleteItem.getBindingContext();
const data = context.getObject();

let elementIndex = context.sPath.split("/")[2];
ModelData.Delete(modelpanTopProperties.oData.items, "id", data.id);
modelpanTopProperties.refresh();
