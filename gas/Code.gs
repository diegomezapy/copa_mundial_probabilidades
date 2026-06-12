function doGet(e) {
  var params = (e && e.parameter) || {};
  var action = params.action || 'health';
  try {
    if (action === 'health') {
      return respond_({
        ok: true,
        app: APP_CONFIG.APP_NAME,
        version: APP_CONFIG.APP_VERSION,
        timestamp: new Date().toISOString()
      }, params.callback);
    }
    if (action === 'bootstrap') {
      var data = loadPublishedData_();
      audit_('public', 'bootstrap', 'Public data delivered from GitHub cache', data.metadata.data_version);
      return respond_({ ok: true, data: data }, params.callback);
    }
    if (action === 'visit') {
      var visit = recordVisit_(params, e);
      return respond_({ ok: true, visit: visit }, params.callback);
    }
    if (action === 'prediction') {
      var prediction = recordPrediction_(params);
      return respond_({ ok: true, prediction: prediction }, params.callback);
    }
    if (action === 'sync') {
      requireAdminToken_(params.token);
      var result = syncFromGithub();
      return respond_({ ok: true, result: result }, params.callback);
    }
    return respond_({ ok: false, error: 'Accion no soportada: ' + action }, params.callback);
  } catch (err) {
    recordError_('doGet:' + action, err, '');
    return respond_({ ok: false, error: String(err && err.message ? err.message : err) }, params.callback);
  }
}

function respond_(payload, callback) {
  var text = JSON.stringify(payload);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + text + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

function loadPublishedData_() {
  var response = UrlFetchApp.fetch(APP_CONFIG.PUBLIC_DATA_URL, {
    muteHttpExceptions: true,
    followRedirects: true
  });
  var code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('No se pudo leer JSON publicado. HTTP ' + code);
  }
  return JSON.parse(response.getContentText());
}
