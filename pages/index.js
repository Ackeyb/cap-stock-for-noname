import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import {
  DocSelector,
  ExtraFieldsPanel,
  FieldEditor,
  PageTitle,
  PreviewPanels,
  SaveCopyActions,
} from "../components/CapStockControls";
import {
  INITIAL_UPDATE_VALUES,
  addFieldValue,
  appendHistory,
  applyFieldUpdates,
  buildSaveData,
  deleteFieldValue,
  formatPlainPreview,
  formatPreview,
  getOrderedVisibleData,
} from "../lib/capstockLogic";
import { fetchCapstockDoc, fetchRecentCapstockDocIds, saveCapstockDoc } from "../lib/capstockService";

export default function Home() {
  const [docList, setDocList] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewHistory, setPreviewHistory] = useState("");
  const [fieldList, setFieldList] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [updateValues, setUpdateValues] = useState(INITIAL_UPDATE_VALUES);
  const [operation, setOperation] = useState("increase");
  const [isSaved, setIsSaved] = useState(false);
  const [isDisplayed, setIsDisplayed] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [selectedFieldToDelete, setSelectedFieldToDelete] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [tempData, setTempData] = useState({});
  const [isExtraFieldsVisible, setIsExtraFieldsVisible] = useState(false);
  const [baseDataForDiff, setBaseDataForDiff] = useState({});

  useEffect(() => {
    document.body.style.backgroundColor = "#121212";
    document.body.style.color = "#ffffff";

    const fetchDocs = async () => {
      setDocList(await fetchRecentCapstockDocIds());
    };

    fetchDocs();
  }, []);

  const fetchSelectedDoc = async () => {
    if (!selectedDoc) {
      console.error("データが選択されていません");
      return;
    }

    try {
      const data = await fetchCapstockDoc(selectedDoc);

      if (!data) {
        console.warn("データが見つかりません:", selectedDoc);
        setTempData({});
        setPreviewText("データが見つかりません");
        setFieldList([]);
        setIsDisplayed(false);
        return;
      }

      const { fieldList: visibleKeys, values: sortedData } = getOrderedVisibleData(data);

      setTempData(sortedData);
      setBaseDataForDiff(sortedData);
      setFieldList(visibleKeys);
      setPreviewText(formatPlainPreview(sortedData));
      setPreviewHistory("");
      setIsSaved(false);
      setIsDisplayed(true);
    } catch (error) {
      console.error("データ取得中にエラーが発生しました:", error);
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

    setTempData(updatedData);
    setPreviewText(formatPreview(updatedData, baseDataForDiff));
    setPreviewHistory((prev) => appendHistory(prev, historyEntries));
    setUpdateValues(INITIAL_UPDATE_VALUES);
    setIsSaved(false);
  };

  const handleCopyToClipboard = () => {
    if (!isSaved) return;

    const footerText = "\n\n管理ツールはこちら https://cap-stock-for-noname.vercel.app/";
    const textToCopy = previewText + footerText;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleAddField = () => {
    if (!newFieldName || newFieldValue === "") return;

    const { data: updatedData, historyEntry } = addFieldValue(tempData, newFieldName, newFieldValue);

    setTempData(updatedData);
    setFieldList(Object.keys(updatedData));
    setPreviewText(formatPreview(updatedData, baseDataForDiff));
    setPreviewHistory((prevHistory) => appendHistory(prevHistory, historyEntry));
    setNewFieldName("");
    setNewFieldValue("");
    setIsSaved(false);
  };

  const handleDeleteField = () => {
    if (!selectedFieldToDelete) return;

    const { data: updatedData, historyEntry } = deleteFieldValue(tempData, selectedFieldToDelete);

    setTempData(updatedData);
    setFieldList(Object.keys(updatedData));
    setPreviewText(formatPreview(updatedData, baseDataForDiff));
    setPreviewHistory((prevHistory) => appendHistory(prevHistory, historyEntry));
    setSelectedFieldToDelete("");
    setIsSaved(false);
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

    await saveCapstockDoc(newDocName, buildSaveData(tempData));

    setIsSaved(true);
    setDocList([newDocName, ...docList].slice(0, 20));
  };

  return (
    <div>
      <PageTitle />
      <DocSelector docList={docList} selectedDoc={selectedDoc} onSelectDoc={setSelectedDoc} onFetchSelectedDoc={fetchSelectedDoc} />
      <FieldEditor
        fieldList={fieldList}
        selectedField={selectedField}
        updateValues={updateValues}
        operation={operation}
        isDisplayed={isDisplayed}
        onSelectField={setSelectedField}
        onUpdateValue={(index, value) => {
          const newValues = [...updateValues];
          newValues[index] = value;
          setUpdateValues(newValues);
        }}
        onSetOperation={setOperation}
        onApply={handleUpdateFieldMultiple}
      />
      <ExtraFieldsPanel
        fieldList={fieldList}
        isDisplayed={isDisplayed}
        isVisible={isExtraFieldsVisible}
        newFieldName={newFieldName}
        newFieldValue={newFieldValue}
        selectedFieldToDelete={selectedFieldToDelete}
        onToggle={() => setIsExtraFieldsVisible(!isExtraFieldsVisible)}
        onSetNewFieldName={setNewFieldName}
        onSetNewFieldValue={setNewFieldValue}
        onSelectFieldToDelete={setSelectedFieldToDelete}
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
