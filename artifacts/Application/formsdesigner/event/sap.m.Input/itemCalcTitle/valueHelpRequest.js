diaNumSelect.destroyCustomData();
diaNumSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);

diaNumSelect.open();