sap.m.MessageToast.show(TextSuccessSave.getText());

CacheManager.cacheDB.save("Configuration", CacheManager.config);
CacheManager.getObjects();

ConfigUIController.setEditable(false);