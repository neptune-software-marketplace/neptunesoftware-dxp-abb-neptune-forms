// The following parameters are available via oEvent.getParameter("parameterName"); 
// 
// selectedItem - sap.ui.core.Item
// previousSelectedItem - sap.ui.core.Item
// 

console.log("Dropdown change event fired");

// Use the parameter from the event instead of this.getSelectedIndex()
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
console.log("Total items:", allItems.length);

// ADD THESE DEBUG LOGS:
console.log("selectedIndex > 0:", selectedIndex > 0);
console.log("selectedIndex < allItems.length - 1:", selectedIndex < (allItems.length - 1));
console.log("allItems.length - 1 =", allItems.length - 1);

// Only update button states if this was a manual selection (not from button press)
// We can detect this by checking if the event has the right parameters
if (selectedIndex >= 0) {
    const previousEnabled = selectedIndex > 0;
    const nextEnabled = selectedIndex < allItems.length - 1;

    console.log("Previous enabled:", previousEnabled);
    console.log("Next enabled:", nextEnabled);

    if (modelCcControl) {
        modelCcControl.setData({
            previousEnabled,
            nextEnabled,
        });
        console.log("modelCcControl data after update:", modelCcControl.getData());
    } else {
        console.error("modelCcControl is not defined");
    }
}

// scrollToSection(this.getSelectedItem().getText(), true);
scrollToSection(selectedItem.getText(), true, selectedIndex);