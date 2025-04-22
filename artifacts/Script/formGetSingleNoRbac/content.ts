// PRR - forms/#20 - role access to forms
// Purpose: the composer should not look at the roles based access to load already added Single Forms
result.data = await entities.forms_design.findOne({ id: req.query.id });
complete();