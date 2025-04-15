/*
 * Gets all forms (Single and Compounded) ready to use
 * 
 * Parameters:
 *      - id_form: if supplied, selects only the form with that id
 *      - retrieve_all: if false/undefined, selects only released
 *                      if true, selects all
 * Behaviour:
 *      - If no id_form is supplied, then all forms (Single and Compounded)
 *        are selected.
 *      - If id_form is supplied then only that form (Single or Compounded)
 *        is selected.
 *      - If an id_form is supplied, points to a non-released form, and
 *        retrieve_all is not true, then no data is returned.
 *      - After all forms are selected, then all of those that are Compounded
 *        are compiled and made ready for usage.
 *      - Compounded forms have an idMapPool to keep the generated ids the
 *        same after the first compilation.
 */
let loData = req.query;

/** / // <- Join "* /" together to enable the test data
loData = {id_form:"0ebb2e5c-e870-4d28-9c1d-f167683c32ec", retrieve_all: true}; // Compounded
//loData = {id_form:"F41E49CF-CF5E-EF11-991A-000D3AB5734C", retrieve_all: true}; // Compounded
/**/
// Single templates
let loChecklistTemplatesReq = entities.forms_design.createQueryBuilder("");
    // .createQueryBuilder("templates")
    // .leftJoinAndSelect("ref_forms_subgroup", "ref", "ref.id like templates.subgroupid")
    // .where("templates.subgroupid != ''");
// Compounded templates
let loChecklistCompoundedReq = entities.forms_composer_design.createQueryBuilder("");
    // .createQueryBuilder("templates")
    // // .leftJoinAndSelect("viking_ref_forms_subgroup", "ref", "ref.id_subgroup like templates.subgroupid")
    // .leftJoinAndSelect("ref_forms_subgroup", "ref", "ref.id like templates.subgroupid")
    // .where("templates.subgroupid != ''");
// confirm that gets the released or all of the forms
let whereUsed = false
if (!(loData && loData.retrieve_all)) {
    if (whereUsed) {
        loChecklistTemplatesReq.andWhere("released = :released", {released: true});
        loChecklistCompoundedReq.andWhere("released = :released", {released: true});
    }
    else {
        loChecklistTemplatesReq.where("released = :released", {released: true});
        loChecklistCompoundedReq.where("released = :released", {released: true});
        whereUsed = true;
    }
}
// check if id_model is given + add to request
// if (loData && loData.id_model) {
//     loChecklistTemplatesReq.andWhere("ref.id_model = :id_model", {id_model: loData.id_model});
//     loChecklistCompoundedReq.andWhere("ref.id_model = :id_model", {id_model: loData.id_model});
// }
if (loData && loData.id_form) {
    if (whereUsed) {
        loChecklistTemplatesReq.andWhere("id = :id", {id: loData.id_form});
        loChecklistCompoundedReq.andWhere("id = :id", {id: loData.id_form});
    }
    else {
        loChecklistTemplatesReq.where("id = :id", {id: loData.id_form});
        loChecklistCompoundedReq.where("id = :id", {id: loData.id_form});
        whereUsed = true;
    }
}

loChecklistTemplatesReq.orderBy("updatedAt");
loChecklistCompoundedReq.orderBy("updatedAt");

const loChecklistTemplates = await loChecklistTemplatesReq.getMany();
const loChecklistCompounded = await loChecklistCompoundedReq.getMany();
// const loChecklistTemplates = await loChecklistTemplatesReq.getRawMany();
// const loChecklistCompounded = await loChecklistCompoundedReq.getRawMany();


// log.info(loChecklistTemplates);
// log.info(loChecklistCompounded);
//  console.log(loChecklistCompounded);

if (Array.isArray(loChecklistCompounded) && loChecklistCompounded.length) {

    for (let loCompoundedForm of loChecklistCompounded) {
        // console.log("------------------- Compounded Form found ----------------------");
        // console.info("Form:", loCompoundedForm);
        // Acquires the source forms
        let loFormIds = (typeof loCompoundedForm.setup === "object") 
                            ? loCompoundedForm.setup.forms
                            : JSON.parse(loCompoundedForm.setup).forms;
        // console.info("Form ids:", loFormIds);
        // Acquire the database data
        let loWhereForms = loFormIds.map(pvFormId => { return { "id": pvFormId }; });
        // console.info("loWhereForms", loWhereForms);
        const loReturnedForms = await entities.forms_design.find({
            where: loWhereForms
        });
        // console.info("After", loReturnedForms);
        // // DEBUG for ERROR:
        // if (loReturnedForms?.length) { loReturnedForms[0].id = "bad id"; }

        let loOrderedForms = JSON.parse(JSON.stringify(loFormIds));
        for (let loSingleForm of loReturnedForms) {
            let lvIndex = loOrderedForms.indexOf(loSingleForm.id);
            loOrderedForms[lvIndex] = loSingleForm;
        }
        // Removes unloaded/not found forms
        let loReducedOrderedForms = loOrderedForms.reduce((bag,value) => (typeof value === "object") ? bag.push(value) && bag :bag, [] );
        // Adds failed loading to the errors field
        loCompoundedForm.load_errors = loOrderedForms.reduce((bag,value) => (typeof value !== "object") ? bag.push(value) && bag :bag, [] );

        // console.log("form ids:");
        // console.log("========");
        // console.dir(loFormIds);
        // console.log("where forms:");
        // console.log("===========");
        // console.dir(loWhereForms);
        // console.log("ordered forms:");
        // console.log("==============");
        // console.dir(loOrderedForms);
        // console.log("reduced ordered forms:");
        // console.log("==============");
        // console.dir(loReducedOrderedForms);
        // console.log("errors found:");
        // console.log("============");
        // console.dir(loCompoundedForm.load_errors);
        // console.info("Returned forms:", loReturnedForms);

        // Begins the merge
        loCompoundedForm.setup = [];
        if (typeof loCompoundedForm.config !== "object") {
            loCompoundedForm.config = JSON.parse(loCompoundedForm.config);
        }
        loCompoundedForm.config.wizardPagination = [];
        loCompoundedForm.config.renderers = {};
        for (let loSingleForm of loReducedOrderedForms) {
            // Get the config for this single form
            // console.log("------ 1 ---------");
            // console.log("CompoundedForm:", loCompoundedForm);
            let loSFConfig = loCompoundedForm.config;
                loSFConfig = (loSFConfig.control && loSFConfig.control[loSingleForm.id]) ? loSFConfig.control[loSingleForm.id] : {};
                // Makes sure that if it is indeed an object. If it is, copy it so it does not affect the source
                loSFConfig = (!Array.isArray(loSFConfig) && typeof loSFConfig === "object") ? JSON.parse(JSON.stringify(loSFConfig)) : {};
                loSFConfig.sfId = loSingleForm.id; // Keeps the single form ID in the configuration
           
            // console.dir(loSFConfig);
            // console.log("CompoundedForm/config:", loSFConfig);
            // console.log("------ 2 ---------");
            let loTempSetup = (typeof loSingleForm.setup === "string") ? JSON.parse(loSingleForm.setup) : loSingleForm.setup;
                loTempSetup = fnTraverseArray( loTempSetup, loSFConfig, loCompoundedForm.config ); // loCompoundedForm.config.wizardPagination );
            // console.log("------ 3 ---------");
            if (Array.isArray(loTempSetup)) {
                loCompoundedForm.setup = loCompoundedForm.setup.concat(loTempSetup);
            }
        }
        loCompoundedForm.setup = JSON.stringify(loCompoundedForm.setup);
    }
    // console.log( "----- calculation completed -----" );
    // console.log( loChecklistCompounded );
}

// const loReleasedUniqueTemplates = new Map(
//     (loChecklistTemplates.concat(loChecklistCompounded))
//         .map(poItem => [poItem.subgroupid, poItem])).values();

// result = [...loReleasedUniqueTemplates];
result = loChecklistTemplates.concat(loChecklistCompounded);

// console.dir(result);
complete();

function fnTraverseArray(poArrayElements, poConfig, poCompoundedConfig) {
    let loResult = [];
	let loUuidMaps = {_deleted:[]};
    // console.dir(poArrayElements);

    // Resolves config.excluded and config.overridesTitle/title
    for (let loElement of poArrayElements) {
        // console.log("fnTA:", loElement.title);
		if (!(loElement.disabled || poConfig[loElement.id] && poConfig[loElement.id].excluded)) {
			loResult.push(fnTraverseElement(loElement, poConfig, loUuidMaps, 0) );
            // console.log(`----------- element id: ${loElement.id}`);
            // console.log(`----------- mapped uuid: ${loUuidMaps[loElement.id]}`)
            // console.dir(poConfig[loElement.id]);
            /* -- startsWizardStep -- */
            if (poConfig[loElement.id]?.startsWizardStep) {
                poCompoundedConfig.wizardPagination.push(Object.assign(
                    { breakId: loUuidMaps[loElement.id]},
                    poConfig[loElement.id]?.wizardPagination)
                )
                // console.dir(poCompoundedConfig.wizardPagination);
            }
            /* -- renderer -- */
            for (let rendererName of Object.getOwnPropertyNames(poConfig[loElement.id]?.useRenderer ?? {})) {
                if (!Array.isArray(poCompoundedConfig.renderers[rendererName])) {
                    poCompoundedConfig.renderers[rendererName] = [];
                }
                if (poConfig[loElement.id].useRenderer[rendererName]) {
                    poCompoundedConfig.renderers[rendererName].push(Object.assign(
                        {id: loUuidMaps[loElement.id]},
                        poConfig[loElement.id].renderer[rendererName]
                    ))
                }
            }
		}
        else {
            loUuidMaps._deleted.push(`${poConfig.sfId}|${loElement.id}`);
            fnTraverseElementToDelete(loElement, poConfig, loUuidMaps);
        }
    }
    // Resolves visibility conditions for elements that don't exist anymore
    let loFilteredResult = [];
    // console.log("Uuid maps:");
    // console.log("=======");
    // console.dir(loUuidMaps);
    // console.log("Deleted:");
    // console.log("=======");
    // console.dir(loUuidMaps._deleted);
    // console.log("Filtering:");
    // console.log("=========");
    for (let loElement of loResult) {
        // console.log(`0: ${loElement.id}`);
        if (!loElement.visibleFieldName) {
            // console.log(">> Conditional visibility does NOT exist");
            loFilteredResult.push(fnTraverseElementToFilter(loElement, loUuidMaps, 1));
        }
        else if (!loUuidMaps._deleted.includes(loElement.visibleFieldName)) {
            // console.log(`>> Conditional visibility exists AND is still valid (${loElement.visibleFieldName})`);
            loFilteredResult.push(fnTraverseElementToFilter(loElement, loUuidMaps, 1));
        }
        else {
            // console.log(">> Conditional visibility exists BUT it is INVALID");
        }
    }
    loResult = loFilteredResult;
	for (let loElement of loResult) {
		fnApplyNewUuid(loElement, loUuidMaps);
	}
	// console.log(loUuidMaps);
    //console.dir(loUuidMaps);
    //console.dir(loResult);

    //console.dir(JSON.stringify(loResult, null, 4));

    return loResult;
};

function fnApplyNewUuid( poObject, poUuidMaps ) {
	if (poUuidMaps[poObject.id]) { poObject.id = poUuidMaps[poObject.id]; }
    // handles id for conditional visibility
    if (poUuidMaps[poObject.visibleFieldName]) { poObject.visibleFieldName = poUuidMaps[poObject.visibleFieldName]; }
    // // handles id for conditional visibility (fieldId)
    // if (poUuidMaps[poObject.fieldId]) { poObject.fieldId = poUuidMaps[poObject.fieldId]; }
	if (Array.isArray(poObject.elements) && poObject.elements.length) {
		for (let loElement of poObject.elements) { fnApplyNewUuid( loElement, poUuidMaps ); }
	}
	if (Array.isArray(poObject.items) && poObject.items.length) {
		for (let loItem of poObject.items) { fnApplyNewUuid( loItem, poUuidMaps ); }
	}
}

function fnTraverseElement(poElement, poConfig, poUuidMaps, pvLevel) {
	let lvTempId = `${poConfig.sfId}|${poElement.id.toLocaleLowerCase()}`; // Makes the temp ID as <sf uuid>|<el uuid>
    if (poConfig[poElement.id]) {poConfig[lvTempId] = poConfig[poElement.id];} // Makes sure that the config works with the temp ID
    poElement.id = lvTempId; // Assumes the temp ID
    if (poConfig[poElement.id]?.overridesTitle) {poElement.title = poConfig[poElement.id].title};
	if (!poUuidMaps[poElement.id]) {poUuidMaps[poElement.id] = (typeof uuid !== "undefined") ? uuid() : crypto.randomUUID();}
    if (isValidUuid(poElement.visibleFieldName)) {
        // handles id for conditional visibility
        poElement.visibleFieldName = `${poConfig.sfId}|${poElement.visibleFieldName.toLocaleLowerCase()}`; // Makes the temp ID as <sf uuid>|<el uuid>
        // console.log(`Conditional visibility found: ${poElement.visibleFieldName} in element ${poElement.id}`);
        if (!poUuidMaps[poElement.visibleFieldName]) {
            poUuidMaps[poElement.visibleFieldName] = (typeof uuid !== "undefined") ? uuid() : crypto.randomUUID();
        }
    }

	// console.log(`${"\t".repeat(pvLevel)}EL: ${poElement.title} (${poElement.id})`);
	// This element is to be returned. Goes over the possible elements and items
	if (Array.isArray(poElement.elements) && poElement.elements.length) {
		let loElements = [];
		for (let loElement of poElement.elements) {
			if (!(poConfig[loElement.id] && poConfig[loElement.id].excluded)) {
				loElements.push(fnTraverseElement(loElement, poConfig, poUuidMaps, pvLevel+1));
			}
            else {
                poUuidMaps._deleted.push(`${poConfig.sfId}|${loElement.id}`);
                fnTraverseElementToDelete(loElement, poConfig, poUuidMaps);
            }
		}
		poElement.elements = loElements;
	}
	if (Array.isArray(poElement.items) && poElement.items.length) {
		let loItems = []
		for (let loItem of poElement.items) {
			loItems.push(fnTraverseItem(loItem, poConfig, poUuidMaps, pvLevel+1));
		}
		poElement.items = loItems;
	}
	return poElement;
}

function fnTraverseElementToDelete(poElement, poConfig, poUuidMaps) {
	if (Array.isArray(poElement?.elements) && poElement.elements.length) {
		for (let loElement of poElement.elements) {
            poUuidMaps._deleted.push(`${poConfig.sfId}|${loElement.id}`);
            fnTraverseElementToDelete(loElement, poConfig, poUuidMaps);
        }
    }
}

function fnTraverseElementToFilter(poElement, poUuidMaps, pvLevel) {
	// console.log(`${pvLevel}: ${poElement.id}`);
	if (Array.isArray(poElement?.elements) && poElement.elements.length) {
		let loElements = [];
		for (let loElement of poElement.elements) {
            if (!loElement?.visibleFieldName) {
                // console.log(">> Conditional visibility does NOT exist");
                loElements.push(fnTraverseElementToFilter(loElement, poUuidMaps, pvLevel+1));
            }
            else if (!poUuidMaps._deleted.includes(loElement.visibleFieldName)) {
                // console.log(`>> Conditional visibility exists AND is still valid (${loElement.visibleFieldName})`);
                loElements.push(fnTraverseElementToFilter(loElement, poUuidMaps, pvLevel+1));
            }
            // else {
            //     console.log(">> Conditional visibility exists BUT it is INVALID");
            // }
		}
		poElement.elements = loElements;
	}
	return poElement;
}

function fnTraverseItem(poItem, poConfig, poUuidMaps, pvLevel) {
	poItem.id = `${poConfig.sfId}|${poItem.id.toLocaleLowerCase()}`; // Makes the new ID as <sf uuid>|<it uuid>
	if (!poUuidMaps[poItem.id]) {poUuidMaps[poItem.id] = (typeof uuid !== "undefined") ? uuid() : crypto.randomUUID();}
	// console.log(`${"\t".repeat(pvLevel)}Item: ${poItem.title} (${poItem.id})`);
	// This item is to be returned. 
	return poItem;
}
function isValidUuid( pvValue, pvStrict = false ) {
    if (typeof pvValue !== "string") { return false; }
    const C_UUID_REGEX = (pvStrict) 
                            ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                            : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!pvValue.match(C_UUID_REGEX)) { return false; }
    return true;
}


