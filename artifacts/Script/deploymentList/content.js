const manager = p9.manager ? p9.manager : modules.typeorm.getConnection().manager;

const systems = await manager.find("systems", {
    where: { type: "" },
    select: ["name", "description", "id", "updatedAt", "changedBy", "url"],
    order: { name: "ASC" },
});

const forms = await entities.forms_design.find({ order: { name: "ASC" } });
const group = await entities.forms_group.find({ order: { name: "ASC" } });
const subgroup = await entities.forms_subgroup.find({ order: { name: "ASC" } });
const attributegroup = await entities.forms_attribute_group.find({ order: { name: "ASC" } });
const attributefields = await entities.forms_attribute_fields.find({ order: { name: "ASC" } });

result.data = {
    forms,
    group,
    subgroup,
    attributegroup,
    attributefields,
    systems,
};

complete();
