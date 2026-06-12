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

function hashRecord_(text) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return digest.map(function (byte) {
    var value = (byte < 0 ? byte + 256 : byte).toString(16);
    return value.length === 1 ? '0' + value : value;
  }).join('');
}

