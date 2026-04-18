const STORAGE_KEY = "PERSONAL_LOG_ITEMS";

function doPost(e) {
  try {
    const payload = parsePostPayload(e);
    return writeItem(payload.category, payload.text || payload.content);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message,
    });
  }
}

function parsePostPayload(e) {
  if (e && e.parameter && (e.parameter.category || e.parameter.text)) {
    return {
      category: e.parameter.category,
      text: e.parameter.text,
    };
  }

  return JSON.parse((e && e.postData && e.postData.contents) || "{}");
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : "get";

  if (action === "post") {
    return writeItem(e.parameter.category, e.parameter.content);
  }

  const items = readItems().sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return jsonResponse({
    ok: true,
    items,
  });
}

function writeItem(categoryValue, textValue) {
  const category = String(categoryValue || "").trim();
  const text = String(textValue || "").trim();

  if (!category || !text) {
    return jsonResponse({
      ok: false,
      error: "category and content are required.",
    });
  }

  const items = readItems();
  const createdAt = new Date().toISOString();
  const item = {
    id: createdAt + "-" + Utilities.getUuid(),
    category,
    text,
    createdAt,
  };

  items.push(item);
  writeItems(items);

  return jsonResponse({
    ok: true,
    item,
  });
}

function readItems() {
  const value = PropertiesService.getScriptProperties().getProperty(STORAGE_KEY);

  if (!value) {
    return [];
  }

  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

function writeItems(items) {
  PropertiesService.getScriptProperties().setProperty(STORAGE_KEY, JSON.stringify(items));
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
