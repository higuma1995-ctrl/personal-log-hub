import { gasUrl } from "../config.js";

export function isGasConfigured() {
  return Boolean(gasUrl);
}

export async function createLogItem({ category, text }) {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  const url = buildGasUrl({ action: "post", category, content: text, tags: "" });
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

  const url = buildGasUrl({ action: "get" });
  logGasUrlDebug(url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("取得に失敗しました。");
  }

  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

function buildGasUrl(params) {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  const separator = gasUrl.includes("?") ? "&" : "?";

  return `${gasUrl}${separator}${query}`;
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
