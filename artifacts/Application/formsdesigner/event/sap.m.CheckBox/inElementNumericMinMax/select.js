// AC: Numeric Min Max
let data = modelpanTopProperties.getData();
let newStep = 1 / Math.pow(10, data.decimals);
inElementFormNumericMin.setStep(newStep);
inElementFormNumericMax.setStep(newStep);