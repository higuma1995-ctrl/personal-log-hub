import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../App.jsx";
import { fetchLogItems, isGasConfigured } from "../api/logApi.js";

export default function ListPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("すべて");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredItems = useMemo(() => {
    if (filter === "すべて") {
      return items;
    }

    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  async function loadItems() {
    setError("");

    if (!isGasConfigured()) {
      setError("VITE_GAS_URLが未設定です。");
      return;
    }

    try {
      setIsLoading(true);
      const nextItems = await fetchLogItems();
      setItems(nextItems);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <section className="pageSection" aria-labelledby="list-title">
      <div className="sectionHeader withAction">
        <div>
          <h2 id="list-title">一覧画面</h2>
          <p>記録を新しい順に確認します。</p>
        </div>
        <button className="secondaryButton" type="button" onClick={loadItems} disabled={isLoading}>
          {isLoading ? "取得中" : "再読み込み"}
        </button>
      </div>

      <label className="field compact">
        <span>フィルター</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="すべて">すべて</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="message error">{error}</p> : null}

      {!error && filteredItems.length === 0 ? (
        <p className="emptyState">表示できる記録はありません。</p>
      ) : null}

      <div className="logList">
        {filteredItems.map((item) => (
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
