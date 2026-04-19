import { useEffect, useMemo, useState } from "react";
import { fetchLogItems, isGasConfigured } from "../api/logApi.js";
import { GENRE_OPTIONS, getGenre } from "../logSchema.js";

const PERIOD_OPTIONS = [
  { value: "all", label: "全期間" },
  { value: "thisMonth", label: "今月" },
  { value: "thisWeek", label: "今週（月曜〜今日）" },
  { value: "last7Days", label: "直近7日" },
  { value: "yearMonth", label: "年月指定" },
  { value: "custom", label: "期間指定" },
];

export default function ListPage() {
  const [genreKey, setGenreKey] = useState("dev");
  const [period, setPeriod] = useState("all");
  const [yearMonth, setYearMonth] = useState(() => ({
    year: String(new Date().getFullYear()),
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
  }));
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const genre = getGenre(genreKey);
  const filteredItems = useMemo(
    () => filterItemsByPeriod(items, period, yearMonth, customRange),
    [items, period, yearMonth, customRange]
  );
  const periodLabel = getPeriodLabel(period, yearMonth, customRange);
  const markdown = useMemo(
    () => buildMarkdown({ genre, items: filteredItems, periodLabel }),
    [genre, filteredItems, periodLabel]
  );

  async function loadItems(nextGenreKey = genreKey) {
    setError("");
    setStatusMessage("");

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

  async function handleCopyMarkdown() {
    setError("");
    setStatusMessage("");

    try {
      await navigator.clipboard.writeText(markdown);
      setStatusMessage("マークダウンをコピーしました。");
    } catch {
      setError("クリップボードへのコピーに失敗しました。");
    }
  }

  function handleDownloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${genre.label}-${periodLabel}.md`.replace(/[\\/]/g, "-");
    anchor.click();
    URL.revokeObjectURL(url);
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

      <div className="filterGrid">
        <label className="field">
          <span>ジャンル</span>
          <select value={genreKey} onChange={(event) => handleGenreChange(event.target.value)}>
            {GENRE_OPTIONS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>期間</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            {PERIOD_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {period === "yearMonth" ? (
          <>
            <label className="field">
              <span>年</span>
              <select
                value={yearMonth.year}
                onChange={(event) => setYearMonth((current) => ({ ...current, year: event.target.value }))}
              >
                {getYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>月</span>
              <select
                value={yearMonth.month}
                onChange={(event) => setYearMonth((current) => ({ ...current, month: event.target.value }))}
              >
                {getMonthOptions().map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {period === "custom" ? (
          <>
            <label className="field">
              <span>開始日</span>
              <input
                type="date"
                value={customRange.start}
                onChange={(event) => setCustomRange((current) => ({ ...current, start: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>終了日</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(event) => setCustomRange((current) => ({ ...current, end: event.target.value }))}
              />
            </label>
          </>
        ) : null}
      </div>

      <div className="exportBox">
        <div>
          <h3>MDエクスポート</h3>
          <p>{filteredItems.length}件を対象にします。</p>
        </div>
        <div className="buttonRow">
          <button className="secondaryButton" type="button" onClick={handleCopyMarkdown}>
            コピー
          </button>
          <button className="secondaryButton" type="button" onClick={handleDownloadMarkdown}>
            .mdダウンロード
          </button>
        </div>
      </div>

      {error ? <p className="message error">{error}</p> : null}
      {statusMessage ? <p className="message success">{statusMessage}</p> : null}

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

function filterItemsByPeriod(items, period, yearMonth, customRange) {
  const today = startOfDay(new Date());

  if (period === "all") {
    return items;
  }

  if (period === "thisMonth") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return filterItemsByDateRange(items, start, today);
  }

  if (period === "thisWeek") {
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const start = addDays(today, -diff);
    return filterItemsByDateRange(items, start, today);
  }

  if (period === "last7Days") {
    return filterItemsByDateRange(items, addDays(today, -6), today);
  }

  if (period === "yearMonth") {
    return items.filter((item) => {
      const date = getItemDate(item);
      return date && date.startsWith(`${yearMonth.year}-${yearMonth.month}`);
    });
  }

  if (period === "custom") {
    const start = customRange.start ? parseDate(customRange.start) : null;
    const end = customRange.end ? parseDate(customRange.end) : null;
    return filterItemsByDateRange(items, start, end);
  }

  return items;
}

function filterItemsByDateRange(items, start, end) {
  return items.filter((item) => {
    const date = parseDate(getItemDate(item));

    if (!date) {
      return false;
    }

    if (start && date < start) {
      return false;
    }

    if (end && date > end) {
      return false;
    }

    return true;
  });
}

function buildMarkdown({ genre, items, periodLabel }) {
  const sections = items.map((item) => {
    const record = item.record || {};
    const lines = [`## ${record.date || formatDateOnly(item.createdAt)} ${record.title || ""}`.trim()];

    if (record.tag) {
      lines.push(`- タグ：${record.tag}`);
    }

    if (record.mood) {
      lines.push(`- 気分：${record.mood}`);
    }

    if (genre.key === "dev") {
      if (record.duration) {
        lines.push(`- 時間：${record.duration}分`);
      }

      if (record.status) {
        lines.push(`- ステータス：${record.status}`);
      }
    }

    lines.push(`- 内容：${record.content || ""}`);
    return lines.join("\n");
  });

  return [`# ${genre.label}ログ｜${periodLabel}`, ...sections].join("\n\n");
}

function getPeriodLabel(period, yearMonth, customRange) {
  if (period === "all") {
    return "全期間";
  }

  if (period === "thisMonth") {
    return "今月";
  }

  if (period === "thisWeek") {
    return "今週（月曜〜今日）";
  }

  if (period === "last7Days") {
    return "直近7日";
  }

  if (period === "yearMonth") {
    return `${yearMonth.year}-${yearMonth.month}`;
  }

  if (period === "custom") {
    return `${customRange.start || "開始日未指定"}〜${customRange.end || "終了日未指定"}`;
  }

  return "全期間";
}

function getItemDate(item) {
  return item.record?.date || formatDateOnly(item.createdAt);
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

function formatDateOnly(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => String(currentYear - index));
}

function getMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
}
