let data = this.getParent().getBindingContext().getObject();

const elementAttribute = this.getCustomData().find((item) => item.getKey() === "element");
if (typeof elementAttribute !== "undefined") {
    const element = elementAttribute.getValue();
    data.id = element.id;
    data.title = element.title;
}
