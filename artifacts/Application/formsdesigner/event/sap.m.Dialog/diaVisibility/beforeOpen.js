// Sorting
const getGroupHeader = function (oGroup){
    // This is necessary to separate sections that might have the same name during design time
    return new sap.m.GroupHeaderListItem({
        title: oGroup.key.split("|")[1]
    });
}
const newTemplate = listVisibility.getBindingInfo("items").template.clone();
listVisibility.bindItems({
    path: '/',
    template: newTemplate,
    groupHeaderFactory: getGroupHeader,
    templateShareable: false
});

const oSorter2 = new sap.ui.model.Sorter("index", false, false);
const oSorter1 = new sap.ui.model.Sorter("parentId", false, true);
const binding = listVisibility.getBinding("items");
binding.sort([oSorter1, oSorter2]);
