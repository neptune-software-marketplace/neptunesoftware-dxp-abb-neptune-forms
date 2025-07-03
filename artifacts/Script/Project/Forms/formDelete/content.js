// PRR - forms/#17 - role access to forms (ADD - Begin)
// result.data = await entities.forms_design.findOne({ id: req.query.id });
const form = await entities.forms_design.findOne({ id: req.query.id });
// Check if it is authorized
let {gatherRoleIds, getAuthorizedDataWithFormData} = globals.FormsAuthorizationGlobal;
if (!getAuthorizedDataWithFormData(await gatherRoleIds(req?.user?.id),form).isAuthorized) {
    result.statusCode = 403;
    result.data = { status: `You have no access to the requested resource` };
    return complete();
}
// PRR - forms/#17 - role access to forms (ADD - End)
await entities.forms_design.delete(req.query.id);
result.data = {
    status: "OK",
    message: "Form Deleted"
};
complete();