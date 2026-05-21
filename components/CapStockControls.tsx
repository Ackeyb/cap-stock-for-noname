import type { Operation } from "../lib/capstockTypes";
import styles from "./CapStockControls.module.css";

type DocSelectorProps = {
  docList: string[];
  selectedDoc: string;
  onSelectDoc: (docName: string) => void;
  onFetchSelectedDoc: () => void;
};

type FieldEditorProps = {
  fieldList: string[];
  selectedField: string;
  updateValues: string[];
  operation: Operation;
  isDisplayed: boolean;
  onSelectField: (fieldName: string) => void;
  onUpdateValue: (index: number, value: string) => void;
  onSetOperation: (operation: Operation) => void;
  onApply: () => void;
};

type ExtraFieldsPanelProps = {
  fieldList: string[];
  isDisplayed: boolean;
  isVisible: boolean;
  newFieldName: string;
  newFieldValue: string;
  selectedFieldToDelete: string;
  onToggle: () => void;
  onSetNewFieldName: (fieldName: string) => void;
  onSetNewFieldValue: (fieldValue: string) => void;
  onSelectFieldToDelete: (fieldName: string) => void;
  onAddField: () => void;
  onDeleteField: () => void;
};

type PreviewPanelsProps = {
  previewText: string;
  previewHistory: string;
  isMobile: boolean;
};

type SaveCopyActionsProps = {
  isDisplayed: boolean;
  isSaved: boolean;
  isCopied: boolean;
  onSaveData: () => void;
  onCopyToClipboard: () => void;
};

export function PageTitle() {
  return (
    <div className={styles.titleWrap}>
      <h1 className={styles.title}>Cap Management for HANA</h1>
    </div>
  );
}

export function DocSelector({ docList, selectedDoc, onSelectDoc, onFetchSelectedDoc }: DocSelectorProps) {
  return (
    <>
      <div className={styles.compactRow}>
        <label className={styles.label}>データを選択</label>
        <select onChange={(event) => onSelectDoc(event.target.value)} value={selectedDoc} className={styles.docSelect}>
          <option value="">-- データを選択してください --</option>
          {docList.map((docName) => (
            <option key={docName} value={docName}>
              {docName}
            </option>
          ))}
        </select>
        <button onClick={onFetchSelectedDoc} disabled={!selectedDoc} className={styles.inlineButton}>
          表示する
        </button>
      </div>

      <div className={`${styles.hint} ${selectedDoc ? styles.hintHidden : styles.hintVisible}`}>
        ※ 編集するにはデータを選択して「表示する」を押してください
      </div>
    </>
  );
}

export function FieldEditor({
  fieldList,
  selectedField,
  updateValues,
  operation,
  isDisplayed,
  onSelectField,
  onUpdateValue,
  onSetOperation,
  onApply,
}: FieldEditorProps) {
  return (
    <>
      <div className={styles.row}>
        <label className={styles.label}>編集するフィールド</label>
        <select onChange={(event) => onSelectField(event.target.value)} value={selectedField} disabled={!isDisplayed} className={styles.fieldSelect}>
          <option value="">フィールドを選択</option>
          {fieldList.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        {updateValues.map((value, index) => (
          <input
            key={index}
            type="number"
            placeholder="数"
            value={value}
            disabled={!isDisplayed}
            onChange={(event) => onUpdateValue(index, event.target.value)}
            className={styles.numberInput}
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
            className={styles.radioInput}
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
            className={styles.radioInput}
          />
          減
        </label>
        <button onClick={onApply} disabled={!isDisplayed} className={styles.applyButton}>
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
}: ExtraFieldsPanelProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className={styles.toggleButton}
      >
        {isVisible ? "▲ 追加・削除を閉じる" : "▼ 追加・削除を表示"}
      </button>

      {isVisible && (
        <div className={styles.extraPanel}>
          <div className={styles.row}>
            <label className={styles.label}>追加するフィールド</label>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="フィールド名"
                value={newFieldName}
                onChange={(event) => onSetNewFieldName(event.target.value)}
                className={styles.textInput}
              />
              <input
                type="number"
                placeholder="数"
                value={newFieldValue}
                onChange={(event) => onSetNewFieldValue(event.target.value)}
                className={styles.smallInput}
              />
              <button onClick={onAddField} className={styles.panelButton}>
                追加
              </button>
            </div>
          </div>

          <div>
            <label className={styles.label}>削除するフィールド</label>
            <div className={styles.fieldGroup}>
              <select
                onChange={(event) => onSelectFieldToDelete(event.target.value)}
                value={selectedFieldToDelete}
                disabled={!isDisplayed}
                className={styles.textInput}
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
                className={styles.panelButton}
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

export function PreviewPanels({ previewText, previewHistory, isMobile }: PreviewPanelsProps) {
  return (
    <div className={styles.previewLayout}>
      <div className={styles.previewColumn}>
        <label className={styles.label}>プレビュー</label>
        <textarea value={previewText} readOnly rows={isMobile ? 10 : 18} className={styles.textarea} />
      </div>
      <div className={styles.historyColumn}>
        <label className={styles.label}>履歴</label>
        <textarea value={previewHistory} readOnly rows={isMobile ? 10 : 18} className={styles.textarea} />
      </div>
    </div>
  );
}

export function SaveCopyActions({ isDisplayed, isSaved, isCopied, onSaveData, onCopyToClipboard }: SaveCopyActionsProps) {
  return (
    <>
      <div className={styles.actionRow}>
        <button onClick={onSaveData} disabled={!isDisplayed} className={styles.primaryAction}>
          データを保存
        </button>
        {isSaved && <span className={styles.successText}>保存しました</span>}
      </div>

      <div className={styles.copyRow}>
        <button onClick={onCopyToClipboard} disabled={!isSaved} className={styles.primaryAction}>
          テキストをコピー
        </button>
        {isCopied && <span className={styles.successText}>コピー完了</span>}
      </div>
    </>
  );
}
