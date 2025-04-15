const getBooleanOf = (value:any) => {
    let result = value ?? false;
    if (typeof result === "string") { result = result.toLocaleLowerCase("en"); }
    switch (result) {
        case "true":
        case "yes":
        case 1:
        case true:
            return true;
        default:
            return false;
    }
}

let onlyActive:boolean = getBooleanOf(req.query?.onlyActive);

/** / // <-- Join "* /" to uncomment the tests
onlyActive = true; 
/**/

let data:any;
if (onlyActive) {
    data = await entities.forms_renderer.createQueryBuilder("")
        .where("active = :isActive", {isActive: true})
        .getMany();
}
else {
    data = await entities.forms_renderer.find();
} 
result = { data };
console.dir(result.data);
complete();