function subscribeFormsRenderer(FORMS: any, rendererInfo: object, onLoad: Function) {
    FORMS.RENDERER.FREE_STEP_WIZARD = "freeStepWizard";
    // @ts-ignore
    FORMS.Renderer.subscribe(
        new FormRenderer(
            FORMS.NAMESPACE.NEPTUNE, 
            FORMS.RENDERER.FREE_STEP_WIZARD,
            rendererInfo,
            i18nLabel.getText(),
            i18nDescription.getText(), 
            {
                getData: () => {
                    let {displayType, nameSpace} = FORMS.Renderer.selected();
                    return {renderer: {displayType, nameSpace}};
                    // let repository = FORMS.Renderer.getRepository(FORMS.Renderer.selected());
                    // let {rendererDisplayType, rendererNameSpace} = repository;
                    // return {rendererDisplayType, rendererNameSpace};
                },
                prepareData: (options, repository) => {
                    type GenericObject = { [k:string]: any };
                    const fnCollectAllSections = function(options) {
                        // This will only be called if no sections were specified (or found) for pagination
                        // in which case, each section is a step on the wizard
                        let loCollection = [];
                        let loSections = options?.config?.setup || []

                        const isNumeric = function(nbr) {
                            return !isNaN(parseFloat(nbr)) && isFinite(nbr);
                        };

                        for (let lvSectionNdx in loSections) {
                            loCollection.push({
                                breakId: loSections[lvSectionNdx].id, 
                                crumbName: isNumeric(lvSectionNdx) ? (parseFloat(lvSectionNdx)+1).toString() : `${lvSectionNdx+1}`, 
                                tabName: loSections[lvSectionNdx].title
                            });
                        }
                        return loCollection;
                    }
                    let loWizardData = [];
                    // @ts-ignore
                    let optionsConfig:GenericObject = options?.config ?? {};
                    let rendererConfig:GenericObject = optionsConfig?.renderers?.[repository.renderer.getComposerId()];
                    if (Array.isArray(rendererConfig) && rendererConfig.length) {
                        let loSections = optionsConfig?.setup;
                        if (!Array.isArray(loSections) && loSections.length) { 
                            repository.config = fnCollectAllSections(options); 
                            return;
                        }

                        for (let loBreakData of rendererConfig) {
                            let loSectionFound:any = ModelData.FindFirst(loSections, "id", loBreakData.id);
                            if (loSectionFound) {
                                let loNormalizedRecord = Object.assign({breakId: loBreakData.id}, loBreakData);
                                if ((typeof loNormalizedRecord.crumbName !== "string") || !loNormalizedRecord.crumbName) {
                                    loNormalizedRecord.crumbName = String(loWizardData.length+1);
                                }
                                if ((typeof loNormalizedRecord.tabName !== "string") || !loNormalizedRecord.tabName) {
                                    loNormalizedRecord.tabName = loSectionFound.title;
                                }
                                loWizardData.push(loNormalizedRecord);
                            }
                        }
                    }
                    if (!loWizardData.length) {
                        loWizardData = fnCollectAllSections(options);
                    }
                    // @ts-ignore
                    else if (loWizardData[0].breakId !== options.config.setup[0].id) {
                        // The first section is not a step. It inserts one with default values
                        // @ts-ignore
                        let loSection = options.config.setup[0];
                        loWizardData.splice(0, 0, {"breakId": loSection.id, "crumbName": '1', "tabName": loSection.title});
                    }
                    repository.config = loWizardData;
                },
                bundleRenderedData: () => {},
                applyStyles: (uiElement) => {},
                clearStyles: (uiElement) => {},
                buildObjectsAndEvents: (parent, options, repository) => {
                    repository.head = new sap.m.IconTabBar({
                        expandable:false,
                        busyIndicatorDelay:0,
                        select: oEvent => {
                            let {renderer} = repository;
                            let wizardStep:any = oEvent.getParameter("item");
                            if ((!wizardStep._rendered) && Array.isArray(wizardStep._sections) && wizardStep._sections.length) {
                                if (repository.initialization) {return;}
                                for (let section of wizardStep._sections) {
                                    let sectionParent = renderer.action.addToParentFromSection(wizardStep, section.section);
                                    renderer.action.completeStepBuildOnRendering(sectionParent, section.section, section.index);
                                    // loScrollContainer.addContent(section); // (already inside "addToParentFromSection")
                                    if (FORMS.revalidate) FORMS.validate("");
                                }
                                delete(wizardStep._sections);
                            }
                            if (!repository.initialization) {repository.lastSelected = wizardStep;}
                        },
                        tabsOverflowMode: sap.m.TabsOverflowMode.StartAndEnd // "StartAndEnd"
                    });
                    
                    // // TODO: Review the style class
                    // //		 maybe switch with repository.class.WIZARD_HEAD
                    // repository.head.addStyleClass(FORMS.STYLE_CLASS.WIZARD_HEAD);

                    repository.initialization = true;
                    parent.addContent(repository.head);
                    
                },
                getMatchingData: () => {return {
                    displayType: FORMS.RENDERER.FREE_STEP_WIZARD,
                    nameSpace: FORMS.NAMESPACE.NEPTUNE
                };},
                // @ts-ignore
                foundMatchingData: (options: any, renderer: FormRenderer) => {
                    return ((options.renderer?.displayType === renderer.displayType) 
                            && 
                            ((options.renderer?.nameSpace ?? renderer.nameSpace) === renderer.nameSpace));
                },
                processSection: (section, index, repository, selectedRenderer) => {
                    if (!section) return;
                    if (section.disabled) return;
                    
                    let breakSection = repository.config.find(step => step.breakId === section.id);
                    if (breakSection || (!repository.lastStep)) {
                        // If the very first section is not a step, then it becomes a step
                        repository.lastStep = selectedRenderer.action.appendNewStep(
                            section,
                            index,
                            breakSection,
                            repository
                        );
                    }
                    else {
                        selectedRenderer.action.appendToStep(
                            section,
                            index,
                            repository
                        );
                    }
                },
                // @ts-ignore
                executeFirstRendering: (repository:TyRendererRepository, selectedRenderer:FormRenderer) => {
                    let eventDelegation = {
                        "onAfterRendering": () => {
                            (new Promise(r=>r(true))).then(()=>{
                                repository.initialization = false;
                                // Always renders the lastStep first (if it exists) 
                                // otherwise renders the first IconTabFilter (first step)
                                let {head, lastSelected} = repository;
                                let toRenderStep = lastSelected
                                    ? head.getItems().find(step => step.getKey() === lastSelected.getKey()) ?? head._firstStep
                                    : head._firstStep;
                                head.setSelectedKey(toRenderStep.getKey());
                                head.fireSelect({
                                    item: toRenderStep,
                                    selectedItem: toRenderStep,
                                    key: toRenderStep._stepIndex,
                                    previousKey: toRenderStep._stepIndex,
                                    selectedKey: toRenderStep._stepIndex
                                });
                                FORMS.formParent.removeEventDelegate(eventDelegation); // Removes this delegation
                            });
                        }
                    }
                    
                    FORMS.formParent.addEventDelegate(eventDelegation, this);
                },
                applyValidationStyle(source, sectionId, value, repository) {
                    /*
                    // CSS TO ADD - found in layout of the launchpad
                    .sapMITBFilterWrapper .sapMITBFilterIcon.wizardHeaderErrorTab {
                        border: 2px solid #D2122E;
                    }
                    */
                    switch(source) {
                        case "validateSectionHeader":
                            if (repository.config && Array.isArray(repository.config)) {
                                let indexStep = repository.config.findIndex(step => step.breakId === sectionId);
                                if (indexStep >= 0) {
                                    let imageControl = repository.head.getItems()[indexStep]._oImageControl;
                                    try {
                                        if (value) {
                                            imageControl.addStyleClass("wizardHeaderErrorTab");
                                        }
                                        else {
                                            imageControl.removeStyleClass("wizardHeaderErrorTab");
                                        }
                                    } catch(e) {}
                                }
                            }
                            break;
                    }
                },
                /*
                    AUXILIARY METHODS
                */
                appendNewStep: (section, index, breakSection, repository) => {
                    let {renderer} = repository;
                    let icon = renderer.action.buildIconFrom(breakSection.crumbName);
                    let wizardStep:any = new sap.m.IconTabFilter({
                        "text": breakSection.tabName,
                        "key": `Step${index}`,
                        "icon": icon, 
                        design: sap.m.IconTabFilterDesign.Horizontal, // "Horizontal",
                        "visible": FORMS.buildVisibleCond(section)
                    });
                    wizardStep._stepIndex = wizardStep.getKey();
                    wizardStep._rendered = false;
                    wizardStep._sections = [{section, index}];
                    if (!repository.head._firstStep) {
                        repository.head._firstStep = wizardStep;
                    }
                    repository.head.addItem(wizardStep);
                    return wizardStep;
                },
                appendToStep: (section, index, repository) => {
                    repository.lastStep._sections.push({section, index});
                    return repository.lastStep
                },
                completeStepBuildOnRendering: (sectionParent, section, index) => {
                    // Elements
                    section.elements.forEach(function (element, elIndex) {
                        FORMS.buildElement(sectionParent, element, section, elIndex);

                        if (element.elements) {
                            element.elements.forEach(function (subElement, subElIndex) {
                                if (subElement) {
                                    FORMS.buildElement(sectionParent, subElement, section, subElIndex);
                                }
                            });
                        }
                    });

                    // Post processing (From FORMS script)
                    let {options} = FORMS.Renderer.getRepository(FORMS.Renderer.selected());
                    switch (section.type) {
                        case "Table":
                            const tabModel = new sap.ui.model.json.JSONModel();
                            let modelData = [];

                            sectionParent.setModel(tabModel);

                            const bindingField = section.fieldName ? section.fieldName : section.id;
                            if (options.data && options.data[bindingField] && options.data[bindingField].length) {
                                // KW addition (add init. sort value) // 28.11.2023
                                var i: any = 0;
                                for (const bv of options.data[bindingField]) {
                                    bv.initsort = ++i;
                                }
                                modelData = options.data[bindingField];
                            } else {
                                let rows = section.rows || 1;

                                for (let i = 0; i < rows; i++) {
                                    modelData.push(FORMS.buildRowTemplate(section.elements));
                                }
                            }

                            // Row Number
                            if (section.enableRowNumber) FORMS.tableAddRowNumber(modelData);

                            // Pagination
                            if (section.enablePagination) {
                                FORMS.paginationSetup[section.id] = {
                                    take: section.paginationTake || 2,
                                    index: 0,
                                    count: 0,
                                    filter: "",
                                    sortOrder: "Ascending",
                                    sortField: "",
                                    data: modelData,
                                };

                                FORMS.paginationHandle(section);
                            } else {
                                tabModel.setData(modelData);
                            }

                            sectionParent.bindAggregation("items", { path: "/", template: FORMS.columnTemplate, templateShareable: false });
                            // AR Table post processing // #18 KM
                            FORMS.tablePostProcessing(section, 0, section.rows); // #18 KM
                            break;
                    }
                },

                addToParentFromSection: (parent, section) => {
                    let sectionParent: sap.ui.core.Element;
                    switch (section?.type) {
                        case "Form":
                            FORMS.bindingPath = "/";
                            sectionParent = FORMS.buildParentForm(parent, section);
                            break;
                        case "Table":
                            FORMS.bindingPath = "";
                            sectionParent = FORMS.buildParentTable(parent, section); 
                            break;
                    }
                    return sectionParent;
                },
                buildIconFrom: (iconSource: string) => {
                    const REGEXP = /(?:sap-icon|http(?:s?)|data|blob):\/\/.*/gm;
                    if (REGEXP.exec(iconSource)) { return iconSource; }
                    //
                    // It seems that the source is not a URI, so attempts to convert the text into an image
                    let canvas = document.createElement("canvas");
                    canvas.width = 44;
                    canvas.height = 44;
                    let ctx2D = canvas.getContext("2d");
                    ctx2D.font = "12pt Calibri";
                    let width = ctx2D.measureText(iconSource).width;
                    // let width = Number.parseInt(ctx2D.measureText(iconSource).width);
                    let offsetW = ~~((canvas.width-width)/2);
                    let cssStyles = getComputedStyle(document.body)
                    ctx2D.fillStyle = cssStyles.getPropertyValue('--sapTextColor');
                    ctx2D.fillText(iconSource, offsetW, 27);
                    return canvas.toDataURL();
                },
            }
        )
    );
    // Necessary to fulfill the FORMS.Renderer.onLoad() promise
    onLoad();
}