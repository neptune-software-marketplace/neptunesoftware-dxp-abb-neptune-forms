const manager = p9.manager ? p9.manager : modules.typeorm.getConnection().manager;

// PRR - forms/#20 - role access to forms (ADD - Begin) 
let {gatherRoleIds, getAuthorizedDataWithFormData} = globals.FormsAuthorizationGlobal; 
const userRoleIds = await gatherRoleIds(req?.user?.id); 
// PRR - forms/#20 - role access to forms (ADD - End) 

const adaptiveApps = await manager.find("reports", {
    select: ["name", "description", "id", "application", "package", "updatedAt", "changedBy"],
    order: { name: "ASC" },
});

const package = await manager.find("dev_package", {
    select: ["name", "description", "id"],
    order: { name: "ASC" },
});

// PRR - forms/#20 - role access to forms (MOD - Begin) 
// const forms = await entities.forms_composer_design.find({
const formsAll = await entities.forms_composer_design.find({ 
// PRR - forms/#20 - role access to forms (MOD - End) 
    select: [
        "name",
        "description",
        "id",
        "updatedAt",
        "updatedBy",
        "released",
        "groupid",
        "subgroupid",
        // PRR - forms/#20 - role access to forms (ADD - Begin)
        "roles"
        // PRR - forms/#20 - role access to forms (ADD - End) 
    ],
    order: { name: "ASC" },
});

// PRR - forms/#20 - role access to forms (ADD - Begin) 
const forms = []; 
for (let form of formsAll) { 
    if (getAuthorizedDataWithFormData(userRoleIds,form).isAuthorized) {forms.push(form);} 
} 
// PRR - forms/#20 - role access to forms (ADD - End) 
 
const group = await entities.forms_group.find({
    select: ["id", "name", "description"],
    order: { name: "ASC" },
});
const subgroup = await entities.forms_subgroup.find({
    select: ["id", "name", "description", "groupid"],
    order: { name: "ASC" },
});
const attributegroup = await entities.forms_attribute_group.find({
    select: ["id", "name", "description"],
    order: { name: "ASC" },
});
const attributefields = await entities.forms_attribute_fields.find({
    select: ["id", "name", "description", "groupid"],
    order: { name: "ASC" },
});

// Adding group/subgroup text to list
forms.forEach(function (form) {
    if (form.groupid) {
        const recGroup = group.find((obj) => obj.id === form.groupid);
        if (recGroup) {
            form.groupname = recGroup.name;
        } else {
            form.groupname = form.groupid;
        }
    }

    if (form.subgroupid) {
        const recSubGroup = subgroup.find((obj) => obj.id === form.subgroupid);
        if (recSubGroup) {
            form.subgroupname = recSubGroup.name;
        } else {
            form.subgroupname = form.subgroupid;
        }
    }
});

// Adding empty rows
group.splice(0, 0, {});
subgroup.splice(0, 0, { name: "" });

result.data = {
    forms,
    group,
    subgroup,
    adaptiveApps,
    package,
    attributegroup,
    attributefields,
};

complete();
