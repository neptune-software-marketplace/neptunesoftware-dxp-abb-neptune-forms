diaCacheConfig.close();
ConfigUIController.setEditable(false);

if (ConfigUIController.bReload && !ConfigUIController.bReloadMessageShown) {
    jQuery.sap.require("sap.m.MessageBox");
    sap.m.MessageBox.information(TextPageReloadLong.getText());
    ConfigUIController.bReloadMessageShown = true;
}
