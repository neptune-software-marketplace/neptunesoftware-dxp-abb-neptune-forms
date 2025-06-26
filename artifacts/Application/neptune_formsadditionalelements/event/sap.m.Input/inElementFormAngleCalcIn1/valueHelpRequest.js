// setUp let element = modeloPageDetail.oData.setup;

// current element
// element =  modelpanTopProperties.oData
// current ui element
// field = sap.ui.getCore().byId("field" + id);

diaNumSelect.destroyCustomData();
diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);

diaNumSelect.open();