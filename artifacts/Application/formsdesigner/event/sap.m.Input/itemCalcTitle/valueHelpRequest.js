diaNumSelect.destroyCustomData();

diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);
// #70 - 1.1. - Begin
diaNumSelect.addCustomData( new sap.ui.core.CustomData({ key: "fieldId", value: modelpanTopProperties.getData()?.id }) );
diaNumSelect.addCustomData( new sap.ui.core.CustomData({ key: "fieldType", value: modelpanTopProperties.getData()?.type || "Calc" }) );
// #70 - 1.1. - End
diaNumSelect.open();