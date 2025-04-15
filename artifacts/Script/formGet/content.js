// PRR - forms/#17 - role access to forms (MOD - Begin)
// result.data = await entities.forms_design.findOne({ id: req.query.id });
const form = await entities.forms_design.findOne({ id: req.query.id });
// Check if it is authorized
let {gatherRoleIds, getAuthorizedDataWithFormData} = globals.FormsAuthorizationGlobal;
if (!getAuthorizedDataWithFormData(await gatherRoleIds(req?.user?.id),form).isAuthorized) {
    result.statusCode = 401;
    result.data = { status: `Missing role authorization` };
    return complete();
}
result.data = form;
// PRR - forms/#17 - role access to forms (MOD - End)
complete();
