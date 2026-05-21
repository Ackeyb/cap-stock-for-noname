import { useReducer } from "react";
import { INITIAL_UPDATE_VALUES, appendHistory, formatPlainPreview } from "../lib/capstockLogic";
import type { CapstockData, Operation } from "../lib/capstockTypes";

type CapstockState = {
  docList: string[];
  selectedDoc: string;
  previewText: string;
  previewHistory: string;
  fieldList: string[];
  selectedField: string;
  updateValues: string[];
  operation: Operation;
  isSaved: boolean;
  isDisplayed: boolean;
  newFieldName: string;
  newFieldValue: string;
  selectedFieldToDelete: string;
  isCopied: boolean;
  errorMessage: string;
  tempData: CapstockData;
  isExtraFieldsVisible: boolean;
  baseDataForDiff: CapstockData;
};

type CapstockAction =
  | { type: "setDocList"; docList: string[] }
  | { type: "selectDoc"; selectedDoc: string }
  | { type: "selectField"; selectedField: string }
  | { type: "setOperation"; operation: Operation }
  | { type: "setUpdateValue"; index: number; value: string }
  | { type: "docLoaded"; data: CapstockData; fieldList: string[] }
  | { type: "docMissing" }
  | { type: "dataEdited"; data: CapstockData; previewText: string; historyEntries: string | string[]; resetUpdateValues?: boolean }
  | { type: "setNewFieldName"; newFieldName: string }
  | { type: "setNewFieldValue"; newFieldValue: string }
  | { type: "clearNewField" }
  | { type: "selectFieldToDelete"; selectedFieldToDelete: string }
  | { type: "clearFieldToDelete" }
  | { type: "toggleExtraFields" }
  | { type: "saved"; docName: string }
  | { type: "copied"; isCopied: boolean }
  | { type: "setError"; errorMessage: string }
  | { type: "clearError" };

const initialState: CapstockState = {
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
  errorMessage: "",
  tempData: {},
  isExtraFieldsVisible: false,
  baseDataForDiff: {},
};

function reducer(state: CapstockState, action: CapstockAction): CapstockState {
  switch (action.type) {
    case "setDocList":
      return { ...state, docList: action.docList };
    case "selectDoc":
      return { ...state, selectedDoc: action.selectedDoc, errorMessage: "" };
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
        errorMessage: "",
      };
    case "docMissing":
      return {
        ...state,
        tempData: {},
        previewText: "データが見つかりません",
        fieldList: [],
        isDisplayed: false,
        errorMessage: "選択したデータが見つかりませんでした。",
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
        errorMessage: "",
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
        errorMessage: "",
      };
    case "copied":
      return { ...state, isCopied: action.isCopied };
    case "setError":
      return { ...state, errorMessage: action.errorMessage };
    case "clearError":
      return { ...state, errorMessage: "" };
    default:
      return state;
  }
}

export function useCapstockState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch };
}
