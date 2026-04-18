import { gasUrl } from "../config.js";

export function isGasConfigured() {
  return Boolean(gasUrl);
}

export async function createLogItem({ category, text }) {
  if (!gasUrl) {
    throw new Error("VITE_GAS_URLが未設定です。");
  }

  submitLogForm({ category, text });

  return null;
}

function submitLogForm({ category, text }) {
  const targetName = "gas-submit-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  const iframe = document.createElement("iframe");
  iframe.name = targetName;
  iframe.style.display = "none";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = gasUrl;
  form.target = targetName;
  form.style.display = "none";
  form.acceptCharset = "UTF-8";

  form.appendChild(createHiddenInput("category", category));
  form.appendChild(createHiddenInput("text", text));

  document.body.appendChild(iframe);
  document.body.appendChild(form);
  form.submit();

  window.setTimeout(() => {
    form.remove();
    iframe.remove();
  }, 10000);
}

function createHiddenInput(name, value) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  return input;
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
