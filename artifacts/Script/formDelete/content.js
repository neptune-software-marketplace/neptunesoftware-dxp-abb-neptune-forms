await entities.forms_design.delete(req.query.id);
result.data = {
    status: "OK",
    message: "Form Deleted"
};
complete();