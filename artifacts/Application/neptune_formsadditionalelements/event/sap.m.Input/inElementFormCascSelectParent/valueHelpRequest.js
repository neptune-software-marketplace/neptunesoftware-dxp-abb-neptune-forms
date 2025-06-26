diaNumSelect.destroyCustomData();
diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);
diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "fieldType", value: "CascSelect" })
);

diaNumSelect.open();