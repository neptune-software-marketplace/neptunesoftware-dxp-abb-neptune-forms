const allowedTypesString = oEvent.getSource().getFileType().join(", ");
sap.m.MessageBox.warning(
    "The file type is not supported.\nPlease choose a file of one of the following file types:\n\n" + allowedTypesString
);