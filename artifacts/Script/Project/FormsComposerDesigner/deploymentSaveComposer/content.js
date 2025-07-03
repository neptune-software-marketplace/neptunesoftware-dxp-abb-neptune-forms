try {
    await entityManager.save(req.body.table, req.body.data);
    complete();
} catch (e) {
    log.error(e);
    fail();
}