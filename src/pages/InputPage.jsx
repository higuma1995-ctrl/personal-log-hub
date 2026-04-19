import { useState } from "react";
import { createLogItem, isGasConfigured } from "../api/logApi.js";
import { GENRE_OPTIONS, createEmptyLog, getGenre } from "../logSchema.js";

const STATUS_OPTIONS = ["", "完了", "中断", "継続"];

export default function InputPage() {
  const [genreKey, setGenreKey] = useState("dev");
  const [mode, setMode] = useState("form");
  const [form, setForm] = useState(() => createEmptyLog("dev"));
  const [pasteText, setPasteText] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genre = getGenre(genreKey);

  function handleGenreChange(nextGenreKey) {
    setGenreKey(nextGenreKey);
    setForm(createEmptyLog(nextGenreKey));
    setPasteText("");
    setError("");
    setStatusMessage("");
    setIsConfirming(false);
  }

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

    const parsed = parsePastedLog(pasteText, genreKey);

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

    const validationError = validateForm(form, genreKey);

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

    const validationError = validateForm(form, genreKey);

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
        genreKey,
        data: form,
      });
      setForm(createEmptyLog(genreKey));
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
        <p>ジャンルを選び、フォーム入力または貼り付け入力で記録します。</p>
      </div>

      <label className="field compact">
        <span>ジャンル</span>
        <select value={genreKey} onChange={(event) => handleGenreChange(event.target.value)}>
          {GENRE_OPTIONS.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

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
              placeholder={getPastePlaceholder(genreKey)}
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
          <LogFields
            form={form}
            genre={genre}
            genreKey={genreKey}
            onFieldChange={updateField}
            onTagToggle={toggleTag}
          />

          {error ? <p className="message error">{error}</p> : null}
          {statusMessage ? <p className="message success">{statusMessage}</p> : null}

          <button className="primaryButton" type="submit">
            確認
          </button>
        </form>
      ) : null}

      {mode === "form" && isConfirming ? (
        <div className="logForm">
          <Confirmation form={form} genreKey={genreKey} />

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

function LogFields({ form, genre, genreKey, onFieldChange, onTagToggle }) {
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

      {genre.tags.length > 0 ? (
        <fieldset className="tagField">
          <legend>tag</legend>
          <div className="tagGrid">
            {genre.tags.map((tag) => (
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
      ) : null}

      <label className="field">
        <span>mood</span>
        <input
          type="text"
          value={form.mood}
          onChange={(event) => onFieldChange("mood", event.target.value)}
          placeholder="そのときの感情"
        />
      </label>

      {genreKey === "dev" ? (
        <>
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
        </>
      ) : null}

      {genreKey === "fitness" ? (
        <>
          <label className="field">
            <span>部位</span>
            <input
              type="text"
              value={form.part}
              onChange={(event) => onFieldChange("part", event.target.value)}
              placeholder="胸、背中、脚など"
            />
          </label>
          <label className="field">
            <span>重量</span>
            <input
              type="number"
              min="0"
              value={form.weight}
              onChange={(event) => onFieldChange("weight", event.target.value)}
              placeholder="kg"
            />
          </label>
          <label className="field">
            <span>回数</span>
            <input
              type="number"
              min="0"
              value={form.reps}
              onChange={(event) => onFieldChange("reps", event.target.value)}
              placeholder="回"
            />
          </label>
          <label className="field">
            <span>セット</span>
            <input
              type="number"
              min="0"
              value={form.sets}
              onChange={(event) => onFieldChange("sets", event.target.value)}
              placeholder="セット"
            />
          </label>
          <label className="field">
            <span>時間</span>
            <input
              type="number"
              min="0"
              value={form.time}
              onChange={(event) => onFieldChange("time", event.target.value)}
              placeholder="分"
            />
          </label>
        </>
      ) : null}

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

function Confirmation({ form, genreKey }) {
  const rows = getConfirmationRows(form, genreKey);

  return (
    <div className="confirmBox">
      <h3>確認</h3>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={label === "content" ? "preWrap" : ""}>{value || "未入力"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function getConfirmationRows(form, genreKey) {
  const baseRows = [
    ["date", form.date],
    ["title", form.title],
  ];

  if (genreKey !== "diary") {
    baseRows.push(["tag", form.tag.join(",")]);
  }

  baseRows.push(["mood", form.mood]);

  if (genreKey === "dev") {
    baseRows.push(["duration", form.duration], ["status", form.status]);
  }

  if (genreKey === "fitness") {
    baseRows.push(
      ["部位", form.part],
      ["重量", form.weight],
      ["回数", form.reps],
      ["セット", form.sets],
      ["時間", form.time]
    );
  }

  baseRows.push(["content", form.content]);
  return baseRows;
}

function parsePastedLog(value, genreKey) {
  const normalized = value.replace(/\r\n/g, "\n");
  const fields = parseFields(normalized);

  if (!fields.content) {
    return null;
  }

  const nextForm = createEmptyLog(genreKey);

  if (!fields.date || !fields.title) {
    return null;
  }

  nextForm.date = fields.date;
  nextForm.title = fields.title;
  nextForm.mood = fields.mood || "";
  nextForm.content = fields.content;

  if (genreKey !== "diary") {
    if (!fields.tag) {
      return null;
    }

    nextForm.tag = fields.tag
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (genreKey === "dev") {
    nextForm.duration = fields.duration || "";
    nextForm.status = fields.status || "";
  }

  if (genreKey === "fitness") {
    nextForm.part = fields["部位"] || "";
    nextForm.weight = fields["重量"] || "";
    nextForm.reps = fields["回数"] || "";
    nextForm.sets = fields["セット"] || "";
    nextForm.time = fields["時間"] || "";
  }

  return nextForm;
}

function parseFields(value) {
  const lines = value.split("\n");
  const fields = {};
  let contentLines = null;

  lines.forEach((line) => {
    if (contentLines) {
      contentLines.push(line.replace(/^ {4}/, ""));
      return;
    }

    const contentMatch = line.match(/^- content: \|$/);

    if (contentMatch) {
      contentLines = [];
      return;
    }

    const match = line.match(/^- ([^:]+): ?(.*)$/);

    if (match) {
      fields[match[1]] = match[2].trim();
    }
  });

  if (contentLines) {
    fields.content = contentLines.join("\n").trim();
  }

  return fields;
}

function validateForm(form, genreKey) {
  if (!form.date) {
    return "dateを入力してください。";
  }

  if (!form.title.trim()) {
    return "titleを入力してください。";
  }

  if (genreKey !== "diary" && form.tag.length === 0) {
    return "tagを1つ以上選択してください。";
  }

  if (!form.content.trim()) {
    return "contentを入力してください。";
  }

  return "";
}

function getPastePlaceholder(genreKey) {
  if (genreKey === "fitness") {
    return "- date: YYYY-MM-DD\n- title: ベンチプレス\n- tag: 胸\n- mood: 集中\n- 部位: 胸\n- 重量: 60\n- 回数: 10\n- セット: 3\n- 時間: \n- content: |\n    内容";
  }

  if (genreKey === "diary") {
    return "- date: YYYY-MM-DD\n- title: 一言タイトル\n- mood: 穏やか\n- content: |\n    内容";
  }

  return "- date: YYYY-MM-DD\n- title: 一言タイトル\n- tag: 実装,達成\n- mood: 集中\n- duration: 30\n- status: 完了\n- content: |\n    内容";
}
