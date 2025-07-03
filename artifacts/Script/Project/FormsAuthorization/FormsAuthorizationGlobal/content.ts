
type Primitive = string|number|boolean|null|undefined;
type AuthorizedData = {id:string, name:string, isAuthorized:boolean, [k:string]:any};

function getAuthorizedDataWithFormData(userRoleIds:Array<Primitive>, form): AuthorizedData {
    let {id, name, isAuthorized} = form;
    if (!form?.roles?.length) {
        isAuthorized = true;
    }
    else {
        const formRoleIds = form.roles.map(role=>role.id);
        isAuthorized = isAuthorizedByRoleIds(userRoleIds, formRoleIds);
    }
    return {id,name,isAuthorized};
}
function isAuthorizedByRoleIds(userRoleIds:Array<Primitive>, formRoleIds:Array<Primitive>): boolean {
    return !!formRoleIds.find(id => userRoleIds.includes(id));
}
async function gatherRoleIds(userId:string):Promise<Array<string>> {
    const roles=[];
    try {
        const roleGroupDetails = await p9.user.getRolesAndGroups(userId);
        if (roleGroupDetails?.roles?.length) {
            roles.splice(0,0,...roleGroupDetails.roles.map(role => role.id));
        }
        if (roleGroupDetails?.departments?.length) {
            for (let groupDetails of roleGroupDetails?.departments) {
                if (groupDetails?.roles?.length) {
                    reduceToUniqueForPrimitives(roles, groupDetails.roles.map(role => role.id));
                }
            }
        }
    }
    catch (e) {};
    return roles;
}

function reduceToUniqueForPrimitives(arrayReceive:Array<Primitive>, arrayGive:Array<Primitive>): Array<Primitive> {
    const returnArray = arrayReceive.concat(arrayGive).reduce((bag,value) => { 
        if (!bag.includes(value)) {bag.push(value)} 
        return bag; 
    }, []);
    // returns previous values, and affects the receiving array object
    return arrayReceive.splice(0,arrayReceive.length,...returnArray); 
};

complete({getAuthorizedDataWithFormData,isAuthorizedByRoleIds,gatherRoleIds,reduceToUniqueForPrimitives});