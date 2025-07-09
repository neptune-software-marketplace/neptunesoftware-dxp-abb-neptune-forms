const Cfg = { FORMS: {} };

const C_BUTTON_PREVIOUS = 0;
const C_BUTTON_NEXT = 1;

function performPreviousNext(who, oSource) {
    const items = selSections.getItems();

    // Get current index from the dropdown's selected index (not key)
    const currentIndex = selSections.getSelectedIndex();

    // Validate that currentIndex is valid
    if (currentIndex < 0 || currentIndex >= items.length) {
        console.error("Invalid current index:", currentIndex);
        return;
    }

    // Validate current section using the correct index
    const currentSectionValid = Cfg.FORMS.validateSection(
        Cfg.FORMS.config.setup[currentIndex],
        false
    );

    // Check validation on Next button when WizardNavigation is true
    if (
        who === C_BUTTON_NEXT &&
        !currentSectionValid &&
        modelFormDefinition.getData().WizardNavigation
    ) {
        sap.m.MessageBox.error("Please fix validation errors before continuing.");
        return;
    }

    // Calculate new index
    let newIndex = currentIndex;

    if (who === C_BUTTON_NEXT && currentIndex < items.length - 1) {
        newIndex = currentIndex + 1;
    } else if (who === C_BUTTON_PREVIOUS && currentIndex > 0) {
        newIndex = currentIndex - 1;
    }

    // If no change needed, return early
    if (newIndex === currentIndex) {
        return;
    }

    // Update the dropdown selection using index (not key)
    selSections.setSelectedIndex(newIndex);
    selSections.fireChange({ selectedItem: selSections.getItems()[newIndex] });

    // Update button states
    const previousEnabled = newIndex > 0;
    const nextEnabled = newIndex < items.length - 1;

    modelCcControl.setData({
        previousEnabled,
        nextEnabled,
    });

    console.log("modelCcControl")
    console.log(modelCcControl)

    // Rerender the dropdown
    selSections.rerender();

    // Scroll to the new section
    const sectionText = items[newIndex].getText();
    scrollToSection(sectionText, true, newIndex);
}

function scrollToSection(sectionText, collapseOtherSections, targetIndex = 0) {
    var match = false;

    var scrollContainer = `#${Cfg.FORMS.scrollParent}`;

    // sapMPanelHdr elements
    var hdrElements = document.getElementsByClassName("sapMPanelHdr");
    var matchedHdrs = [];
    for (var i = 0; i < hdrElements.length; i++) {
        if (hdrElements[i].innerText === sectionText) {
            matchedHdrs.push(hdrElements[i]);
        }
    }
    if (matchedHdrs.length > 0) {
        var scrollTo = matchedHdrs[Math.min(targetIndex, matchedHdrs.length - 1)];
        scrollTo.scrollIntoView(true);
        match = true;
    }

    // sapMPanelHeaderTB elements, only if no match yet
    if (!match) {
        var hdrTBElements = document.getElementsByClassName("sapMPanelHeaderTB");
        var matchedHdrTBs = [];
        for (var i = 0; i < hdrTBElements.length; i++) {
            var titleElements = hdrTBElements[i].getElementsByClassName("sapMTitle");
            if (titleElements && titleElements[0] && titleElements[0].innerText === sectionText) {
                matchedHdrTBs.push(hdrTBElements[i]);
            }
        }
        if (matchedHdrTBs.length > 0) {
            var scrollTo = matchedHdrTBs[Math.min(targetIndex, matchedHdrTBs.length - 1)];
            scrollTo.scrollIntoView(true);
            match = true;
        }
    }

    // sapMPanelHeadingDiv elements (for iPad etc), only if still no match
    if (!match) {
        var headingDivElements = document.getElementsByClassName("sapMPanelHeadingDiv");
        var matchedHeadingDivs = [];
        for (var i = 0; i < headingDivElements.length; i++) {
            if (headingDivElements[i].innerText === sectionText) {
                matchedHeadingDivs.push(headingDivElements[i]);
            }
        }
        if (matchedHeadingDivs.length > 0) {
            var scrollTo = matchedHeadingDivs[Math.min(targetIndex, matchedHeadingDivs.length - 1)];

            if (typeof seamless !== "undefined" && seamless.scrollIntoView) {
                seamless.scrollIntoView(scrollTo, {
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                });
            } else {
                scrollTo.scrollIntoView(true);
            }
            match = true;
        }
    }

    // Expand the section (pass the index so your expandFormSection can also handle it)
    expandFormSection(sectionText, collapseOtherSections, targetIndex);
}

function expandFormSection(headerText, collapseOthers, targetIndex = -1) {
    const sections = pageEndScrollContainer.getContent();

    for (let i = 0; i < sections.length; i++) {
        let sectionText = sections[i].getHeaderText();

        // Handle sections with toolbar titles
        if (
            sectionText === "" &&
            sections[i].getHeaderToolbar() &&
            sections[i].getHeaderToolbar().getTitleControl()
        ) {
            sectionText = sections[i].getHeaderToolbar().getTitleControl().getText();
        }

        // If we have a specific target index, use it
        if (targetIndex >= 0) {
            if (i === targetIndex) {
                sections[i].setVisible(true);
                sections[i].setExpanded(true);
            } else if (collapseOthers) {
                sections[i].setExpanded(false);
            }
        } else {
            // Original logic for text-based matching
            if (sectionText !== headerText && collapseOthers) {
                sections[i].setExpanded(false);
            }

            if (sectionText === headerText) {
                sections[i].setVisible(true);
                sections[i].setExpanded(true);
            }
        }
    }
}
