function getWorkbook_() {
  return SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
}

function setupWorkbook() {
  var ss = getWorkbook_();
  Object.keys(SHEET_HEADERS).forEach(function (name) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    var headers = SHEET_HEADERS[name];
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f5a4a').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, headers.length);
  });
  var defaultSheet = ss.getSheetByName('Hoja 1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  seedConfig_();
  audit_('system', 'setupWorkbook', 'Workbook initialized', '');
  return { ok: true, sheets: Object.keys(SHEET_HEADERS), spreadsheetId: APP_CONFIG.SPREADSHEET_ID };
}

function seedConfig_() {
  var now = new Date().toISOString();
  setSheetData_('CONFIG', SHEET_HEADERS.CONFIG, [
    ['APP_VERSION', APP_CONFIG.APP_VERSION, now, 'Version operativa del frontend/backend'],
    ['PUBLIC_DATA_URL', APP_CONFIG.PUBLIC_DATA_URL, now, 'JSON reproducible publicado en GitHub'],
    ['GITHUB_REPO', APP_CONFIG.GITHUB_REPO, now, 'Repositorio fuente'],
    ['SPREADSHEET_ID', APP_CONFIG.SPREADSHEET_ID, now, 'Planilla operativa']
  ]);
  setSheetData_('USUARIOS', SHEET_HEADERS.USUARIOS, [
    ['viewer', '', 'Consulta publica', '', 'viewer', 'TRUE', now, '', 'Usuario referencial sin password; no usar como seguridad fuerte']
  ]);
}

function setSheetData_(sheetName, headers, rows) {
  var ss = getWorkbook_();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clearContents();
  var values = [headers].concat(rows || []);
  if (values.length) {
    sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

function appendRow_(sheetName, row) {
  var ss = getWorkbook_();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  var headers = SHEET_HEADERS[sheetName];
  if (headers && sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f5a4a').setFontColor('#ffffff');
  }
  sheet.appendRow(row);
}
