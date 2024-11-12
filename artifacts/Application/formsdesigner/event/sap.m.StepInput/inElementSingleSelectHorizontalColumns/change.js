let val = oEvent.getParameter("value");
if (!val || val < 1) {
    sap.m.MessageToast.show("The value can not be less than 1.");
    oEvent.getSource().setValue(1);
}