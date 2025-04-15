let loData = modeloPageDetail.getData();
let lvMustRefresh = false;
let lvNowDate = Utils.convIsoToYyyymmddDate(new Date());
if (Utils.isDateInPeriod(lvNowDate, loData._validFrom, loData._validTo)) {
    if (loData.obsolete) {
        loData.obsolete = false
        switch (loData.lastState) {
            case C_STATE_DRAFT:
                loData.draft = true;
                loData.released = false;
                break;
            case C_STATE_RELEASED:
                loData.draft = false;
                loData.released = true;
                break;
        }
        lvMustRefresh = true;
    }
}
else {
    if (loData.draft) { loData.lastState = C_STATE_DRAFT; }
    if (loData.released) { loData.lastState = C_STATE_RELEASED; }
    loData.draft = false;
    loData.released = false;
    loData.obsolete = true;
    lvMustRefresh = true;
}
loData.validFrom = Utils.convYyyymmddToIsoDate(loData._validFrom);
loData.validTo = Utils.convYyyymmddToIsoDate(loData._validTo);
if (lvMustRefresh) {modeloPageDetail.refresh();}

// updates form changes state
Utils.updatesFormChangesState();
