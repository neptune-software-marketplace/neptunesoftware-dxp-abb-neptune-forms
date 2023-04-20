if (this.getState()) {
    controller.enableMarker = true;

    if (modelpanTopProperties.oData && modelpanTopProperties.oData.id) {
        controller.selectObjectFromId(modelpanTopProperties.oData.id);
    }
} else {
    controller.enableMarker = false;

    if (controller.markedElement.elemDom) {
        controller.markedElement.elemDom.classList.remove("previewMarked");
        controller.markedElement.elemDom = null;
        controller.markedElement.elemId = null;
    }
}
