FORMS.Renderer.onLoad()
    .then(()=>{
        cboxPreviewFormUseRenderer.removeAllItems();
        let renderer = FORMS.Renderer.getDefault();
        cboxPreviewFormUseRenderer.addItem(
            new sap.ui.core.Item({"key": renderer.getId(), "text": renderer.getLabel()}));
        for (let rendererInfo of modelrendererCustomization.getData() ?? []) {
            renderer = FORMS.Renderer.getInstance(rendererInfo.nameSpace, rendererInfo.displayType);
            cboxPreviewFormUseRenderer.addItem(
                new sap.ui.core.Item({"key": renderer.getId(), "text": renderer.getLabel()}));
        }
    })
