// #70 - 1.1./1.2./1.3. - Begin
getFieldList = function (configSetup, baseId, baseType) {
    if (!Array.isArray(configSetup)) { return []; };
    return configSetup.reduce((list, element) => {
        if (element.id === baseId) { return list; }
        if (element.disabled) { return list; }
        switch( baseType ) {
            case "Calc":
            case "AngleCalc":
                if (["Numeric", "Calc", "AngleCalc"].includes(element.type)) { list.push(element); }
                break;
            default:
                if (element.type === baseType) { list.push(element); }
        }
        if (Array.isArray(element.elements)) {
            const childList = getFieldList(element.elements, baseId, baseType);
            if (childList.length) { list.splice(list.length, 0, ...childList); }
        }
        return list;
    }, []);
}

const id = this.data("fieldId");
const type = this.data("fieldType");
if (!type) {
    modellistNumSelect.setData([]);
}
else {
    const fieldList = getFieldList(modeloPageDetail.getData().setup, id, type);
    modellistNumSelect.setData(fieldList);
}
// // let fieldList = modellistVisibility.getData(); // #18 KM
// let fieldList = modeloPageDetail.getData().setup.reduce((list, section) => {
//     const getNumericOrCalc = (element) => {
//         const list = [];
//         if (["Numeric","Calc","AngleCalc"].includes(element.type) && !element.disabled) { // #70 - 1.1.
//         // if (["Numeric","Calc"].includes(element.type) && !element.disabled) {
//             list.push({id: element.id});
//         }
//         return (element.elements) ? list.concat(...element.elements.map(element => getNumericOrCalc(element))) : list;
//     }
//     return list.concat(...section.elements.map(element => getNumericOrCalc(element)));
// }, []);
// var elementList = [{id: "", title: ""}];

// let fieldType = "Numeric";
// let attr = diaNumSelect.getCustomData().find((item) => item.getKey() === "fieldType");
// if (typeof attr !== "undefined") fieldType = attr.getValue();

// fieldList.forEach((item) => {
//     let element = FORMS.getElementFromId(item.id);
//     if (element.type === fieldType) elementList.push(element);
//     if (fieldType === "Numeric" && element.type === "Calc") elementList.push(element);
//     if (fieldType === "Numeric" && element.type === "AngleCalc") elementList.push(element); // #70 - 1.1.
// });

// modellistNumSelect.setData(elementList);
// #70 - 1.1./1.2./1.3. - End

// Sorting
const oSorter2 = new sap.ui.model.Sorter("index", false, false);
const oSorter1 = new sap.ui.model.Sorter("parent", false, true);
const binding = listVisibility.getBinding("items");
binding.sort([oSorter1, oSorter2]);
