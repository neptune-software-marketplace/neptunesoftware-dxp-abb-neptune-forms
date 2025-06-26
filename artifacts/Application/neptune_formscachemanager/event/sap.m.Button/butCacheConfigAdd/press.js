const data = {
    id: ModelData.genID(),
    "objectName": "",
    "dataSource": "tsvFile",
    "connectorID": "",
    "refreshFrequencyHours": 24,
    "refreshFrequencyMinutes": 0
}

ConfigUIController.bNew = true;
modelSFCacheConfig.setData(data);
ConfigUIController.setEditable(true);