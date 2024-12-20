if (modelappControl.getData().enableEdit) {
    
    modelpanTopProperties.oData.infobuttonTitle     = inDiaInfoButtonTitle.getValue();
    modelpanTopProperties.oData.infobuttonText      = txtareaDiaInfoButtonText.getValue();
    modelpanTopProperties.oData.infobuttonImageSrc  = imageElementDiaInfoButtonImage.getSrc();
    modelpanTopProperties.oData.hasInfoButton       = controller.elementHasInfoButton(modelpanTopProperties.oData);
    modelpanTopProperties.refresh();
    controller.imageTarget                          = null;
}

diaInfoButton.close();