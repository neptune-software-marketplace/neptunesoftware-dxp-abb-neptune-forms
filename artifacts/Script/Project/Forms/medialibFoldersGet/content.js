const man = p9.manager;
const data = await man.find("media_folder");

function buildTree(arr) {
    const map = new Map();
    const result = [];

    // Set up map with each item by its ID
    arr.forEach(item => map.set(item.id, { ...item, children: [] }));

    // Link each item to its parent
    arr.forEach(item => {
        const mappedItem = map.get(item.id);

        if (item.parent) {
            const parent = map.get(item.parent);
            
            // Recursively concatenate the parent's full path to the child
            let parentPathname = parent.pathname ? parent.pathname : parent.name;
            mappedItem.pathname = `${parentPathname}/${mappedItem.name}`;
            
            // Add the child to the parent's children array
            parent.children.push(mappedItem);
        } else {
            // If there's no parent, it's a root item, so set pathname as the item's name
            mappedItem.pathname = mappedItem.name;            
            // Add root elements to the result array
            result.push(mappedItem);
        }
    });

    return result;
}

const dataRoot = {children: [{name: "Root", children: buildTree(data)}]};
result = dataRoot;

complete();
