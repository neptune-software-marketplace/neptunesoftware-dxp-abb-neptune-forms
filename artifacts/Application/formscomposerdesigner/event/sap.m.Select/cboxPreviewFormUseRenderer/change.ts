// The following parameters are available via oEvent.getParameter("parameterName"); 
// 
// selectedItem - sap.ui.core.Item
// previousSelectedItem - sap.ui.core.Item
// 

diaPreviewForm.setBusy(true);
(new Promise(r=>r())).then(() => {
    let loResult = modeldiaPreviewResult.getData();

    if (!loResult) { 
        diaPreviewForm.setBusy(false);
        return; 
    }
    // @ts-ignore
    let selectedItem:sap.ui.core.Item = oEvent.getParameter("selectedItem");
    let renderer = FORMS.Renderer.getInstanceById(selectedItem.getKey());
    if (!renderer) {renderer = FORMS.Renderer.getDefault()}
    let resultConfig = (typeof loResult.config === "object") ? loResult.config : JSON.parse(loResult.config);
    FORMS.build(pagePreviewForm, {
        data: [], 
        // MOD begin
        // displayType: modelappControl.getData()?.enableWizardPreview ? FORMS.DISPLAY_TYPE.WIZARD : FORMS.DISPLAY_TYPE.FORMS,
        // MOD ---
        renderer: renderer.action.getMatchingData(),
        // MOD end
        config: { 
            renderers: resultConfig?.renderers ?? {},
            wizardPagination: resultConfig.wizardPagination,
            setup: (typeof loResult.setup === "object") ? loResult.setup : JSON.parse(loResult.setup) 
        }
    });
    diaPreviewForm.setBusy(false);
});