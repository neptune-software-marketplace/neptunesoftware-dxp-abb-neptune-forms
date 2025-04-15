let loData = modelpanTopProperties.getData()._data;
let loConfig = modelpanTopProperties.getData()._config[loData.id];
if (!loConfig) {
    loConfig = {};
    modelpanTopProperties.getData()._config[loData.id] = loConfig;
}
loData._changeCount++; if (isNaN(loData._changeCount)) {loData._changeCount=0;}

loConfig.excluded = oEvent.getParameter("selected");
modelpanTopProperties.refresh();
modelappData.refresh();

// updates form changes state
Utils.updatesFormChangesState();
