let foundItem = false;
try {
    // @ts-ignore
    let itemObject:{[k:string]:any} = oEvent.getParameter("listItem").getBindingContext().getObject();
    let itemIndex:number = modeloPageDetail.getData().roles.findIndex(
        item => item.id === itemObject.id
    )
    if (itemIndex >= 0) {
        foundItem = true;
        modeloPageDetail.getData().roles.splice(itemIndex,1);
        modeloPageDetail.refresh();
    }
}
catch (error) {/* the error is to be handled gracefully */}

if (!foundItem) {
    sap.m.MessageToast.show("An error occurred. Item not deleted!");
}