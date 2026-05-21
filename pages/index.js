import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const INITIAL_UPDATE_VALUES = ["", "", "", "", ""];
const MINUS_FIELD_NAME = "マイナス";

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
      const querySnapshot = await getDocs(collection(db, "capstock"));
      let docs = querySnapshot.docs.map((snapshot) => snapshot.id).sort().reverse();

      if (docs.length > 20) {
        for (let i = 20; i < docs.length; i++) {
          await deleteDoc(doc(db, "capstock", docs[i]));
        }
        docs = docs.slice(0, 20);
      }

      setDocList(docs);
    };

    fetchDocs();
  }, []);

  const formatPreview = (data, baseData = {}) =>
    Object.entries(data)
      .map(([key, value]) => {
        const baseValue = baseData[key] ?? value;
        const diff = value - baseValue;
        const diffText = diff === 0 ? "" : ` (${diff > 0 ? "+" : ""}${diff})`;
        return `${key}: ${value}${diffText}`;
      })
      .join("\n");

  const fetchSelectedDoc = async () => {
    if (!selectedDoc) {
      console.error("データが選択されていません");
      return;
    }

    try {
      const docRef = doc(db, "capstock", selectedDoc);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn("データが見つかりません:", selectedDoc);
        setTempData({});
        setPreviewText("データが見つかりません");
        setFieldList([]);
        setIsDisplayed(false);
        return;
      }

      const data = docSnap.data();
      const orderedKeys = data._order || Object.keys(data);
      const visibleKeys = orderedKeys.filter((key) => key !== "_order");
      const sortedData = Object.fromEntries(visibleKeys.map((key) => [key, data[key]]));

      setTempData(sortedData);
      setBaseDataForDiff(sortedData);
      setFieldList(visibleKeys);
      setPreviewText(visibleKeys.map((key) => `${key}: ${data[key]}`).join("\n"));
      setPreviewHistory("");
      setIsSaved(false);
      setIsDisplayed(true);
    } catch (error) {
      console.error("データ取得中にエラーが発生しました:", error);
    }
  };

  const handleUpdateFieldMultiple = () => {
    if (!selectedField) return;

    const updatedData = { ...tempData };
    const historyEntries = [];

    updateValues.forEach((value) => {
      if (value === "") return;

      const oldValue = updatedData[selectedField] || 0;
      let newValue = operation === "increase" ? oldValue + Number(value) : oldValue - Number(value);

      if (newValue < 0 && selectedField !== MINUS_FIELD_NAME) {
        const minusChange = newValue;
        updatedData[MINUS_FIELD_NAME] = (updatedData[MINUS_FIELD_NAME] || 0) + minusChange;
        newValue = 0;
        historyEntries.push(
          `${MINUS_FIELD_NAME}: ${tempData[MINUS_FIELD_NAME] || 0} -> ${updatedData[MINUS_FIELD_NAME]} (${minusChange})`
        );
      }

      updatedData[selectedField] = newValue;

      const fieldChange = newValue - oldValue;
      historyEntries.push(
        `${selectedField}: ${oldValue} -> ${newValue} (${fieldChange >= 0 ? `+${fieldChange}` : fieldChange})`
      );
    });

    setTempData(updatedData);
    setPreviewText(formatPreview(updatedData, baseDataForDiff));
    setPreviewHistory((prev) => prev + (prev ? "\n" : "") + historyEntries.join("\n"));
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

    const numericValue = Number(newFieldValue);
    const updatedData = { ...tempData, [newFieldName]: numericValue };

    setTempData(updatedData);
    setFieldList(Object.keys(updatedData));
    setPreviewText(formatPreview(updatedData, baseDataForDiff));
    setPreviewHistory((prevHistory) => prevHistory + (prevHistory ? "\n" : "") + `追加: ${newFieldName} (${numericValue})`);
    setNewFieldName("");
    setNewFieldValue("");
    setIsSaved(false);
  };

  const handleDeleteField = () => {
    if (!selectedFieldToDelete) return;

    const oldValue = tempData[selectedFieldToDelete];
    const updatedData = { ...tempData };
    delete updatedData[selectedFieldToDelete];

    setTempData(updatedData);
    setFieldList(Object.keys(updatedData));
    setPreviewText(formatPreview(updatedData, baseDataForDiff));
    setPreviewHistory((prevHistory) => prevHistory + (prevHistory ? "\n" : "") + `削除: ${selectedFieldToDelete} (${oldValue})`);
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

    const saveData = { ...tempData };
    saveData._order = Object.keys(saveData).filter((key) => key !== "_order");

    const newDocRef = doc(db, "capstock", newDocName);
    await setDoc(newDocRef, saveData);

    setIsSaved(true);
    setDocList([newDocName, ...docList].slice(0, 20));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <h1
          style={{
            color: "red",
            borderBottom: "2px solid red",
            paddingBottom: "5px",
            fontSize: "1.5rem",
            whiteSpace: "nowrap",
            textAlign: "center",
            marginBottom: "15px",
            marginTop: "20px",
          }}
        >
          Cap Management for HANA
        </h1>
      </div>

      <div style={{ marginBottom: "5px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>データを選択</label>
        <select onChange={(event) => setSelectedDoc(event.target.value)} value={selectedDoc} style={{ width: "60%" }}>
          <option value="">-- データを選択してください --</option>
          {docList.map((docName) => (
            <option key={docName} value={docName}>
              {docName}
            </option>
          ))}
        </select>
        <button onClick={fetchSelectedDoc} disabled={!selectedDoc} style={{ marginLeft: "10px", width: "20%" }}>
          表示する
        </button>
      </div>

      <div
        style={{
          height: "16px",
          marginBottom: "8px",
          fontSize: "11px",
          color: "#aaa",
          opacity: isDisplayed ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
        }}
      >
        ※ 編集するにはデータを選択して「表示する」を押してください
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>編集するフィールド</label>
        <select
          onChange={(event) => setSelectedField(event.target.value)}
          value={selectedField}
          disabled={!isDisplayed}
          style={{ width: "40%" }}
        >
          <option value="">フィールドを選択</option>
          {fieldList.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <input
            key={i}
            type="number"
            placeholder="数"
            value={updateValues[i]}
            disabled={!isDisplayed}
            onChange={(event) => {
              const newValues = [...updateValues];
              newValues[i] = event.target.value;
              setUpdateValues(newValues);
            }}
            style={{ marginLeft: "10px", width: "9%" }}
          />
        ))}
        <label>
          <input
            type="radio"
            name="operation"
            value="increase"
            checked={operation === "increase"}
            disabled={!isDisplayed}
            onChange={() => setOperation("increase")}
            style={{ marginLeft: "10px" }}
          />
          増
        </label>
        <label>
          <input
            type="radio"
            name="operation"
            value="decrease"
            checked={operation === "decrease"}
            disabled={!isDisplayed}
            onChange={() => setOperation("decrease")}
            style={{ marginLeft: "10px" }}
          />
          減
        </label>
        <button onClick={handleUpdateFieldMultiple} disabled={!isDisplayed} style={{ marginLeft: "10px", width: "12%" }}>
          反映
        </button>
      </div>

      <button
        onClick={() => setIsExtraFieldsVisible(!isExtraFieldsVisible)}
        style={{
          marginBottom: "10px",
          padding: "4px 8px",
          fontSize: "12px",
          lineHeight: "1.2",
          cursor: "pointer",
          width: "100%",
          textAlign: "center",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        {isExtraFieldsVisible ? "▲ 追加・削除を閉じる" : "▼ 追加・削除を表示"}
      </button>

      {isExtraFieldsVisible && (
        <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>追加するフィールド</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                placeholder="フィールド名"
                value={newFieldName}
                onChange={(event) => setNewFieldName(event.target.value)}
                style={{ flex: "1", padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
              <input
                type="number"
                placeholder="数"
                value={newFieldValue}
                onChange={(event) => setNewFieldValue(event.target.value)}
                style={{ width: "80px", padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
              <button onClick={handleAddField} style={{ padding: "8px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc" }}>
                追加
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>削除するフィールド</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select
                onChange={(event) => setSelectedFieldToDelete(event.target.value)}
                value={selectedFieldToDelete}
                disabled={!isDisplayed}
                style={{ flex: "1", padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}
              >
                <option value="">削除するフィールドを選択</option>
                {fieldList.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDeleteField}
                disabled={!isDisplayed}
                style={{ padding: "8px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc" }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginBottom: "15px" }}>
        <div style={{ width: "40%" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>プレビュー</label>
          <textarea value={previewText} readOnly rows={isMobile ? 10 : 18} style={{ width: "100%", marginTop: "5px" }} />
        </div>
        <div style={{ width: "56%" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>履歴</label>
          <textarea value={previewHistory} readOnly rows={isMobile ? 10 : 18} style={{ width: "100%", marginTop: "5px" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <button onClick={handleSaveData} disabled={!isDisplayed} style={{ width: "40%" }}>
          データを保存
        </button>
        {isSaved && <span style={{ marginLeft: "10px", color: "limegreen" }}>保存しました</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={handleCopyToClipboard} disabled={!isSaved} style={{ width: "40%" }}>
          テキストをコピー
        </button>
        {isCopied && <span style={{ marginLeft: "10px", color: "limegreen" }}>コピー完了</span>}
      </div>
    </div>
  );
}
