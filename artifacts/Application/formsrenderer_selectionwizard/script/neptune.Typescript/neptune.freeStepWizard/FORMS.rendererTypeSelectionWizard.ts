function subscribeFormsRenderer(FORMS: any, rendererInfo: object, onLoad: Function) {
    FORMS.RENDERER.SELECT_WIZARD = "selectWizard";
    // @ts-ignore
    FORMS.Renderer.subscribe(
        new FormRenderer(
            FORMS.NAMESPACE.NEPTUNE,
            FORMS.RENDERER.SELECT_WIZARD,
            rendererInfo,
            i18nLabel.getText(),
            i18nDescription.getText(),
            {
                getData: () => {},
                prepareData: (options, repository) => {
                    const copyOfFormTop = formTop.clone();
                    for (let element of copyOfFormTop.getContent()) {
                        FORMS.formParent.addContent(element);
                        FORMS.scrollParent = element; // last element is pageEndScrollContainer
                    }
                    // const copyOfFormTop = formTop.clone();
                    // copyOfFormTop.setModel(FORMS.formParent.getModel());
                    // for (let element of FORMS.formParent.getContent()) {
                    //     copyOfFormTop.addContent(element);
                    // }
                    // const formContainer = FORMS.formParent.getParent();
                    // formContainer.removeContent(FORMS.formParent);
                    // FORMS.formParent = copyOfFormTop;
                    // formContainer.addContent(FORMS.formParent);
                    // pageEndScrollContainer.destroyContent();
                    // FORMS.scrollParent = pageEndScrollContainer;
                },
                bundleRenderedData: () => {},
                applyStyles: (uiElement) => {},
                clearStyles: (uiElement) => {},
                buildObjectsAndEvents: (parent, options, repository) => {},
                getMatchingData: () => {
                    return {
                        displayType: FORMS.RENDERER.SELECT_WIZARD,
                        nameSpace: FORMS.NAMESPACE.NEPTUNE,
                    };
                },
                foundMatchingData: (options: any, renderer: FormRenderer) => {
                    return (
                        options.renderer?.displayType === renderer.displayType &&
                        (options.renderer?.nameSpace ?? renderer.nameSpace) === renderer.nameSpace
                    );
                },
                processSection: (section, index, repository, selectedRenderer) => {
                    if (!section) return;
                    if (section.disabled) return;
                    let sectionParent;
                    switch (section.type) {
                        case "Form":
                            FORMS.bindingPath = "/";
                            sectionParent = FORMS.buildParentForm(FORMS.scrollParent, section);
                            break;

                        case "Table":
                            FORMS.bindingPath = "";
                            delete section.origMode; // this attribute saves the delete or multiselect mode when the dynamic editability is being set (see fn setFormEditable)
                            sectionParent = FORMS.buildParentTable(FORMS.scrollParent, section);
                            break;
                    }

                    // Elements
                    section.elements.forEach(function (element, i) {
                        FORMS.buildElement(sectionParent, element, section, i);

                        if (element.elements) {
                            element.elements.forEach(function (subElement, iSub) {
                                if (subElement) {
                                    FORMS.buildElement(sectionParent, subElement, section, iSub);
                                }
                            });
                        }
                    });

                    // Post processing
                    let options = repository.options;
                    switch (section.type) {
                        case "Table":
                            const tabModel = new sap.ui.model.json.JSONModel();
                            let modelData = [];

                            sectionParent.setModel(tabModel);

                            const bindingField = section.fieldName ? section.fieldName : section.id;
                            if (
                                options.data &&
                                options.data[bindingField] &&
                                options.data[bindingField].length
                            ) {
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

                            sectionParent.bindAggregation("items", {
                                path: "/",
                                template: FORMS.columnTemplate,
                                templateShareable: false,
                            });
                            // AR Table post processing // #18 KM
                            FORMS.tablePostProcessing(section, 0, section.rows); // #18 KM
                            break;
                    }
                },
                executeFirstRendering: function () {
                    const options = FORMS.getData();
                    this.populateSections(options.config);
                },
                applyValidationStyle: () => {},
                /*
                    INSERT AUXILIARY METHODS BELOW
                */
                populateSections: function (config) {
                    var data = [];
                    var i = 0;

                    if (typeof config.setup == "object") {
                        for (const st of config.setup) {
                            if (st.title) {
                                data.push({ key: st.key, section: st.title });
                                if (!i) {
                                    selSections.setSelectedKey(st.key);
                                    // @ts-ignore
                                    expandFormSection(st.title, true);
                                    // @ts-ignore
                                    currentSectionIndex = 0;
                                }
                            }
                            ++i;
                        }
                    }

                    modelselSections.setData(data);
                    modelpnlNavigation.setData({
                        previousEnabled: false,
                        nextEnabled: config.setup.length > 1,
                    });

                    return data;
                },
            }
        )
    );

    // Necessary to fulfill the FORMS.Renderer.onLoad() promise
    onLoad();
}
