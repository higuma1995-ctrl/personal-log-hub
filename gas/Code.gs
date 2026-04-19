function doGet(e) {
  const parameter = e && e.parameter ? e.parameter : {};
  const action = parameter.action || "get";

  if (action === "post") {
    return postRow(parameter);
  }

  if (action === "get") {
    return getRows(parameter);
  }

  return jsonResponse({
    ok: false,
    error: "unknown action.",
  });
}

function postRow(parameter) {
  const sheetName = String(parameter.sheet || "").trim();

  if (!sheetName) {
    return jsonResponse({
      ok: false,
      error: "sheet is required.",
    });
  }

  const sheet = getOrCreateSheet(sheetName);

  if (parameter.headers && sheet.getLastRow() === 0) {
    sheet.appendRow(splitCsv(parameter.headers));
  }

  const values = parameter.values ? splitCsv(parameter.values) : [];
  const timestamp = new Date().toISOString();
  sheet.appendRow([timestamp].concat(values));

  return jsonResponse({
    ok: true,
  });
}

function getRows(parameter) {
  const sheetName = String(parameter.sheet || new Date().getFullYear()).trim();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() === 0) {
    return jsonResponse({
      ok: true,
      sheet: sheetName,
      headers: [],
      rows: [],
    });
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0] || [];
  const rows = values.slice(1).map(function (row) {
    return row.map(function (cell) {
      return cell instanceof Date ? cell.toISOString() : cell;
    });
  });

  return jsonResponse({
    ok: true,
    sheet: sheetName,
    headers,
    rows,
  });
}

function getOrCreateSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

function splitCsv(value) {
  const text = String(value || "");
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text.charAt(i);
    const nextChar = text.charAt(i + 1);

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
