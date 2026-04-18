const HEADERS = ["timestamp", "date", "title", "tag", "mood", "duration", "status", "content"];

function doGet(e) {
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : "get";

  if (action === "post") {
    return writeItem(e.parameter);
  }

  return getItems();
}

function writeItem(parameter) {
  const date = String(parameter.date || "").trim();
  const title = String(parameter.title || "").trim();
  const tag = String(parameter.tag || "").trim();
  const mood = String(parameter.mood || "").trim();
  const duration = String(parameter.duration || "").trim();
  const status = String(parameter.status || "").trim();
  const content = String(parameter.content || "").trim();

  if (!date || !title || !tag || !content) {
    return jsonResponse({
      ok: false,
      error: "date, title, tag, and content are required.",
    });
  }

  const timestamp = new Date().toISOString();
  const sheet = getYearSheet(new Date(timestamp).getFullYear());
  sheet.appendRow([timestamp, date, title, tag, mood, duration, status, content]);

  return jsonResponse({
    ok: true,
  });
}

function getItems() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  const items = [];

  sheets.forEach(function (sheet) {
    if (!/^\d{4}$/.test(sheet.getName())) {
      return;
    }

    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i += 1) {
      const row = values[i];
      const timestamp = row[0];

      if (!timestamp) {
        continue;
      }

      items.push({
        id: String(timestamp) + "-" + i,
        category: String(row[3] || ""),
        text: String(row[7] || ""),
        createdAt: timestamp instanceof Date ? timestamp.toISOString() : String(timestamp),
        date: row[1],
        title: row[2],
        tag: row[3],
        mood: row[4],
        duration: row[5],
        status: row[6],
        content: row[7],
      });
    }
  });

  items.sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return jsonResponse({
    ok: true,
    items,
  });
}

function getYearSheet(year) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = String(year);
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  ensureHeader(sheet);
  return sheet;
}

function ensureHeader(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const values = range.getValues()[0];
  const needsHeader = HEADERS.some(function (header, index) {
    return values[index] !== header;
  });

  if (needsHeader) {
    range.setValues([HEADERS]);
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
