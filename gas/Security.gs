function requireAdminToken_(token) {
  var configured = PropertiesService.getScriptProperties().getProperty(APP_CONFIG.ADMIN_TOKEN_PROPERTY);
  if (!configured) {
    throw new Error('Token administrativo no configurado en Script Properties');
  }
  if (!token || token !== configured) {
    throw new Error('Token administrativo invalido');
  }
}

function setAdminToken(token) {
  if (!token || String(token).length < 16) {
    throw new Error('Use un token de al menos 16 caracteres');
  }
  PropertiesService.getScriptProperties().setProperty(APP_CONFIG.ADMIN_TOKEN_PROPERTY, String(token));
  audit_('system', 'setAdminToken', 'Token administrativo actualizado', '');
  return { ok: true };
}
