import { gasUrl } from "../config.js";

const HEADERS = ["timestamp", "date", "title", "tag", "mood", "duration", "status", "content"];

export function isGasConfigured() {
  return Boolean(gasUrl);
}

export async function createLogItem({ date, title, tag, mood, duration, status, content }) {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  const values = [date, title, tag, mood, duration, status, content].map(toCsvValue).join(",");
  const url = buildGasUrl({
    action: "post",
    sheet: getCurrentYearSheet(),
    headers: HEADERS.join(","),
    values,
  });
  logGasUrlDebug(url);

  await fetch(url, {
    method: "GET",
    mode: "no-cors",
  });

  return null;
}

export async function fetchLogItems() {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  const url = buildGasUrl({ action: "get", sheet: getCurrentYearSheet() });
  logGasUrlDebug(url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("取得に失敗しました。");
  }

  const data = await response.json();

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return mapRowsToItems(data.headers, data.rows);
}

function getCurrentYearSheet() {
  return String(new Date().getFullYear());
}

function mapRowsToItems(headers, rows) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row, index) => {
      const record = Object.fromEntries(headers.map((header, headerIndex) => [header, row[headerIndex]]));
      const createdAt = record.timestamp || record.date || "";

      return {
        id: `${createdAt}-${index}`,
        category: record.tag || "",
        text: record.content || "",
        createdAt,
      };
    })
    .filter((item) => item.createdAt || item.text);
}

function buildGasUrl(params) {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  const separator = gasUrl.includes("?") ? "&" : "?";

  return `${gasUrl}${separator}${query}`;
}

function toCsvValue(value) {
  const text = String(value ?? "");

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function logGasUrlDebug(url) {
  const baseUrl = url.split("?")[0];
  const endsWithExec = baseUrl.endsWith("/exec");

  console.log("[Personal Log Hub] GAS request URL:", url);
  console.log("[Personal Log Hub] GAS base URL:", baseUrl);
  console.log("[Personal Log Hub] GAS base ends with /exec:", endsWithExec);

  if (!endsWithExec) {
    console.warn("[Personal Log Hub] VITE_GAS_URL should end with /exec before query parameters.");
  }
}
