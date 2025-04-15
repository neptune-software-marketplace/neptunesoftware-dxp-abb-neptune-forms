result.data = await entities.forms_composer_design.findOne({ id: req.query.id });
complete();
