diaModelColumnSelect.destroyCustomData();
diaModelColumnSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);

diaModelColumnSelect.open();