export function PageTitle() {
  return (
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
  );
}

export function DocSelector({ docList, selectedDoc, onSelectDoc, onFetchSelectedDoc }) {
  return (
    <>
      <div style={{ marginBottom: "5px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>データを選択</label>
        <select onChange={(event) => onSelectDoc(event.target.value)} value={selectedDoc} style={{ width: "60%" }}>
          <option value="">-- データを選択してください --</option>
          {docList.map((docName) => (
            <option key={docName} value={docName}>
              {docName}
            </option>
          ))}
        </select>
        <button onClick={onFetchSelectedDoc} disabled={!selectedDoc} style={{ marginLeft: "10px", width: "20%" }}>
          表示する
        </button>
      </div>

      <div
        style={{
          height: "16px",
          marginBottom: "8px",
          fontSize: "11px",
          color: "#aaa",
          opacity: selectedDoc ? 0 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
        }}
      >
        ※ 編集するにはデータを選択して「表示する」を押してください
      </div>
    </>
  );
}

export function FieldEditor({ fieldList, selectedField, updateValues, operation, isDisplayed, onSelectField, onUpdateValue, onSetOperation, onApply }) {
  return (
    <>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>編集するフィールド</label>
        <select onChange={(event) => onSelectField(event.target.value)} value={selectedField} disabled={!isDisplayed} style={{ width: "40%" }}>
          <option value="">フィールドを選択</option>
          {fieldList.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        {updateValues.map((value, index) => (
          <input
            key={index}
            type="number"
            placeholder="数"
            value={value}
            disabled={!isDisplayed}
            onChange={(event) => onUpdateValue(index, event.target.value)}
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
            onChange={() => onSetOperation("increase")}
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
            onChange={() => onSetOperation("decrease")}
            style={{ marginLeft: "10px" }}
          />
          減
        </label>
        <button onClick={onApply} disabled={!isDisplayed} style={{ marginLeft: "10px", width: "12%" }}>
          反映
        </button>
      </div>
    </>
  );
}

export function ExtraFieldsPanel({
  fieldList,
  isDisplayed,
  isVisible,
  newFieldName,
  newFieldValue,
  selectedFieldToDelete,
  onToggle,
  onSetNewFieldName,
  onSetNewFieldValue,
  onSelectFieldToDelete,
  onAddField,
  onDeleteField,
}) {
  return (
    <>
      <button
        onClick={onToggle}
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
        {isVisible ? "▲ 追加・削除を閉じる" : "▼ 追加・削除を表示"}
      </button>

      {isVisible && (
        <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>追加するフィールド</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                placeholder="フィールド名"
                value={newFieldName}
                onChange={(event) => onSetNewFieldName(event.target.value)}
                style={{ flex: "1", padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
              <input
                type="number"
                placeholder="数"
                value={newFieldValue}
                onChange={(event) => onSetNewFieldValue(event.target.value)}
                style={{ width: "80px", padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
              <button onClick={onAddField} style={{ padding: "8px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc" }}>
                追加
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>削除するフィールド</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select
                onChange={(event) => onSelectFieldToDelete(event.target.value)}
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
                onClick={onDeleteField}
                disabled={!isDisplayed}
                style={{ padding: "8px", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc" }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PreviewPanels({ previewText, previewHistory, isMobile }) {
  return (
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
  );
}

export function SaveCopyActions({ isDisplayed, isSaved, isCopied, onSaveData, onCopyToClipboard }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <button onClick={onSaveData} disabled={!isDisplayed} style={{ width: "40%" }}>
          データを保存
        </button>
        {isSaved && <span style={{ marginLeft: "10px", color: "limegreen" }}>保存しました</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={onCopyToClipboard} disabled={!isSaved} style={{ width: "40%" }}>
          テキストをコピー
        </button>
        {isCopied && <span style={{ marginLeft: "10px", color: "limegreen" }}>コピー完了</span>}
      </div>
    </>
  );
}
