try {
    // UpdatedBy
    req.body.updatedBy = req.user.username;
    // PRR - forms/#20 - role access to forms (ADD - Begin) 
    // Check if it is authorized 
    let {gatherRoleIds, getAuthorizedDataWithFormData} = globals.FormsAuthorizationGlobal; 
    if (!getAuthorizedDataWithFormData(await gatherRoleIds(req?.user?.id),req.body).isAuthorized) { 
        result.statusCode = 403; 
        result.data = { status: `You have no access to the requested resource` }; 
        return complete(); 
    } 
    // Proceeds with the save action 
    // PRR - forms/#20 - role access to forms (ADD - End) 
    result.data = await entities.forms_composer_design.save(req.body);
    return complete();
} catch (e) {
    result.statusCode = 500;
    result.data = { status: e.message };
    return complete();
}
