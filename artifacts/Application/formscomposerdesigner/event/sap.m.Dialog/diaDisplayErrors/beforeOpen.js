//
// Resets the dialog
modellistDisplayErrors.setData();
this.setTitle(txtDisplayErrorsTitle.getText());
txtDisplayErrorsMessage.setText();
hboxDisplayErrorsActions.destroyItems();
//
// Sets up the dialog based on the options
if (this.OPTIONS) {
    if (this.OPTIONS.title) {this.setTitle(this.OPTIONS.title);}
    if (this.OPTIONS.message) {txtDisplayErrorsMessage.setText(this.OPTIONS.message);}

    if (this.OPTIONS.buildErrorList) {this.OPTIONS.buildErrorList();}

    if (Array.isArray(this.OPTIONS.actions) && this.OPTIONS.actions.length) {
        for (let lvIndex in this.OPTIONS.actions) {
            hboxDisplayErrorsActions.addItem(new sap.m.Button(
                `${hboxDisplayErrorsActions.getId()}-${lvIndex}`,
                {
                    text: this.OPTIONS.actions[lvIndex],
                    tooltip: this.OPTIONS.tooltips[lvIndex],
                    press: this.OPTIONS.pressEvents[lvIndex]
                }
            ))
        }
    }
}