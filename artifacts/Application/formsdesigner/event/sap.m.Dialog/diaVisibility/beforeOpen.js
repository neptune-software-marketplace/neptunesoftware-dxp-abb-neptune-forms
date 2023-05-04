// Sorting
const oSorter2 = new sap.ui.model.Sorter("index", false, false);
const oSorter1 = new sap.ui.model.Sorter("parent", false, true);
const binding = listVisibility.getBinding("items");
binding.sort([oSorter1, oSorter2]);
