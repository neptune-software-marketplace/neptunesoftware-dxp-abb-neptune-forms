diaNumSelect.destroyCustomData();
diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);
// #70 - 1.2. - Begin
diaNumSelect.addCustomData( new sap.ui.core.CustomData({ key: "fieldId", value: modelpanTopProperties.getData()?.id }) );
// #70 - 1.2. - End
diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "fieldType", value: "CascSelect" })
);

diaNumSelect.open();