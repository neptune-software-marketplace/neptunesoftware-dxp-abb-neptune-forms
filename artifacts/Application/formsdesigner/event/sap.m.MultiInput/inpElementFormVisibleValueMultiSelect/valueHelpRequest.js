const context = oEvent.oSource.getBindingContext();
currentObject = context.getObject();

const values = [];

// Get VisibleField
const visibleField = controller.getObjectFromId(currentObject.visibleFieldName);

const fieldKey = (["CheckList"].includes(visibleField.type)) ? "id" : "key";
const fieldText = (["CheckList"].includes(visibleField.type)) ? "question" : "title";
if (visibleField.items) {
    visibleField.items.forEach(function (item, i) {
        values.push({ key: item[fieldKey], text: item[fieldText] });
    });
}
// Selection Mode
switch (visibleField.type) {
    case "MultipleChoice":
    case "MultipleSelect":
        listVisibilityValue.setMode("MultiSelect");
        break;

    default:
        if (currentObject.visibleCondition === FORMS.CONDITION_OPERATOR.CONTAINS_ANY.key) {
            listVisibilityValue.setMode("MultiSelect");
        }
        else {
            listVisibilityValue.setMode("SingleSelectMaster");
        }
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
