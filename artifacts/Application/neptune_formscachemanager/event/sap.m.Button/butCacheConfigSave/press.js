const newObject = modelSFCacheConfig.getData();

if (ConfigUIController.bEdit) {
    if (newObject.dataSource === "Connector" && newObject.connectorID === "") {
        sap.m.MessageToast.show(TextErrorRequired.getText());
        return;
    }

    if (ConfigUIController.bNew) {
        if (newObject.objectName === "") {
            sap.m.MessageToast.show(TextErrorRequired.getText());
            return;
        }
        const objectConfig = CacheManager.config.configuration.find(
            (item) => item.objectName.toUpperCase() === newObject.objectName.toUpperCase()
        );
        if (!!objectConfig) {
            sap.m.MessageToast.show(TextErrorDuplicate.getText());
            return;
        }
    }

    ModelData.Update(modeltabCacheConfig, "objectName", newObject.objectName, newObject, "EQ");
}

var config = modeltabCacheConfig.getData();
config.forEach((element) => {
    element.cacheID = element.objectName + "_" + element.id;
    if (element.dataSource !== "Connector") delete element.connectorID;
});
config.sort((a, b) => {
    const nameA = a.objectName.toUpperCase(); // ignore upper and lowercase
    const nameB = b.objectName.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    // names must be equal
    return 0;
});
modeltabCacheConfig.setData(config);
modeltabCacheConfig.refresh();

CacheManager.saveConfig();
