// Tests first to see if the form has an id (safeguard in case the visibility rule malfunctions)
if (!modeloPageDetail.getData().id) {
    controller.clearErrors(C_CONTEXT_PREVIEW_FORM);
    controller.addError(C_CONTEXT_PREVIEW_FORM, {
        id: txtNoIdGenerated.getText(),
        text: txtYourFormMustBeSaved.getText(),
    });
    diaDisplayErrors.OPTIONS = {
        context: C_CONTEXT_PREVIEW_FORM,
        title: txtCompoundedFormPreviewing.getText(),
        message: txtErrorsFoundCompoundedFormPreviewing.getText(),
        buildErrorList: () => {
            modellistDisplayErrors.setData(controller.getErrors(C_CONTEXT_PREVIEW_FORM));
        },
        actions: [txtCloseButton.getText()],
        tooltips: [txtCloseTooltip.getText()],
        pressEvents: [
            /* Close */ () => {
                diaDisplayErrors.close();
            },
        ],
    };
    diaDisplayErrors.open();
    return;
}

//
// First collects the full data of the form. If the form is found and contains data then it shows form
// Otherwise a pop-up warning appears stating that there is nothing to show and the reason:
// - the form was not found (make sure it was saved)
// - the form does not have visible sections
oApp.setBusy(true);
apiGetViewReadyForm({
    parameters: {
        id_form: modeloPageDetail.getData().id,
        retrieve_all: true,
    },
})
    .then((poResult, pvState, poXhr) => {
        controller.clearErrors(C_CONTEXT_PREVIEW_FORM);
        if (Array.isArray(poResult) && poResult.length) {
            modeldiaPreviewResult.setData(poResult[0]);
            let loTimeBefore = new Date().getTime();

            // Clear the data from all renderer repositories (data clean slate)
            FORMS.Renderer.clearAllRepositories();

            modeldiaPreviewResult.refresh();
            let loResult = modeldiaPreviewResult.getData();
            let _resultConfig = typeof loResult.config === "object" ? loResult.config : JSON.parse(loResult.config);
            const config = {
                wizardPagination: _resultConfig.wizardPagination,
                renderers: _resultConfig.renderers,
                setup: typeof loResult.setup === "object" ? loResult.setup : JSON.parse(loResult.setup),
            };

            let renderer = (cboxPreviewFormUseRenderer && cboxPreviewFormUseRenderer.getSelectedItem) 
                ? FORMS.Renderer.getInstanceById(cboxPreviewFormUseRenderer.getSelectedItem()?.getKey())
                : null;
            if (!renderer) {renderer = FORMS.Renderer.getDefault()}
            FORMS.build(pagePreviewForm, {
                data: [], 
                // MOD begin
                // displayType: modelappControl.getData()?.enableWizardPreview ? FORMS.DISPLAY_TYPE.WIZARD : FORMS.DISPLAY_TYPE.FORMS,
                // MOD ---
                renderer: renderer.action.getMatchingData(),
                // MOD end
                config: config, // { setup: JSON.parse(poResult[0].setup) }
            });
            let loTimeAfter = new Date().getTime();
            console.log(`Time spent building form: ${loTimeAfter - loTimeBefore}ms`);
            new Promise((r) => r()).then(() => {
                oApp.setBusy(false);
                diaPreviewForm.open();
            });
        } else {
            oApp.setBusy(false);
            controller.addError(C_CONTEXT_PREVIEW_FORM, {
                id: modeloPageDetail.getData().id,
                text: txtCompoundedFormNotFound.getText(),
            });
            diaDisplayErrors.OPTIONS = {
                context: C_CONTEXT_PREVIEW_FORM,
                title: txtCompoundedFormPreviewing.getText(),
                message: txtErrorsFoundCompoundedFormPreviewing.getText(),
                buildErrorList: () => {
                    modellistDisplayErrors.setData(controller.getErrors(C_CONTEXT_PREVIEW_FORM));
                },
                actions: [txtCloseButton.getText()],
                tooltips: [txtCloseTooltip.getText()],
                pressEvents: [
                    /* Close */ () => {
                        diaDisplayErrors.close();
                    },
                ],
            };
            diaDisplayErrors.open();
        }
        // console.info("then:", poResult);
    })
    .catch((poXhr, pvState) => {
        oApp.setBusy(false);
        // console.info("catch:", poXhr);
    });
