if (oEvent.getParameter("selected")) {
    let loData = modeloPageDetail.getData();
    loTempValidTo = Utils.dateCalculate(new Date(), -1, C_DATE_DAY);
    if (loTempValidTo instanceof Date && !isNaN(loTempValidTo.getTime())) {
        loData.validTo = loTempValidTo.toISOString();
        loData._validTo = Utils.convIsoToYyyymmddDate(loData.validTo);
        if (loData._validFrom && loData._validFrom > loData._validTo) {
            loData.validFrom = loData.validTo;
            loData._validFrom = loData._validTo;
        }
        modeloPageDetail.refresh();
    }
}

// updates form changes state
Utils.updatesFormChangesState();
