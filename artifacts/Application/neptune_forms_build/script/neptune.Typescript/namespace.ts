/**
 * Use this namespace to reference objects in your custom component.
 *
 * When using custom components you might have multiple instances of the
 * same custom component. When you add a custom component to an app this
 * namespace is renamed to the custom component object name in the app.
 *
 * E.g. if the custom component object name is myCustomComponent you can call
 * functions from this namespace with myCustomComponent.foo()
 *
 */
namespace CustomComponent {
    export function build(options: string, data: string) {
        const parent = new sap.m.Panel(undefined, {
            headerText: "Demo",
        });

        return parent;
    }

    export function getData(options, data) {}

    export function setData(options, data) {}
}
