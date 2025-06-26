var CacheManager = {
    cacheDB: new OfflineDB("NeptuneCache"),
    config: { configuration: [] },
    objects: [],

    getConfig: function () {
        return new Promise((resolve, reject) => {
            //CHE - Added returning promise
            if (window.navigator.onLine) {
                apiCacheConfigGet({}).then( () => resolve(true) );
            } else {
                CacheManager.cacheDB.get("Configuration").then((data) => {
                    CacheManager.config = data;
                    CacheManager.getObjects();
                    resolve(true);
                });
            }
        });
    },

    saveConfig: function () {
        var options = {
            parameters: {
                //"where": "" // Optional
            },
            data: CacheManager.config,
        };
        apiCacheConfigSave(options);
    },

    getObjects: function () {
        CacheManager.config.configuration.forEach((element) => {
            var cacheObject = CacheManager.objects.find(
                (item) => item.objectName === element.objectName
            );
            if (!cacheObject) {
                cacheObject = {
                    objectName: element.objectName,
                    dataSource: element.dataSource,
                    cacheID: element.cacheID,
                    synched: false,
                    afterSynch: [],
                    model: new sap.ui.model.json.JSONModel(),
                };
                if (!!element.connectorID) cacheObject.connectorID = element.connectorID;
                CacheManager.objects.push(cacheObject);
            }
        });
    },

    freeObjects: function () {
        CacheManager.objects.forEach((object) => {
            object.model.setData([]);
            object.model = null;
            object.synched = false;
        });
    },

    getObjectData: function (objectName) {
        var data = [];
        const cacheObject = CacheManager.objects.find((item) => item.objectName === objectName);
        if (!!cacheObject) {
            data = cacheObject.model.getData();
            if (!data.length) data = [];
        }
        return data;
    },

    modelGetColumns: function (objectName) {
        var columns = [{ name: "" }];
        const cacheObject = CacheManager.objects.find((item) => item.objectName === objectName);
        if (!!cacheObject) {
            const cols = cacheObject.model.getData()[0].split("\t");
            for (i = 0; i < cols.length; i++) {
                columns.push({ name: cols[i] });
            }
        }
        return columns;
    },

    clearCache: function (objectName) {
        const cacheObject = CacheManager.objects.find((item) => item.objectName === objectName);
        if (!!cacheObject) {
            cacheObject.synched = false;
            cacheObject.model.setData([]);
            CacheManager.cacheDB.delete(cacheObject.cacheID);
        }
    },

    tsvStore: function (tsv, objectName) {
        const lines = tsv.split("\r\n"); // Windows line break

        const cacheObject = CacheManager.objects.find((item) => item.objectName === objectName);
        if (!!cacheObject) {
            cacheObject.model.setData(lines);
            CacheManager.setCache(cacheObject);
        }
    },

    loadCacheFromConnector: async function (objectName) {
        const cacheObject = CacheManager.objects.find((item) => item.objectName === objectName);
        if (!cacheObject) return;
        if (!cacheObject.connectorID) return;

        let JSONdata = await cm.getConnectorData(cacheObject.connectorID);
        if (!Array.isArray(JSONdata)) JSONdata = [];
        await CacheManager.JSONStore(JSONdata, cacheObject.objectName);
    },

    JSONStore: async function (JSONdata, objectName) {
        let line = "";
        let lines = [];

        if (JSONdata.length > 0) {
            for (let key in JSONdata[0]) {
                if (line !== "") line = line + "\t";
                line = line + key.replaceAll("\t", " ");
            }
            lines.push(line);

            JSONdata.forEach((row) => {
                let line = "";
                let ind = 0;
                for (let key in row) {
                    if (ind > 0) line = line + "\t";
                    let value = "";
                    if (!!row[key]) {
                        if (typeof row[key] === "string") {
                            value = row[key];
                        } else {
                            value = JSON.stringify(row[key]);
                        }
                    }
                    line = line + value.replaceAll("\t", " ");
                    ind++;
                }
                lines.push(line);
            });
        }

        const cacheObject = CacheManager.objects.find((item) => item.objectName === objectName);
        if (!!cacheObject) {
            cacheObject.model.setData(lines);
            await CacheManager.setCache(cacheObject);
        }
    },

    subscribeAfterSynch: function (objectName, subscriber) {
        const cacheObject = CacheManager.objects.find((item) => item.objectName === objectName);
        if (!!cacheObject) {
            if (cacheObject.synched) {
                subscriber.process();
            } else {
                cacheObject.afterSynch.push(subscriber);
                if (cacheObject.afterSynch.length === 1) {
                    CacheManager.switchBusyIndicator(true);
                    CacheManager.readCache(cacheObject);
                }
            }
        }
    },

    processAfterSynch: function (cacheObject) {
        cacheObject.afterSynch.forEach((subscriber) => {
            subscriber.process();
        });
        cacheObject.afterSynch = [];
        CacheManager.switchBusyIndicator(false);
    },

    switchBusyIndicator: function (bStart) {
        if (bStart) {
            sap.ui.core.BusyIndicator.show();
            setTimeout(() => {
                sap.ui.core.BusyIndicator.hide();
            }, 20000);
        } else {
            let bSynchComplete = true;
            CacheManager.objects.forEach((object) => {
                if (!!object.connectorID) {
                    // Cache object ok if either
                    // object relevant:     object.synched is true, which implies afterSynch = []
                    // object not relevant: object.synched is false and afterSynch = []
                    bSynchComplete = bSynchComplete && object.afterSynch.length === 0;
                }
            });
            if (bSynchComplete) sap.ui.core.BusyIndicator.hide();
        }
    },

    readCache: async function (cacheObject) {
        let data = await CacheManager.cacheDB.get(cacheObject.cacheID);
        if (!Array.isArray(data)) data = [];
        cacheObject.model.setData(data);

        if (!!cacheObject.connectorID && data.length === 0) {
            // Set a busy indicator as we load the cache from a connector
            let dlgBusy = new sap.m.BusyDialog();
            dlgBusy.setText("Refreshing connector data....");
            dlgBusy.open();

            // CacheObject with connector
            CacheManager.loadCacheFromConnector(cacheObject.objectName)
                .then(() => dlgBusy.close())
                .catch((error) => {
                    console.log(error);
                    dlgBusy.close();
                });
        } else {
            cacheObject.synched = true;
            CacheManager.processAfterSynch(cacheObject);
        }
    },

    setCache: async function (cacheObject) {
        await CacheManager.cacheDB.save(cacheObject.cacheID, cacheObject.model.getData());
        cacheObject.synched = true;
        CacheManager.processAfterSynch(cacheObject);
    },
};
