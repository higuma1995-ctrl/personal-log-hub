import { useState } from "react";
import { CATEGORIES } from "../App.jsx";
import { createLogItem, isGasConfigured } from "../api/logApi.js";

export default function InputPage() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    const trimmedText = text.trim();

    if (!isGasConfigured()) {
      setError("VITE_GAS_URLが未設定です。");
      return;
    }

    if (!trimmedText) {
      setError("記録本文を入力してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      await createLogItem({ category, text: trimmedText });
      setText("");
      setStatus("記録しました。");
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
        <p>カテゴリを選び、今日の記録を残します。</p>
      </div>

      <form className="logForm" onSubmit={handleSubmit}>
        <label className="field">
          <span>カテゴリ</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>テキスト</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="記録したいことを入力"
            rows="8"
          />
        </label>

        {error ? <p className="message error">{error}</p> : null}
        {status ? <p className="message success">{status}</p> : null}

        <button className="primaryButton" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中" : "送信"}
        </button>
      </form>
    </section>
  );
}
