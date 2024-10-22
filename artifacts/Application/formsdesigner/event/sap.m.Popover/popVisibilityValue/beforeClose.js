currentObject.visibleValue = [];

if (listVisibilityValue.getMode() === "MultiSelect") {
    const selectedItems = listVisibilityValue.getSelectedItems();

    selectedItems.forEach((item, index) => {
        const context = item.getBindingContext();
        const data = context.getObject();
        currentObject.visibleValue.push(data.key);
    });
} else {
    const selectedItem = listVisibilityValue.getSelectedItem();

    if (selectedItem) {
        const context = selectedItem.getBindingContext();
        const data = context.getObject();
        currentObject.visibleValue.push(data.key);
    }
}

modelpanTopProperties.refresh(true);
