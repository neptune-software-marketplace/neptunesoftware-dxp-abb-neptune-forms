// AC: Pre Populated Values - Numeric
inElementFormPrePopulateFreeValue.fireChange();
// AC: Numeric Min Max
let newStep = 1 / Math.pow(10, this.getValue());
inElementFormNumericMin.setStep(newStep);
inElementFormNumericMax.setStep(newStep);