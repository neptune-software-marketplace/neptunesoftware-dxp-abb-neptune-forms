try {

    let log = {
        data: req.body,
        completed: req.body.completed,
        valid: req.body.valid,
        sessionid: req.body.sessionid,
        formid: req.body.config.id
    }

    let logExist = await entities.forms_data.findOne({
        where: { sessionid: req.body.sessionid },
        select: ["id"]
    });
    
    if (logExist) log.id = logExist.id;

    log = await entities.forms_data.save(log);

    result.data = {
        log: log,
        body: req.body
    }
    complete();

} catch (e) {
    result.data = {
        error: e,
        body: req.body
    }

    complete();
}