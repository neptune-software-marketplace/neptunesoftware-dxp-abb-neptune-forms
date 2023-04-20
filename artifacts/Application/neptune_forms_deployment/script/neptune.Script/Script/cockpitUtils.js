const cockpitUtils = {
    isCockpit: false,
    dataSet: null,
    dataSaved: null,
    requiredFields: [],

    init: function () {
        if (sap.n && sap.n.Planet9) {
            cockpitUtils.isCockpit = true;
        } else {
            return;
        }
        // Format Buttons
        sap.n.Planet9.formatButtonRefresh(toolStartUpdate);
        sap.n.Planet9.formatButtonBack(butDetailBack);
    },
};

cockpitUtils.init();

if (sap.n) {
    sap.n.Shell.attachBeforeDisplay(localAppID, function (data) {
        toolStartUpdate.firePress();
    });
}
