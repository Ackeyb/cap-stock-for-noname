import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import {
  DocSelector,
  ErrorMessage,
  ExtraFieldsPanel,
  FieldEditor,
  PageTitle,
  PreviewPanels,
  SaveCopyActions,
} from "../components/CapStockControls";
import {
  addFieldValue,
  applyFieldUpdates,
  buildSaveData,
  deleteFieldValue,
  formatPreview,
  getOrderedVisibleData,
} from "../lib/capstockLogic";
import { fetchCapstockDoc, fetchRecentCapstockDocIds, saveCapstockDoc } from "../lib/capstockService";
import { useCapstockState } from "../hooks/useCapstockState";

const LOAD_ERROR_MESSAGE = "データ一覧の取得に失敗しました。Firebase の環境変数を確認してください。";

export default function Home() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { state, dispatch } = useCapstockState();
  const {
    docList,
    selectedDoc,
    previewText,
    previewHistory,
    fieldList,
    selectedField,
    updateValues,
    operation,
    isSaved,
    isDisplayed,
    newFieldName,
    newFieldValue,
    selectedFieldToDelete,
    isCopied,
    errorMessage,
    tempData,
    isExtraFieldsVisible,
    baseDataForDiff,
  } = state;

  useEffect(() => {
    document.body.style.backgroundColor = "#121212";
    document.body.style.color = "#ffffff";

    const fetchDocs = async () => {
      try {
        dispatch({ type: "setDocList", docList: await fetchRecentCapstockDocIds() });
      } catch {
        dispatch({ type: "setError", errorMessage: LOAD_ERROR_MESSAGE });
      }
    };

    fetchDocs();
  }, [dispatch]);

  const fetchSelectedDoc = async () => {
    if (!selectedDoc) {
      dispatch({ type: "setError", errorMessage: "データを選択してください。" });
      return;
    }

    try {
      const data = await fetchCapstockDoc(selectedDoc);

      if (!data) {
        dispatch({ type: "docMissing" });
        return;
      }

      const { fieldList: visibleKeys, values: sortedData } = getOrderedVisibleData(data);
      dispatch({ type: "docLoaded", data: sortedData, fieldList: visibleKeys });
    } catch {
      dispatch({ type: "setError", errorMessage: "データ取得中にエラーが発生しました。" });
    }
  };

  const handleUpdateFieldMultiple = () => {
    if (!selectedField) return;

    const { data: updatedData, historyEntries } = applyFieldUpdates({
      data: tempData,
      selectedField,
      updateValues,
      operation,
    });

    dispatch({
      type: "dataEdited",
      data: updatedData,
      previewText: formatPreview(updatedData, baseDataForDiff),
      historyEntries,
      resetUpdateValues: true,
    });
  };

  const handleCopyToClipboard = () => {
    if (!isSaved) return;

    const footerText = "\n\n管理ツールはこちら https://cap-stock-for-noname.vercel.app/";
    const textToCopy = previewText + footerText;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        dispatch({ type: "copied", isCopied: true });
        setTimeout(() => dispatch({ type: "copied", isCopied: false }), 2000);
      })
      .catch(() => {
        dispatch({ type: "setError", errorMessage: "クリップボードへのコピーに失敗しました。" });
      });
  };

  const handleAddField = () => {
    if (!newFieldName || newFieldValue === "") return;

    const { data: updatedData, historyEntry } = addFieldValue(tempData, newFieldName, newFieldValue);

    dispatch({
      type: "dataEdited",
      data: updatedData,
      previewText: formatPreview(updatedData, baseDataForDiff),
      historyEntries: historyEntry,
    });
    dispatch({ type: "clearNewField" });
  };

  const handleDeleteField = () => {
    if (!selectedFieldToDelete) return;

    const { data: updatedData, historyEntry } = deleteFieldValue(tempData, selectedFieldToDelete);

    dispatch({
      type: "dataEdited",
      data: updatedData,
      previewText: formatPreview(updatedData, baseDataForDiff),
      historyEntries: historyEntry,
    });
    dispatch({ type: "clearFieldToDelete" });
  };

  const handleSaveData = async () => {
    if (!selectedDoc || !isDisplayed) return;

    const baseTimestamp = new Date();
    baseTimestamp.setHours(baseTimestamp.getHours() + 9);
    const jstTimestamp = baseTimestamp.toISOString().split("T")[0];
    let newDocName = jstTimestamp;
    let counter = 1;

    while (docList.includes(newDocName)) {
      newDocName = `${jstTimestamp}-${counter}`;
      counter++;
    }

    try {
      await saveCapstockDoc(newDocName, buildSaveData(tempData));
      dispatch({ type: "saved", docName: newDocName });
    } catch {
      dispatch({ type: "setError", errorMessage: "データ保存中にエラーが発生しました。" });
    }
  };

  return (
    <div>
      <PageTitle />
      <DocSelector
        docList={docList}
        selectedDoc={selectedDoc}
        onSelectDoc={(docName) => dispatch({ type: "selectDoc", selectedDoc: docName })}
        onFetchSelectedDoc={fetchSelectedDoc}
      />
      <ErrorMessage message={errorMessage} />
      <FieldEditor
        fieldList={fieldList}
        selectedField={selectedField}
        updateValues={updateValues}
        operation={operation}
        isDisplayed={isDisplayed}
        onSelectField={(fieldName) => dispatch({ type: "selectField", selectedField: fieldName })}
        onUpdateValue={(index, value) => dispatch({ type: "setUpdateValue", index, value })}
        onSetOperation={(nextOperation) => dispatch({ type: "setOperation", operation: nextOperation })}
        onApply={handleUpdateFieldMultiple}
      />
      <ExtraFieldsPanel
        fieldList={fieldList}
        isDisplayed={isDisplayed}
        isVisible={isExtraFieldsVisible}
        newFieldName={newFieldName}
        newFieldValue={newFieldValue}
        selectedFieldToDelete={selectedFieldToDelete}
        onToggle={() => dispatch({ type: "toggleExtraFields" })}
        onSetNewFieldName={(fieldName) => dispatch({ type: "setNewFieldName", newFieldName: fieldName })}
        onSetNewFieldValue={(fieldValue) => dispatch({ type: "setNewFieldValue", newFieldValue: fieldValue })}
        onSelectFieldToDelete={(fieldName) => dispatch({ type: "selectFieldToDelete", selectedFieldToDelete: fieldName })}
        onAddField={handleAddField}
        onDeleteField={handleDeleteField}
      />
      <PreviewPanels previewText={previewText} previewHistory={previewHistory} isMobile={isMobile} />
      <SaveCopyActions
        isDisplayed={isDisplayed}
        isSaved={isSaved}
        isCopied={isCopied}
        onSaveData={handleSaveData}
        onCopyToClipboard={handleCopyToClipboard}
      />
    </div>
  );
}
