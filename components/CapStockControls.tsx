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

type ErrorMessageProps = {
  message: string;
};

export const appShellClassName = styles.appShell;

export function PageTitle() {
  return (
    <div className={styles.titleWrap}>
      <h1 className={styles.title}>Cap Management for HANA</h1>
    </div>
  );
}

export function DocSelector({ docList, selectedDoc, onSelectDoc, onFetchSelectedDoc }: DocSelectorProps) {
  return (
    <section className={styles.section}>
      <label className={styles.label}>データ</label>
      <div className={styles.docRow}>
        <select onChange={(event) => onSelectDoc(event.target.value)} value={selectedDoc} className={styles.control}>
          <option value="">選択してください</option>
          {docList.map((docName) => (
            <option key={docName} value={docName}>
              {docName}
            </option>
          ))}
        </select>
        <button onClick={onFetchSelectedDoc} disabled={!selectedDoc} className={styles.button}>
          表示
        </button>
      </div>

      <div className={`${styles.hint} ${selectedDoc ? styles.hintHidden : styles.hintVisible}`}>
        編集するにはデータを選択して表示してください
      </div>
    </section>
  );
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return <div className={styles.errorMessage}>{message}</div>;
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
    <section className={styles.section}>
      <label className={styles.label}>編集フィールド</label>
      <select onChange={(event) => onSelectField(event.target.value)} value={selectedField} disabled={!isDisplayed} className={styles.control}>
        <option value="">フィールドを選択</option>
        {fieldList.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>

      <div className={styles.updateRow}>
        {updateValues.map((value, index) => (
          <input
            key={index}
            type="number"
            inputMode="numeric"
            aria-label={`変更数 ${index + 1}`}
            placeholder="0"
            value={value}
            disabled={!isDisplayed}
            onChange={(event) => onUpdateValue(index, event.target.value)}
            className={styles.control}
          />
        ))}
        <label className={styles.radioButton}>
          <input type="radio" name="operation" value="increase" checked={operation === "increase"} disabled={!isDisplayed} onChange={() => onSetOperation("increase")} />
          <span>増</span>
        </label>
        <label className={styles.radioButton}>
          <input type="radio" name="operation" value="decrease" checked={operation === "decrease"} disabled={!isDisplayed} onChange={() => onSetOperation("decrease")} />
          <span>減</span>
        </label>
        <button onClick={onApply} disabled={!isDisplayed} className={styles.button}>
          反映
        </button>
      </div>
    </section>
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
    <section className={styles.section}>
      <button onClick={onToggle} className={styles.toggleButton}>
        {isVisible ? "追加・削除を閉じる" : "追加・削除を表示"}
      </button>

      {isVisible && (
        <div className={styles.extraPanel}>
          <label className={styles.label}>追加</label>
          <div className={styles.addRow}>
            <input type="text" placeholder="フィールド名" value={newFieldName} onChange={(event) => onSetNewFieldName(event.target.value)} className={styles.control} />
            <input type="number" inputMode="numeric" placeholder="数" value={newFieldValue} onChange={(event) => onSetNewFieldValue(event.target.value)} className={styles.control} />
            <button onClick={onAddField} className={styles.button}>
              追加
            </button>
          </div>

          <label className={styles.label}>削除</label>
          <div className={styles.deleteRow}>
            <select onChange={(event) => onSelectFieldToDelete(event.target.value)} value={selectedFieldToDelete} disabled={!isDisplayed} className={styles.control}>
              <option value="">削除するフィールド</option>
              {fieldList.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
            <button onClick={onDeleteField} disabled={!isDisplayed} className={styles.button}>
              削除
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function PreviewPanels({ previewText, previewHistory, isMobile }: PreviewPanelsProps) {
  return (
    <section className={styles.previewLayout}>
      <div className={styles.previewColumn}>
        <label className={styles.label}>プレビュー</label>
        <textarea value={previewText} readOnly rows={isMobile ? 10 : 18} className={styles.textarea} />
      </div>
      <div className={styles.historyColumn}>
        <label className={styles.label}>履歴</label>
        <textarea value={previewHistory} readOnly rows={isMobile ? 10 : 18} className={styles.textarea} />
      </div>
    </section>
  );
}

export function SaveCopyActions({ isDisplayed, isSaved, isCopied, onSaveData, onCopyToClipboard }: SaveCopyActionsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.actionRow}>
        <button onClick={onSaveData} disabled={!isDisplayed} className={styles.button}>
          保存
        </button>
        {isSaved && <span className={styles.successText}>保存しました</span>}
      </div>

      <div className={styles.actionRow}>
        <button onClick={onCopyToClipboard} disabled={!isSaved} className={styles.button}>
          コピー
        </button>
        {isCopied && <span className={styles.successText}>コピー完了</span>}
      </div>
    </section>
  );
}
