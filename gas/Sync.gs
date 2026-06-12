function syncFromGithub() {
  setupWorkbookIfMissing_();
  var data = loadPublishedData_();
  var version = data.metadata.data_version;
  var now = new Date().toISOString();

  var teamRows = data.teams.map(function (team) {
    var squad = team.squad || {};
    return [
      team.team_id,
      team.team,
      team.group,
      team.rating,
      team.attack_posterior_mean,
      team.defense_posterior_mean,
      team.matches_observed_2026,
      team.goals_for_observed_2026,
      team.goals_against_observed_2026,
      squad.players || 0,
      squad.avg_age || '',
      squad.total_caps || 0,
      squad.total_international_goals || 0,
      team.p_top2,
      team.p_advance_group,
      team.p_champion_rough
    ];
  });

  var playerRows = data.players.map(function (player) {
    return [
      player.team_id,
      player.team,
      player.number || '',
      player.position || '',
      player.name,
      player.birth_date || '',
      player.age || '',
      player.caps || 0,
      player.goals || 0,
      player.club || '',
      player.source || ''
    ];
  });

  var matchRows = data.matches.map(function (match) {
    return [
      match.match_id,
      match.round,
      match.date,
      match.time,
      match.team1,
      match.team2,
      match.group,
      match.ground,
      match.status,
      match.score ? match.score.team1 : '',
      match.score ? match.score.team2 : ''
    ];
  });

  var forecastRows = data.matches
    .filter(function (match) { return match.prediction; })
    .map(function (match) {
      var p = match.prediction;
      return [
        match.match_id,
        match.team1,
        match.team2,
        p.home_win,
        p.draw,
        p.away_win,
        p.expected_goals_home,
        p.expected_goals_away,
        version
      ];
    });

  setSheetData_('EQUIPOS', SHEET_HEADERS.EQUIPOS, teamRows);
  setSheetData_('JUGADORES', SHEET_HEADERS.JUGADORES, playerRows);
  setSheetData_('PARTIDOS', SHEET_HEADERS.PARTIDOS, matchRows);
  setSheetData_('PRONOSTICOS', SHEET_HEADERS.PRONOSTICOS, forecastRows);

  var runId = Utilities.getUuid();
  var hash = hashRecord_(JSON.stringify(data.metadata.coverage) + version + now);
  appendRow_('RUNS_MODELO', [
    runId,
    now,
    APP_CONFIG.APP_VERSION,
    version,
    data.metadata.model.name,
    APP_CONFIG.PUBLIC_DATA_URL,
    data.metadata.coverage.teams,
    data.metadata.coverage.players,
    data.metadata.coverage.matches,
    data.metadata.coverage.completed_matches,
    hash,
    'syncFromGithub'
  ]);
  appendRow_('VERSIONES', [now, APP_CONFIG.APP_VERSION, version, APP_CONFIG.GITHUB_REPO, APP_CONFIG.PUBLIC_DATA_URL, 'sincronizado']);
  audit_('system', 'syncFromGithub', 'Datos copiados desde GitHub a Sheets', version);
  return {
    run_id: runId,
    data_version: version,
    teams: data.metadata.coverage.teams,
    players: data.metadata.coverage.players,
    matches: data.metadata.coverage.matches,
    completed_matches: data.metadata.coverage.completed_matches
  };
}

function setupWorkbookIfMissing_() {
  var ss = getWorkbook_();
  var missing = Object.keys(SHEET_HEADERS).some(function (name) {
    return !ss.getSheetByName(name);
  });
  if (missing) {
    setupWorkbook();
  }
}

function installDailySyncTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'syncFromGithub') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  ScriptApp.newTrigger('syncFromGithub').timeBased().atHour(6).everyDays(1).create();
  audit_('system', 'installDailySyncTrigger', 'Trigger diario 06:00 instalado', '');
  return { ok: true, hour: 6, timezone: APP_CONFIG.TIMEZONE };
}

