CacheManager.freeObjects();
CacheManager = null;

if (ConfigUIController.bReload){ 
      sap.m.MessageToast.show(TextPageReload.getText());
      setTimeout(() => {
        location.reload();
      }, 1000);    
}

