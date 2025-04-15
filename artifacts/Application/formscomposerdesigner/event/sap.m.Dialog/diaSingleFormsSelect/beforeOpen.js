// Resets the dialog
Utils.resetHiddenItemRadio();
listSingleSelectForm.removeSelections();
selSingleSelectFormGroup.setSelectedKey(modeloPageDetail.getData().groupid);
let loBindings = listSingleSelectForm.getBinding("items");
loBindings.filter(new sap.ui.model.Filter("groupid", "EQ", modeloPageDetail.getData().groupid));
butSingleSelectFormAdd.setEnabled( false );
