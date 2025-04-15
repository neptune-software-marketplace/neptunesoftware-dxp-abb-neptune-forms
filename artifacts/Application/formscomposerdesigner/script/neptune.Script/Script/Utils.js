const C_STATE_DRAFT = 'D';
const C_STATE_RELEASED = 'R';
const C_STATE_OBSOLETE = 'O';

const C_DATE_YEAR = 0;
const C_DATE_MONTH = 1;
const C_DATE_DAY = 2;
const C_DATE_HOUR = 3;
const C_DATE_MINUTE = 4;
const C_DATE_SECOND = 5;

const Utils = {
    arrayMove: function (arr, fromPos, toPos) {
        while (fromPos < 0) {
            fromPos += arr.length;
        }
        while (toPos < 0) {
            toPos += arr.length;
        }
        if (toPos >= arr.length) {
            var k = toPos - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(toPos, 0, arr.splice(fromPos, 1)[0]);
    },

    buildValParamSelect: (select, i) => {
        select.destroyItems();
        while (i > 0) {
            select.addItem(
                new sap.ui.core.ListItem({
                    key: i,
                    text: i,
                })
            );
            i--;
        }
    },

    dateFormats: [{ title: "dd.MM.yyyy" }, { title: "MM/dd/yyyy" }, { title: "MM.yyyy" }, { title: "dd MMM" }],
    dateTimeFormats: [{ title: "dd.MM.yyyy HH:mm" }, { title: "MM/dd/yyyy HH:mm" }, { title: "dd MMM HH:mm" }],

    dateCalculate: (poDateFrom, pvChange, pvType) => {
        if (!poDateFrom && (typeof poDateFrom !== "number")) { return poDateFrom; } // can't calculate
        if (isNaN(Number.parseInt(pvChange))) { return poDateFrom; } // can't calculate
        switch (pvType) {
            case C_DATE_YEAR:
            case C_DATE_MONTH:
            case C_DATE_DAY:
            case C_DATE_HOUR:
            case C_DATE_MINUTE:
            case C_DATE_SECOND:
                break; // continue
            default:
                return poDateFrom; // can't calculate
        }
        let loDateFrom = (poDateFrom instanceof Date) ? poDateFrom : new Date(poDateFrom);
        if (isNaN(loDateFrom.getTime())) { return poDateFrom; } // can't calculate

        let lvChange = Number.parseInt(pvChange);
        let lvTimeStep = 1000; // second
        let lvStrDateFrom;
        let lvYear;
        switch (pvType) {
            case C_DATE_DAY:
                lvTimeStep = lvTimeStep*24; // Also executes the sections: C_DATE_HOUR, C_DATE_MINUTE, and C_DATE_SECOND
            case C_DATE_HOUR:
                lvTimeStep = lvTimeStep*60; // Also executes the sections: C_DATE_MINUTE, and C_DATE_SECOND
            case C_DATE_MINUTE:
                lvTimeStep = lvTimeStep*60; // Also executes the section: C_DATE_SECOND
            case C_DATE_SECOND:
                return (new Date(loDateFrom.getTime() + lvChange*lvTimeStep)); 
            case C_DATE_MONTH:
                lvStrDateFrom = Utils.convIsoToYyyymmddDate(loDateFrom);
                lvYear = Number.parseInt(lvStrDateFrom.slice(0,4)) + Number.parseInt(lvChange / 12);
                let lvMonth = Number.parseInt(lvStrDateFrom.slice(4,6)) + (lvChange % 12);
                if (lvMonth < 1) {
                    lvYear--;
                    lvMonth = 12 + lvMonth;
                }
                else if (lvMonth > 12) {
                    lvYear++;
                    lvMonth = lvMonth - 12;
                }
                return new Date(`${('0000'+lvYear).slice(-4)}-${('00'+lvMonth).slice(-2)}-${lvStrDateFrom.slice(-2)} 00:00:00`);
            default:
                lvStrDateFrom = Utils.convIsoToYyyymmddDate(loDateFrom);
                lvYear = Number.parseInt(lvStrDateFrom.slice(0,4)) + lvChange;
                return new Date(`${('0000'+lvYear).slice(-4)}-${lvStrDateFrom.slice(4,6)}-${lvStrDateFrom.slice(-2)} 00:00:00`);
        }
    },

    isDateInPeriod: (pvDate, pvDateFrom, pvDateTo) => {
        if (!pvDate) { return false; }
        if (!(pvDateFrom || pvDateTo)) { return true; } // From & To are empty => The whole period
        if (!pvDateFrom) {
            if (pvDateTo < pvDate) { return false; }
        }
        else if (!pvDateTo) {
            if (pvDateFrom > pvDate) { return false; }
        }
        else if (pvDateTo < pvDate || pvDateFrom > pvDate) { return false; }
        return true;
    },

    convYyyymmddToIsoDate: ( pvDateYyyymmdd ) => {
        if (!pvDateYyyymmdd || pvDateYyyymmdd === "00000000" ) { return undefined; }
        return new Date( `${pvDateYyyymmdd.slice(0,4)}-${pvDateYyyymmdd.slice(4,6)}-${pvDateYyyymmdd.slice(-2)}` ).toISOString();
    },
    convIsoToYyyymmddDate: ( pvDateIso ) => {
        if (!pvDateIso) { return ""; }
        let lvDateIso = pvDateIso;
        if (typeof lvDateIso === "number") { lvDateIso = new Date(lvDateIso); }
        if (lvDateIso instanceof Date) {
            if (isNaN(lvDateIso.getTime())) { return ""; }
            lvDateIso = lvDateIso.toISOString();
        }
        if (typeof lvDateIso !== "string" ) { return ""; }
        return lvDateIso.slice(0,10).replace(/-/g, "");
    },
    increaseChangeCountAllForms: (compoundedForm) => {
        const increaseChangeCountAllElements = ( element ) => {
            if (Array.isArray(element) && element.length) {
                for (let child of element) {
                    increaseChangeCountAllElements(child);
                }
            }
            else {
                element._changeCount = isNaN(element._changeCount) ?0 :element._changeCount+1;
                if (Array.isArray(element.elements) && element.elements.length) {
                    increaseChangeCountAllElements(element.elements);
                }
            }
        }

        for (let singleForm of compoundedForm.setup.forms) {
            if (Array.isArray(singleForm?.setup) && singleForm.setup.length) {
                increaseChangeCountAllElements(singleForm.setup);
            }
        }
    },
    stripEmptyDataFromConfig: (poConfig) => {
        let loStripped = [];
        if (Array.isArray(poConfig) || (typeof poConfig !== "object") || poConfig === null) {
            return poConfig;
        }
        let loKeys = Object.getOwnPropertyNames(poConfig);
        for (let lvKey of loKeys) {
            if (Array.isArray(poConfig[lvKey]) || (typeof poConfig[lvKey] !== "object") || poConfig[lvKey] === null) {
                loStripped.push({key: lvKey, value: poConfig[lvKey]});
            }
            else {
                let loChildStripped = Utils.stripEmptyDataFromConfig(poConfig[lvKey]);
                if (Object.getOwnPropertyNames(loChildStripped).length) {
                    loStripped.push( {key: lvKey, value: loChildStripped} );
                }
            }
        }
        let loReturn = {};
        for (let loPair of loStripped) { loReturn[loPair.key] = loPair.value; }
        return loReturn;
    },

    getFormConfigJSON: () => {
        let loStrippedConfig = cockpitUtils.configSaved;
        try {
            if (modelappData.getData().selectedForm) {
                loStrippedConfig = JSON.stringify(Utils.stripEmptyDataFromConfig(modelappData.getData().selectedForm.config));
            }
        }
        catch (e) {
            console.warn(`@formHasChanged: failed to stringify ${Utils.stripEmptyDataFromConfig(modelappData.getData().selectedForm.config)}`);
        };
        return loStrippedConfig;
    },
    resetHiddenItemRadio: () => {
        let loListSf = Array.isArray(modelappData.getData().formsSingle) ? modelappData.getData().formsSingle: [];
        let loPreviousHiddenRadio = ModelData.Find(loListSf, "existsAlready", true);
        for (let loItem of loPreviousHiddenRadio) { delete loItem.existsAlready; }
        for (let lvSfId of modeloPageDetail.getData().setup.forms) {
            let loItem = ModelData.FindFirst(loListSf, "id", lvSfId);
            if (loItem) {loItem.existsAlready = true;}
        }
        modelappData.refresh();
    },
    updatesFormChangesState: () => {
        Object.assign(modelappControl.getData(), {
            isNew: !modelappData.getData()?.selectedForm?.id,
            hasChanges: cockpitUtils.formHasChanged()
        })
        modelappControl.refresh();
    }
};
