const ConfigUIController = {
    bEdit: false,
    bNew: false,
    bReload: false,
    bReloadMessageShown: false,

    setEditable: function (bEdit) {
        ConfigUIController.bEdit = bEdit;
        SFCacheConfig.setVisible(bEdit);
        butCacheConfigAdd.setVisible(!bEdit);
        contCacheConfigToolbar.setVisible(bEdit);

        if (!bEdit){
            modelSFCacheConfig.setData({});
            ConfigUIController.bNew = false;
        } 

        if ((typeof controller !== "undefined") && bEdit) ConfigUIController.bReload = true;

        inpSFCacheConfigObjectName.setEditable(ConfigUIController.bNew);

        modelSFCacheConfig.refresh();
    },
};
