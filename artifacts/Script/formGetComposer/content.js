// PRR - forms/#20 - role access to forms (MOD - Begin) 
// result.data = await entities.forms_composer_design.findOne({ id: req.query.id });
const form = await entities.forms_composer_design.findOne({ id: req.query.id });
// Check if it is authorized 
let {gatherRoleIds, getAuthorizedDataWithFormData} = globals.FormsAuthorizationGlobal; 
if (!getAuthorizedDataWithFormData(await gatherRoleIds(req?.user?.id),form).isAuthorized) { 
    result.statusCode = 403; 
    result.data = { status: `You have no access to the requested resource` }; 
    return complete(); 
} 
result.data = form; 
// PRR - forms/#20 - role access to forms (MOD - End) 
complete();
