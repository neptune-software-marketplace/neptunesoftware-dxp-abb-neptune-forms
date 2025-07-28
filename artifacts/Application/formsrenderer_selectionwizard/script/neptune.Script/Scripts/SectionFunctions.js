const Cfg = { FORMS: {} };

const C_BUTTON_PREVIOUS = 0;
const C_BUTTON_NEXT = 1;

function performPreviousNext(who, oSource) {
    var previousEnabled = false;
    var nextEnabled = false;

    // USE THE SHARED VARIABLE instead of selSections.getSelectedIndex()
    const currentIndex = currentSectionIndex;

    const currentSectionValid = Cfg.FORMS.validateSection(Cfg.FORMS.config.setup[currentIndex], false);

    // Validate on Next button when WizardNavigation is true
    if( (who === C_BUTTON_NEXT) && !currentSectionValid && modelFormDefinition.getData().WizardNavigation ) {
        sap.m.MessageBox.error("Please fix validation errors before continuing.");
        return;
    }

    const allItems = selSections.getItems();

    // Calculate new index and update shared variable
    if (who === C_BUTTON_NEXT && currentIndex < allItems.length - 1) {
        currentSectionIndex = currentIndex + 1;
    }
    if (who === C_BUTTON_PREVIOUS && currentIndex > 0) {
        currentSectionIndex = currentIndex - 1;
    }


    // Update the dropdown to match
    selSections.setSelectedIndex(currentSectionIndex);

    // Calculate button states using shared variable
    const previousEnabledCalc = currentSectionIndex > 0;
    const nextEnabledCalc = currentSectionIndex < allItems.length - 1;

    selSections.rerender();

    // Update navigation model
    modelpnlNavigation.setData({ 
        previousEnabled: previousEnabledCalc, 
        nextEnabled: nextEnabledCalc 
    });

    scrollToSection(selSections.getSelectedItem().getText(), true, currentSectionIndex);
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
                    behavior: "auto",  // Changed from "smooth" to "auto" for instant scroll
                    block: "start",    // Changed from "center" to "start"
                    inline: "start",   // Changed from "center" to "start"
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
    // Use FORMS.scrollParent instead of pageEndScrollContainer
    const sections = Cfg.FORMS.scrollParent.getContent();
    
    for (let i = 0; i < sections.length; i++) {
        let sectionText = sections[i].getHeaderText();
        
        // For Tables
        if (sectionText === "" && 
            sections[i].getHeaderToolbar() && 
            sections[i].getHeaderToolbar().getTitleControl()) {
            sectionText = sections[i].getHeaderToolbar().getTitleControl().getText();
        }
        
        if (sectionText === headerText) {
            // If we have a specific target index, only expand that one
            if (targetIndex >= 0 && i !== targetIndex) {
                continue;
            }
            
            // Make visible and expand the target section
            sections[i].setVisible(true);
            sections[i].setExpanded(true);
        } else if (collapseOthers) {
            // Collapse other sections
            sections[i].setExpanded(false);
        }
    }
}


