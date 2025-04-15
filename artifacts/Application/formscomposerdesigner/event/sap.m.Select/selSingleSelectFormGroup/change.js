let loBindings = listSingleSelectForm.getBinding("items");
if (selSingleSelectFormGroup.getSelectedKey()) {
    loBindings.filter(new sap.ui.model.Filter("groupid", "EQ", selSingleSelectFormGroup.getSelectedKey()));
}
else {
    loBindings.filter();
}
