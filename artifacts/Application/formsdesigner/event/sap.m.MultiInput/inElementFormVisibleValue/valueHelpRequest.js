const context = oEvent.oSource.getBindingContext();
currentObject = context.getObject();

const values = [];

// Get VisibleField
const visibleField = controller.getObjectFromId(currentObject.visibleFieldName);

switch (visibleField.type) {
    case "Switch":
    case "CheckBox":
        values.push({ key: "false", text: "False" });
        values.push({ key: "true", text: "True" });
        break;

    case "Input":
    case "TextArea":
        values.push({ key: "empty", text: "Empty" });
        break;

    default:
        if (visibleField.items) {
            visibleField.items.forEach(function (item, i) {
                values.push({ key: item.key, text: item.title });
            });
        }
        break;
}

// Selection Mode
switch (visibleField.type) {
    case "MultipleChoice":
    case "MultipleSelect":
        listVisibilityValue.setMode("MultiSelect");
        break;

    default:
        listVisibilityValue.setMode("SingleSelectMaster");
        break;
}

// Mark Selected Values
values.forEach(function (item) {
    if (currentObject.visibleValue.includes(item.key)) {
        item.selected = true;
    }
});

modellistVisibilityValue.setData(values);

popVisibilityValue.openBy(this);
