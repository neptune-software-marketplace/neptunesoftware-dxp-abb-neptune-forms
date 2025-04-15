let loData = modeloPageDetail.getData();
if (oEvent.getParameter("selected")) {
    let lvNowDate = Utils.convIsoToYyyymmddDate(new Date());
    if (!Utils.isDateInPeriod(lvNowDate, loData._validFrom, loData._validTo)) {
        if (loData._validFrom && loData._validFrom > lvNowDate) {loData._validFrom = lvNowDate;}
        if (loData._validTo && loData._validTo < lvNowDate) {loData._validTo = lvNowDate;}
        modeloPageDetail.refresh();
    }
}
else {
    loData.lastState = C_STATE_RELEASED;
    modeloPageDetail.refresh();
}

// updates form changes state
Utils.updatesFormChangesState();
