sap.ui.getCore().attachInit(function (startParams) {
    let onLoad = startParams.onLoad ?? (()=>{});
    subscribeFormsRenderer(startParams.FORMS, startParams.rendererInfo, onLoad);
});
