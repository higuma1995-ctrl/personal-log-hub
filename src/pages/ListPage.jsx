import { useEffect, useState } from "react";
import { fetchLogItems, isGasConfigured } from "../api/logApi.js";
import { GENRE_OPTIONS } from "../logSchema.js";

export default function ListPage() {
  const [genreKey, setGenreKey] = useState("dev");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadItems(nextGenreKey = genreKey) {
    setError("");

    if (!isGasConfigured()) {
      setError("VITE_GAS_URLが未設定です。");
      return;
    }

    try {
      setIsLoading(true);
      const nextItems = await fetchLogItems(nextGenreKey);
      setItems(nextItems);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGenreChange(nextGenreKey) {
    setGenreKey(nextGenreKey);
    loadItems(nextGenreKey);
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <section className="pageSection" aria-labelledby="list-title">
      <div className="sectionHeader withAction">
        <div>
          <h2 id="list-title">一覧画面</h2>
          <p>ジャンルごとの記録を新しい順に確認します。</p>
        </div>
        <button className="secondaryButton" type="button" onClick={() => loadItems()} disabled={isLoading}>
          {isLoading ? "取得中" : "再読み込み"}
        </button>
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

      {error ? <p className="message error">{error}</p> : null}

      {!error && items.length === 0 ? (
        <p className="emptyState">表示できる記録はありません。</p>
      ) : null}

      <div className="logList">
        {items.map((item) => (
          <article className="logItem" key={item.id}>
            <div className="logMeta">
              <span>{item.category}</span>
              <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
            </div>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
