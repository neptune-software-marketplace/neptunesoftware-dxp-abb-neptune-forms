diaPreviewForm.setBusy(true);
(new Promise(r=>r())).then(() => {
    let loResult = modeldiaPreviewResult.getData();

    if (!loResult) { 
        diaPreviewForm.setBusy(false);
        return; 
    }

    let resultConfig = (typeof loResult.config === "object") ? loResult.config : JSON.parse(loResult.config);
    FORMS.build(pagePreviewForm, {
        data: [], 
        // MOD begin
        // displayType: modelappControl.getData()?.enableWizardPreview ? FORMS.DISPLAY_TYPE.WIZARD : FORMS.DISPLAY_TYPE.FORMS,
        // MOD ---
        renderer: modelappControl.getData()?.enableWizardPreview 
            ? FORMS.Renderer.getInstance(FORMS.NAMESPACE.NEPTUNE, FORMS.RENDERER.FREE_STEP_WIZARD).action.getMatchingData()
            : FORMS.Renderer.getInstance(FORMS.NAMESPACE.NEPTUNE, FORMS.RENDERER.STANDARD).action.getMatchingData(),
        // MOD end
        config: { 
            renderers: resultConfig?.renderers ?? {},
            wizardPagination: resultConfig.wizardPagination,
            setup: (typeof loResult.setup === "object") ? loResult.setup : JSON.parse(loResult.setup) 
        }
    });
    diaPreviewForm.setBusy(false);
});