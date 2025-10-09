// setUp let element = modeloPageDetail.oData.setup;

// current element
// element =  modelpanTopProperties.oData
// current ui element
// field = sap.ui.getCore().byId("field" + id);

diaNumSelect.destroyCustomData();
diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);
// #70 - 2.2. - Begin
diaNumSelect.addCustomData( new sap.ui.core.CustomData({ key: "fieldId", value: modelpanTopProperties.getData()?.id }) );
diaNumSelect.addCustomData( new sap.ui.core.CustomData({ key: "fieldType", value: modelpanTopProperties.getData()?.type || "AngleCalc" }) );
// #70 - 2.2. - End

diaNumSelect.open();