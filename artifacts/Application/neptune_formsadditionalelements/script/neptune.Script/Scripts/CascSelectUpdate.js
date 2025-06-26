function informationFieldChanged(oEvent) {

    console.log('Change Event');
    oEvent.getSource().detachAfterClose(informationFieldChanged);

}