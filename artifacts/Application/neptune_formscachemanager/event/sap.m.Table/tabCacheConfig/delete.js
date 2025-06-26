const deleteItem = oEvent.getParameter("listItem");
const context = deleteItem.getBindingContext();
const data = context.getObject();

jQuery.sap.require("sap.m.MessageBox");
sap.m.MessageBox.confirm("", {
    title: TextCacheObjectDelete.getText() + " " + data.objectName, 
    onClose: function (sAction) {
        if (sAction === sap.m.MessageBox.Action.OK) {
            ModelData.Delete(modeltabCacheConfig, "objectName", data.objectName);
            modeltabCacheConfig.refresh();
            CacheManager.clearCache(data.objectName);
            CacheManager.objects = CacheManager.objects.filter(
                (item) => item.objectName !== data.objectName
            );

            CacheManager.saveConfig();
        }
    }, 
    styleClass: "", 
    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL], 
    emphasizedAction: sap.m.MessageBox.Action.OK, 
    initialFocus: null, 
    textDirection: sap.ui.core.TextDirection.Inherit, 
    dependentOn: null, 
});


