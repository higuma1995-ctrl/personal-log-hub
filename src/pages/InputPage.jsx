import { useState } from "react";
import { createLogItem, isGasConfigured } from "../api/logApi.js";

const TAGS = [
  "実装",
  "設計",
  "バグ",
  "調査",
  "公開",
  "環境構築",
  "仕様",
  "リファクタ",
  "達成",
  "停滞",
  "疲労",
  "集中",
  "迷い",
  "気づき",
  "日常",
  "体調",
  "筋トレ",
  "読書",
  "振り返り",
];

const STATUS_OPTIONS = ["", "完了", "中断", "継続"];

function createEmptyForm() {
  return {
    date: getTodayString(),
    title: "",
    tag: [],
    mood: "",
    duration: "",
    status: "",
    content: "",
  };
}

function getTodayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function InputPage() {
  const [mode, setMode] = useState("form");
  const [form, setForm] = useState(createEmptyForm);
  const [pasteText, setPasteText] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toggleTag(tag) {
    setForm((current) => {
      const nextTags = current.tag.includes(tag)
        ? current.tag.filter((item) => item !== tag)
        : [...current.tag, tag];

      return {
        ...current,
        tag: nextTags,
      };
    });
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setStatusMessage("");
    setIsConfirming(false);
  }

  function handleParse() {
    setError("");
    setStatusMessage("");

    const parsed = parsePastedLog(pasteText);

    if (!parsed) {
      setError("フォーマット通りに入力してください。フォーム入力に誘導します。");
      setMode("form");
      setIsConfirming(false);
      return;
    }

    setForm(parsed);
    setMode("form");
    setIsConfirming(true);
  }

  function handleConfirm(event) {
    event.preventDefault();
    setError("");
    setStatusMessage("");

    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      setIsConfirming(false);
      return;
    }

    setIsConfirming(true);
  }

  async function handleSubmit() {
    setError("");
    setStatusMessage("");

    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      setIsConfirming(false);
      return;
    }

    if (!isGasConfigured()) {
      setError("VITE_GAS_URLが未設定です。");
      return;
    }

    try {
      setIsSubmitting(true);
      await createLogItem({
        ...form,
        tag: form.tag.join(","),
      });
      setForm(createEmptyForm());
      setPasteText("");
      setIsConfirming(false);
      setStatusMessage("記録しました。");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="pageSection" aria-labelledby="input-title">
      <div className="sectionHeader">
        <h2 id="input-title">入力画面</h2>
        <p>フォーム入力または貼り付け入力で記録します。</p>
      </div>

      <div className="modeTabs" aria-label="入力モード">
        <button
          className={mode === "form" ? "active" : ""}
          type="button"
          onClick={() => switchMode("form")}
        >
          フォーム入力
        </button>
        <button
          className={mode === "paste" ? "active" : ""}
          type="button"
          onClick={() => switchMode("paste")}
        >
          貼り付け入力
        </button>
      </div>

      {mode === "paste" ? (
        <div className="logForm">
          <label className="field">
            <span>貼り付けテキスト</span>
            <textarea
              value={pasteText}
              onChange={(event) => setPasteText(event.target.value)}
              placeholder="- date: YYYY-MM-DD&#10;- title: 一言タイトル&#10;- tag: 実装,達成&#10;- mood: 集中&#10;- duration: 30&#10;- status: 完了&#10;- content: |&#10;    内容"
              rows="12"
            />
          </label>

          {error ? <p className="message error">{error}</p> : null}
          {statusMessage ? <p className="message success">{statusMessage}</p> : null}

          <button className="primaryButton" type="button" onClick={handleParse}>
            パース
          </button>
        </div>
      ) : null}

      {mode === "form" && !isConfirming ? (
        <form className="logForm" onSubmit={handleConfirm}>
          <LogFields form={form} onFieldChange={updateField} onTagToggle={toggleTag} />

          {error ? <p className="message error">{error}</p> : null}
          {statusMessage ? <p className="message success">{statusMessage}</p> : null}

          <button className="primaryButton" type="submit">
            確認
          </button>
        </form>
      ) : null}

      {mode === "form" && isConfirming ? (
        <div className="logForm">
          <Confirmation form={form} />

          {error ? <p className="message error">{error}</p> : null}
          {statusMessage ? <p className="message success">{statusMessage}</p> : null}

          <div className="buttonRow">
            <button className="secondaryButton" type="button" onClick={() => setIsConfirming(false)}>
              修正
            </button>
            <button className="primaryButton" type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "送信中" : "送信"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function LogFields({ form, onFieldChange, onTagToggle }) {
  return (
    <>
      <label className="field">
        <span>date</span>
        <input
          type="date"
          value={form.date}
          onChange={(event) => onFieldChange("date", event.target.value)}
        />
      </label>

      <label className="field">
        <span>title</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => onFieldChange("title", event.target.value)}
          placeholder="一言タイトル"
        />
      </label>

      <fieldset className="tagField">
        <legend>tag</legend>
        <div className="tagGrid">
          {TAGS.map((tag) => (
            <label key={tag} className="tagOption">
              <input
                type="checkbox"
                checked={form.tag.includes(tag)}
                onChange={() => onTagToggle(tag)}
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>mood</span>
        <input
          type="text"
          value={form.mood}
          onChange={(event) => onFieldChange("mood", event.target.value)}
          placeholder="そのときの感情"
        />
      </label>

      <label className="field">
        <span>duration</span>
        <input
          type="number"
          min="0"
          value={form.duration}
          onChange={(event) => onFieldChange("duration", event.target.value)}
          placeholder="分"
        />
      </label>

      <label className="field">
        <span>status</span>
        <select value={form.status} onChange={(event) => onFieldChange("status", event.target.value)}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status || "empty"} value={status}>
              {status || "未選択"}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>content</span>
        <textarea
          value={form.content}
          onChange={(event) => onFieldChange("content", event.target.value)}
          placeholder="内容"
          rows="8"
        />
      </label>
    </>
  );
}

function Confirmation({ form }) {
  return (
    <div className="confirmBox">
      <h3>確認</h3>
      <dl>
        <div>
          <dt>date</dt>
          <dd>{form.date}</dd>
        </div>
        <div>
          <dt>title</dt>
          <dd>{form.title}</dd>
        </div>
        <div>
          <dt>tag</dt>
          <dd>{form.tag.join(",")}</dd>
        </div>
        <div>
          <dt>mood</dt>
          <dd>{form.mood || "未入力"}</dd>
        </div>
        <div>
          <dt>duration</dt>
          <dd>{form.duration || "未入力"}</dd>
        </div>
        <div>
          <dt>status</dt>
          <dd>{form.status || "未選択"}</dd>
        </div>
        <div>
          <dt>content</dt>
          <dd className="preWrap">{form.content}</dd>
        </div>
      </dl>
    </div>
  );
}

function parsePastedLog(value) {
  const normalized = value.replace(/\r\n/g, "\n");
  const match = normalized.match(
    /^- date: (.+)\n- title: (.+)\n- tag: (.+)\n- mood: ?(.*)\n- duration: ?(.*)\n- status: ?(.*)\n- content: \|\n([\s\S]+)$/
  );

  if (!match) {
    return null;
  }

  const [, date, title, tag, mood, duration, status, content] = match;

  return {
    date: date.trim(),
    title: title.trim(),
    tag: tag
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    mood: mood.trim(),
    duration: duration.trim(),
    status: status.trim(),
    content: content
      .split("\n")
      .map((line) => line.replace(/^ {4}/, ""))
      .join("\n")
      .trim(),
  };
}

function validateForm(form) {
  if (!form.date) {
    return "dateを入力してください。";
  }

  if (!form.title.trim()) {
    return "titleを入力してください。";
  }

  if (form.tag.length === 0) {
    return "tagを1つ以上選択してください。";
  }

  if (!form.content.trim()) {
    return "contentを入力してください。";
  }

  return "";
}
