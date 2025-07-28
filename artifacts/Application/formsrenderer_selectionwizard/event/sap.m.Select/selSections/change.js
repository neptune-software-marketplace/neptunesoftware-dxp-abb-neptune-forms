// The following parameters are available via oEvent.getParameter("parameterName"); 
// 
// selectedItem - sap.ui.core.Item
// previousSelectedItem - sap.ui.core.Item
// 

console.log("Dropdown change event fired");

const selectedItem = oEvent.getParameter("selectedItem");
const allItems = this.getItems();

// Find the index of the selected item
let selectedIndex = -1;
for (let i = 0; i < allItems.length; i++) {
    if (allItems[i] === selectedItem) {
        selectedIndex = i;
        break;
    }
}

console.log("Selected index from drop down:", selectedIndex);

// UPDATE THE SHARED VARIABLE
currentSectionIndex = selectedIndex;

console.log("Total items:", allItems.length);

if (selectedIndex >= 0) {
    const previousEnabled = selectedIndex > 0;
    const nextEnabled = selectedIndex < allItems.length - 1;

    console.log("Previous enabled:", previousEnabled);
    console.log("Next enabled:", nextEnabled);

    if (modelpnlNavigation) {
        modelpnlNavigation.setData({
            previousEnabled,
            nextEnabled,
        });
        console.log("modelpnlNavigation data after update:", modelpnlNavigation.getData());
    } else {
        console.error("modelpnlNavigation is not defined");
    }
}

scrollToSection(selectedItem.getText(), true, selectedIndex);