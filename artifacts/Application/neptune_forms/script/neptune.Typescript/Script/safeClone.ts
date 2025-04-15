// This wrapper works regardless of the type of value, and always works (even if value is undefined)
function safeClone(value: any) {
    let cloned = $.extend(true, {}, { origin: value });
    return cloned.origin;
}