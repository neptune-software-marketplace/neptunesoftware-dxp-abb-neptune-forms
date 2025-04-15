setTimeout( function() {
    FORMS.Renderer.subscribe(
        new FormRenderer(
            FORMS.NAMESPACE.NEPTUNE, 
            FORMS.RENDERER.STANDARD, 
            {}, // rendererInfo,
            i18nLabel.getText(),
            i18nDescription.getText(), 
            {
                getData: ()=>{},
                prepareData: (options, repository) => {},
                bundleRenderedData: () => {},
                applyStyles: (uiElement) => {},
                clearStyles: (uiElement) => {},
                buildObjectsAndEvents: (parent, options, repository) => {},
                getMatchingData: () => {return {};},
                foundMatchingData: () => true, // The standard renderer is always a match
                processSection: (section, index, repository, selectedRenderer) => {
                    if (!section) return;
                    if (section.disabled) return;
                    let sectionParent;
                    switch (section.type) {
                        case "Form":
                            FORMS.bindingPath = "/";
                            sectionParent = FORMS.buildParentForm(FORMS.formParent, section);
                            break;

                        case "Table":
                            FORMS.bindingPath = "";
                            delete section.origMode; // this attribute saves the delete or multiselect mode when the dynamic editability is being set (see fn setFormEditable)
                            sectionParent = FORMS.buildParentTable(FORMS.formParent, section);
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
                            break;
                    }
                },
                executeFirstRendering: () => {}, // data is already rendered in processSection
                applyValidationStyle: () => {}
            }
        )
    );
}, 100);