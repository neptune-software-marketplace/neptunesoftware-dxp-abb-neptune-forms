diaCacheObjectSelect.destroyCustomData();
diaCacheObjectSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);

diaCacheObjectSelect.open();