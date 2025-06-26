diaModelColumnSelect.destroyCustomData();
diaModelColumnSelect.addCustomData(
    new sap.ui.core.CustomData({ key: "caller", value: this })
);

//CE
//diaModelColumnSelect.attachAfterClose( informationFieldChanged );
diaModelColumnSelect.open();