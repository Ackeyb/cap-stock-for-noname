import { useReducer } from "react";
import { INITIAL_UPDATE_VALUES, appendHistory, formatPlainPreview } from "../lib/capstockLogic";

const initialState = {
  docList: [],
  selectedDoc: "",
  previewText: "",
  previewHistory: "",
  fieldList: [],
  selectedField: "",
  updateValues: INITIAL_UPDATE_VALUES,
  operation: "increase",
  isSaved: false,
  isDisplayed: false,
  newFieldName: "",
  newFieldValue: "",
  selectedFieldToDelete: "",
  isCopied: false,
  tempData: {},
  isExtraFieldsVisible: false,
  baseDataForDiff: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "setDocList":
      return { ...state, docList: action.docList };
    case "selectDoc":
      return { ...state, selectedDoc: action.selectedDoc };
    case "selectField":
      return { ...state, selectedField: action.selectedField };
    case "setOperation":
      return { ...state, operation: action.operation };
    case "setUpdateValue": {
      const updateValues = [...state.updateValues];
      updateValues[action.index] = action.value;
      return { ...state, updateValues };
    }
    case "docLoaded":
      return {
        ...state,
        tempData: action.data,
        baseDataForDiff: action.data,
        fieldList: action.fieldList,
        previewText: formatPlainPreview(action.data),
        previewHistory: "",
        isSaved: false,
        isDisplayed: true,
      };
    case "docMissing":
      return {
        ...state,
        tempData: {},
        previewText: "データが見つかりません",
        fieldList: [],
        isDisplayed: false,
      };
    case "dataEdited":
      return {
        ...state,
        tempData: action.data,
        fieldList: Object.keys(action.data),
        previewText: action.previewText,
        previewHistory: appendHistory(state.previewHistory, action.historyEntries),
        updateValues: action.resetUpdateValues ? INITIAL_UPDATE_VALUES : state.updateValues,
        isSaved: false,
      };
    case "setNewFieldName":
      return { ...state, newFieldName: action.newFieldName };
    case "setNewFieldValue":
      return { ...state, newFieldValue: action.newFieldValue };
    case "clearNewField":
      return { ...state, newFieldName: "", newFieldValue: "" };
    case "selectFieldToDelete":
      return { ...state, selectedFieldToDelete: action.selectedFieldToDelete };
    case "clearFieldToDelete":
      return { ...state, selectedFieldToDelete: "" };
    case "toggleExtraFields":
      return { ...state, isExtraFieldsVisible: !state.isExtraFieldsVisible };
    case "saved":
      return {
        ...state,
        isSaved: true,
        docList: [action.docName, ...state.docList].slice(0, 20),
      };
    case "copied":
      return { ...state, isCopied: action.isCopied };
    default:
      return state;
  }
}

export function useCapstockState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch };
}
