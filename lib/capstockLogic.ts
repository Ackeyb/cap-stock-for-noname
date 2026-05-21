import type { CapstockData, FirestoreCapstockData, Operation } from "./capstockTypes";

export const INITIAL_UPDATE_VALUES = ["", "", "", "", ""];
export const MINUS_FIELD_NAME = "マイナス";

export function getOrderedVisibleData(data: FirestoreCapstockData) {
  const orderedKeys = data._order || Object.keys(data);
  const visibleKeys = orderedKeys.filter((key) => key !== "_order");

  return {
    fieldList: visibleKeys,
    values: Object.fromEntries(
      visibleKeys.map((key) => {
        const value = data[key];
        return [key, typeof value === "number" ? value : 0];
      })
    ) as CapstockData,
  };
}

export function formatPreview(data: CapstockData, baseData: CapstockData = {}) {
  return Object.entries(data)
    .map(([key, value]) => {
      const baseValue = baseData[key] ?? value;
      const diff = value - baseValue;
      const diffText = diff === 0 ? "" : ` (${diff > 0 ? "+" : ""}${diff})`;
      return `${key}: ${value}${diffText}`;
    })
    .join("\n");
}

export function formatPlainPreview(data: CapstockData) {
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export function appendHistory(currentHistory: string, entries: string | string[]) {
  const nextEntries = Array.isArray(entries) ? entries : [entries];
  const nextHistory = nextEntries.filter(Boolean).join("\n");

  if (!nextHistory) return currentHistory;
  return currentHistory + (currentHistory ? "\n" : "") + nextHistory;
}

type ApplyFieldUpdatesInput = {
  data: CapstockData;
  selectedField: string;
  updateValues: string[];
  operation: Operation;
};

export function applyFieldUpdates({ data, selectedField, updateValues, operation }: ApplyFieldUpdatesInput) {
  const updatedData = { ...data };
  const historyEntries: string[] = [];

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

export function addFieldValue(data: CapstockData, fieldName: string, fieldValue: string) {
  const numericValue = Number(fieldValue);

  return {
    data: { ...data, [fieldName]: numericValue },
    historyEntry: `追加: ${fieldName} (${numericValue})`,
  };
}

export function deleteFieldValue(data: CapstockData, fieldName: string) {
  const oldValue = data[fieldName];
  const updatedData = { ...data };
  delete updatedData[fieldName];

  return {
    data: updatedData,
    historyEntry: `削除: ${fieldName} (${oldValue})`,
  };
}

export function buildSaveData(data: CapstockData): FirestoreCapstockData {
  return {
    ...data,
    _order: Object.keys(data).filter((key) => key !== "_order"),
  };
}
