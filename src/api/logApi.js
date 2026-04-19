import { gasUrl } from "../config.js";
import { getGenre, getGenreSheetName } from "../logSchema.js";

export function isGasConfigured() {
  return Boolean(gasUrl);
}

export async function createLogItem({ genreKey, data }) {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  const genre = getGenre(genreKey);
  const values = genre.fields.map((field) => toCsvValue(formatValue(data[field]))).join(",");
  const url = buildGasUrl({
    action: "post",
    sheet: getGenreSheetName(genre.key),
    headers: genre.headers.join(","),
    values,
  });
  logGasUrlDebug(url);

  await fetch(url, {
    method: "GET",
    mode: "no-cors",
  });

  return null;
}

export async function fetchLogItems(genreKey = "dev") {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  const genre = getGenre(genreKey);
  const url = buildGasUrl({ action: "get", sheet: getGenreSheetName(genre.key) });
  logGasUrlDebug(url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("取得に失敗しました。");
  }

  const data = await response.json();

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return mapRowsToItems(data.headers, data.rows, genre);
}

function mapRowsToItems(headers, rows, genre) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row, index) => {
      const record = Object.fromEntries(headers.map((header, headerIndex) => [header, row[headerIndex]]));
      const createdAt = record.timestamp || record.date || "";
      const content = record.content || "";
      const tag = record.tag || genre.label;
      const title = record.title || "";

      return {
        id: `${genre.key}-${createdAt}-${index}`,
        category: tag,
        text: title ? `${title}\n${content}` : content,
        createdAt,
      };
    })
    .filter((item) => item.createdAt || item.text);
}

function formatValue(value) {
  return Array.isArray(value) ? value.join(",") : value ?? "";
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
