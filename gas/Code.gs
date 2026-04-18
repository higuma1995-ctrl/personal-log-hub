const STORAGE_KEY = "PERSONAL_LOG_ITEMS";

function doPost(e) {
  try {
    const payload = parsePostPayload(e);
    const category = String(payload.category || "").trim();
    const text = String(payload.text || "").trim();

    if (!category || !text) {
      return jsonResponse({
        ok: false,
        error: "category and text are required.",
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

function doGet() {
  const items = readItems().sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return jsonResponse({
    ok: true,
    items,
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
