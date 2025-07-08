sap.ui.getCore().attachInit(function (startParams) {
    let onLoad = startParams.onLoad ?? (()=>{});
    // @ts-ignore
    Cfg.FORMS = startParams.FORMS;
    subscribeFormsRenderer(startParams.FORMS, startParams.rendererInfo, onLoad);
});
