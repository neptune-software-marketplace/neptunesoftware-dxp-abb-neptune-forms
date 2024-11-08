let fieldList = modellistVisibility.getData();
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
