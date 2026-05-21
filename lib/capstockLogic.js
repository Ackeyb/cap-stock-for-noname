export const INITIAL_UPDATE_VALUES = ["", "", "", "", ""];
export const MINUS_FIELD_NAME = "マイナス";

export function getOrderedVisibleData(data) {
  const orderedKeys = data._order || Object.keys(data);
  const visibleKeys = orderedKeys.filter((key) => key !== "_order");

  return {
    fieldList: visibleKeys,
    values: Object.fromEntries(visibleKeys.map((key) => [key, data[key]])),
  };
}

export function formatPreview(data, baseData = {}) {
  return Object.entries(data)
    .map(([key, value]) => {
      const baseValue = baseData[key] ?? value;
      const diff = value - baseValue;
      const diffText = diff === 0 ? "" : ` (${diff > 0 ? "+" : ""}${diff})`;
      return `${key}: ${value}${diffText}`;
    })
    .join("\n");
}

export function formatPlainPreview(data) {
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export function appendHistory(currentHistory, entries) {
  const nextEntries = Array.isArray(entries) ? entries : [entries];
  const nextHistory = nextEntries.filter(Boolean).join("\n");

  if (!nextHistory) return currentHistory;
  return currentHistory + (currentHistory ? "\n" : "") + nextHistory;
}

export function applyFieldUpdates({ data, selectedField, updateValues, operation }) {
  const updatedData = { ...data };
  const historyEntries = [];

  updateValues.forEach((value) => {
    if (value === "") return;

    const oldValue = updatedData[selectedField] || 0;
    let newValue = operation === "increase" ? oldValue + Number(value) : oldValue - Number(value);

    if (newValue < 0 && selectedField !== MINUS_FIELD_NAME) {
      const minusChange = newValue;
      updatedData[MINUS_FIELD_NAME] = (updatedData[MINUS_FIELD_NAME] || 0) + minusChange;
      newValue = 0;
      historyEntries.push(`${MINUS_FIELD_NAME}: ${data[MINUS_FIELD_NAME] || 0} -> ${updatedData[MINUS_FIELD_NAME]} (${minusChange})`);
    }

    updatedData[selectedField] = newValue;

    const fieldChange = newValue - oldValue;
    historyEntries.push(`${selectedField}: ${oldValue} -> ${newValue} (${fieldChange >= 0 ? `+${fieldChange}` : fieldChange})`);
  });

  return { data: updatedData, historyEntries };
}

export function addFieldValue(data, fieldName, fieldValue) {
  const numericValue = Number(fieldValue);

  return {
    data: { ...data, [fieldName]: numericValue },
    historyEntry: `追加: ${fieldName} (${numericValue})`,
  };
}

export function deleteFieldValue(data, fieldName) {
  const oldValue = data[fieldName];
  const updatedData = { ...data };
  delete updatedData[fieldName];

  return {
    data: updatedData,
    historyEntry: `削除: ${fieldName} (${oldValue})`,
  };
}

export function buildSaveData(data) {
  return {
    ...data,
    _order: Object.keys(data).filter((key) => key !== "_order"),
  };
}
