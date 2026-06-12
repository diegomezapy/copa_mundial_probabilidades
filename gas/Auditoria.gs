function audit_(user, action, detail, dataVersion) {
  try {
    appendRow_('LOG', [new Date().toISOString(), user || 'system', action, detail, dataVersion || '']);
  } catch (err) {
    console.warn('audit failed', err);
  }
}

function recordError_(fn, err, dataVersion) {
  try {
    appendRow_('ERRORES', [
      new Date().toISOString(),
      fn,
      String(err && err.message ? err.message : err),
      String(err && err.stack ? err.stack : ''),
      dataVersion || ''
    ]);
  } catch (inner) {
    console.warn('recordError failed', inner);
  }
}

function recordVisit_(params) {
  var now = new Date().toISOString();
  var row = [
    now,
    String(params.user_id || '').slice(0, 90),
    String(params.usuario || 'anonimo').slice(0, 80),
    String(params.perfil || '').slice(0, 40),
    String(params.pais || '').slice(0, 80),
    String(params.institucion || '').slice(0, 120),
    String(params.event || 'view').slice(0, 40),
    String(params.view || '').slice(0, 40),
    String(params.app_version || APP_CONFIG.APP_VERSION).slice(0, 30),
    String(params.data_version || '').slice(0, 80),
    String(params.user_agent || '').slice(0, 180)
  ];
  appendRow_('VISITAS', row);
  audit_(row[2], 'visit:' + row[6], row[7], row[9]);
  return { timestamp: now, usuario: row[2], evento: row[6], vista: row[7] };
}

function recordPrediction_(params) {
  var now = new Date().toISOString();
  var row = [
    now,
    String(params.user_id || '').slice(0, 90),
    String(params.usuario || 'anonimo').slice(0, 80),
    String(params.match_id || '').slice(0, 80),
    String(params.team1 || '').slice(0, 80),
    String(params.team2 || '').slice(0, 80),
    String(params.goals_home || '').slice(0, 8),
    String(params.goals_away || '').slice(0, 8),
    String(params.confidence || '').slice(0, 8),
    String(params.app_version || APP_CONFIG.APP_VERSION).slice(0, 30),
    String(params.data_version || '').slice(0, 80)
  ];
  appendRow_('PREDICCIONES_USUARIO', row);
  audit_(row[2], 'prediction', row[3] + ' ' + row[6] + '-' + row[7], row[10]);
  return { timestamp: now, usuario: row[2], match_id: row[3] };
}

function hashRecord_(text) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return digest.map(function (byte) {
    var value = (byte < 0 ? byte + 256 : byte).toString(16);
    return value.length === 1 ? '0' + value : value;
  }).join('');
}
