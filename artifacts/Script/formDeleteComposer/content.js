await entities.forms_composer_design.delete(req.query.id);
result.data = {
    status: "OK",
    message: "Form Deleted"
};
complete();