try {
    result.data = await entities.forms_design.save(req.body);
    return complete();
} catch (e) {
    result.statusCode = 500;
    result.data = { status: e.message }
    return complete();
}