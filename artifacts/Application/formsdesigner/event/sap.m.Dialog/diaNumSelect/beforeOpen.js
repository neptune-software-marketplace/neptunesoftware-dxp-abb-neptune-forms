// let fieldList = modellistVisibility.getData(); // #18 KM
let fieldList = modeloPageDetail.getData().setup.reduce((list, section) => {
    const getNumericOrCalc = (element) => {
        const list = [];
        if (["Numeric","Calc"].includes(element.type) && !element.disabled) {
            list.push({id: element.id});
        }
        return (element.elements) ? list.concat(...element.elements.map(element => getNumericOrCalc(element))) : list;
    }
    return list.concat(...section.elements.map(element => getNumericOrCalc(element)));
}, []);
var elementList = [{id: "", title: ""}];

let fieldType = "Numeric";
let attr = diaNumSelect.getCustomData().find((item) => item.getKey() === "fieldType");
if (typeof attr !== "undefined") fieldType = attr.getValue();

fieldList.forEach((item) => {
    let element = FORMS.getElementFromId(item.id);
    if (element.type === fieldType) elementList.push(element);
    if (fieldType === "Numeric" && element.type === "Calc") elementList.push(element);
});

modellistNumSelect.setData(elementList);

// Sorting
const oSorter2 = new sap.ui.model.Sorter("index", false, false);
const oSorter1 = new sap.ui.model.Sorter("parent", false, true);
const binding = listVisibility.getBinding("items");
binding.sort([oSorter1, oSorter2]);
