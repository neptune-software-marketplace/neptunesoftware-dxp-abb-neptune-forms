let bSelected = oEvent.getParameter("selected");
let items     = oEvent.getSource().getParent().getModel().getData().items;

// Adding an N/A option to the single choice items
if (bSelected) {
    if (items && Array.isArray(items)) {
        items = items.splice(0,0,{
            id: ModelData.genID(),
            key: "NA_option",
            option: "I",
            title: "N/A",
            disabledKeyField: true,
        });
    }

// Removing the N/A option from the single choice items
} else {
    let iEmptyOption = items.findIndex(o => o.disabledKeyField);
    if (iEmptyOption >= 0) {
        items = items.splice(iEmptyOption, 1);
    }
}