import { gasUrl } from "../config.js";

export function isGasConfigured() {
  return Boolean(gasUrl);
}

export async function createLogItem({ category, text }) {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  const response = await fetch(gasUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({ category, text }),
  });

  if (!response.ok) {
    throw new Error("送信に失敗しました。");
  }

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || "送信に失敗しました。");
  }

  return data.item;
}

export async function fetchLogItems() {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  const response = await fetch(gasUrl);

  if (!response.ok) {
    throw new Error("取得に失敗しました。");
  }

  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}
