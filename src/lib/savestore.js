// Keeps the loaded save in memory while the visitor moves between Save Analyzer and Team Builder (never stored, never uploaded).
let cur = null;
export const getSaved = () => cur;
export const setSaved = (save, fname) => { cur = save ? { save, fname } : null; };
