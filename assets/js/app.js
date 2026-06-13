(function () {
  const state = {
    data: null,
    status: null,
    filters: {
      group: "all",
      team: "all",
      query: "",
      matchStatus: "all",
      cup: "all",
      playerPosition: "all"
    },
    filtersReady: false,
    user: null,
    visits: null,
    appStarted: false,
    motionTimer: null,
    viewScale: "normal",
    wallZoom: 0.86,
    wallFocus: "full"
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const USER_STORAGE_KEY = "mundialProbabilidades.user.v1";
  const VISIT_STORAGE_KEY = "mundialProbabilidades.visits.v1";
  const PREDICTION_STORAGE_KEY = "mundialProbabilidades.predictions.v1";
  const VIEW_SCALE_STORAGE_KEY = "mundialProbabilidades.viewScale.v1";
  const MAX_PREDICTION_CARDS = 18;
  const GENERATED_BALL_IMAGE_SRC = "assets/img/generated/ball-realistic-transparent-1024.png";
  const VIEW_SCALE_OPTIONS = [
    {
      id: "normal",
      label: "Vista: normal",
      help: "Tamano estandar para pantallas con buena legibilidad."
    },
    {
      id: "comfortable",
      label: "Vista: comoda",
      help: "Texto y controles un poco mas grandes."
    },
    {
      id: "large",
      label: "Vista: grande",
      help: "Texto mas grande para telefonos o proyectores."
    }
  ];
  const GROUP_PALETTE = [
    "#0f766e",
    "#2563eb",
    "#7c3aed",
    "#dc2626",
    "#ea580c",
    "#ca8a04",
    "#16a34a",
    "#0891b2",
    "#c026d3",
    "#be123c",
    "#4f46e5",
    "#64748b"
  ];
  const FLAG_ICON_BASE = "https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3";
  const TEAM_FLAG_CODES = {
    Algeria: "dz",
    Argentina: "ar",
    Australia: "au",
    Austria: "at",
    Belgium: "be",
    "Bosnia & Herzegovina": "ba",
    Brazil: "br",
    Canada: "ca",
    "Cape Verde": "cv",
    Colombia: "co",
    Croatia: "hr",
    Curaçao: "cw",
    "Czech Republic": "cz",
    "DR Congo": "cd",
    Ecuador: "ec",
    Egypt: "eg",
    England: "gb-eng",
    France: "fr",
    Germany: "de",
    Ghana: "gh",
    Haiti: "ht",
    Iran: "ir",
    Iraq: "iq",
    "Ivory Coast": "ci",
    Japan: "jp",
    Jordan: "jo",
    Mexico: "mx",
    Morocco: "ma",
    Netherlands: "nl",
    "New Zealand": "nz",
    Norway: "no",
    Panama: "pa",
    Paraguay: "py",
    Portugal: "pt",
    Qatar: "qa",
    "Saudi Arabia": "sa",
    Scotland: "gb-sct",
    Senegal: "sn",
    "South Africa": "za",
    "South Korea": "kr",
    Spain: "es",
    Sweden: "se",
    Switzerland: "ch",
    Tunisia: "tn",
    Turkey: "tr",
    USA: "us",
    Uruguay: "uy",
    Uzbekistan: "uz"
  };
  const PLAYER_MEDIA = {
    "lionel messi": {
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Lionel_Messi_White_House_2026_%283x4_cropped%29.jpg/250px-Lionel_Messi_White_House_2026_%283x4_cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Lionel_Messi_White_House_2026_(3x4_cropped).jpg",
      license: "Public domain",
      author: "The White House"
    },
    "cristiano ronaldo": {
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2025_Cristiano_Ronaldo_%28cropped%29.jpg/250px-2025_Cristiano_Ronaldo_%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:2025_Cristiano_Ronaldo_(cropped).jpg",
      license: "Public domain",
      author: "The White House"
    },
    "virgil van dijk": {
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/20160604_AUT_NED_8876_%28cropped%29.jpg/250px-20160604_AUT_NED_8876_%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:20160604_AUT_NED_8876_(cropped).jpg",
      license: "CC BY-SA 3.0 at",
      author: "Ailura"
    },
    neymar: {
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg/250px-20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg",
      source: "https://commons.wikimedia.org/wiki/File:20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg",
      license: "CC BY-SA 4.0",
      author: "Granada"
    },
    "romelu lukaku": {
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Romelu_Lukaku_2021.jpg/250px-Romelu_Lukaku_2021.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Romelu_Lukaku_2021.jpg",
      license: "CC BY-SA 3.0",
      author: "Vyacheslav Evdokimov"
    },
    "kevin de bruyne": {
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg/250px-Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_(cropped).jpg",
      license: "CC BY-SA 4.0",
      author: "Bryan Berlin"
    },
    "son heung min": {
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg/250px-BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:BFA_2023_-2_Heung-Min_Son_(cropped).jpg",
      license: "CC BY-SA 4.0",
      author: "Ujishadow"
    },
    "harry kane": {
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Harry_Kane_2023.jpg/250px-Harry_Kane_2023.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Harry_Kane_2023.jpg",
      license: "CC BY 2.0",
      author: "Number 10"
    },
    "mohamed salah": {
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mohamed_Salah_2018.jpg/250px-Mohamed_Salah_2018.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Mohamed_Salah_2018.jpg",
      license: "CC BY-SA 3.0",
      author: "Anna Nessi"
    },
    "yassine bounou": {
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Yassine_Bono_%28cropped%29.jpg/250px-Yassine_Bono_%28cropped%29.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Yassine_Bono_(cropped).jpg",
      license: "CC BY 4.0",
      author: "Laloumance"
    }
  };
  const AUTHORS = [
    {
      name: "Diego Bernardo Meza Bogado",
      role: "Autor principal",
      focus: "Departamento de Estadística, Facultad de Ciencias Exactas y Naturales, Universidad Nacional de Asunción.",
      note: "Autor principal del proyecto académico público para aprendizaje estadístico, ciencia de datos aplicada y modelos bayesianos explicables.",
      details: [
        ["Afiliación", "Facultad de Ciencias Exactas y Naturales, Universidad Nacional de Asunción, San Lorenzo, Paraguay"],
        ["Unidad académica", "Departamento de Estadística, FACEN-UNA"],
        ["País", "Paraguay"],
        ["ORCID", "0000-0002-3469-6689"],
        ["Correo", "dmeza.py@gmail.com"]
      ],
      links: [
        ["ORCID", "https://orcid.org/0000-0002-3469-6689"],
        ["Correo", "mailto:dmeza.py@gmail.com"]
      ]
    },
    {
      name: "Nicolas Vera Ramos",
      role: "Colaborador",
      focus: "Estudiante de Licenciatura en Ciencias mención Matemática Pura en FACEN, con formación complementaria en análisis de datos, Python, SQL, machine learning y visualización.",
      note: "Colabora en la lectura didáctica de evidencia, pronósticos y explicaciones para estudiantes.",
      details: [
        ["Nombre bibliográfico", "Nicolas Vera Ramos Sr"],
        ["Área", "Ciencias Naturales, Matemáticas, Matemática Pura"],
        ["Formación", "Licenciatura en Ciencias mención Matemática Pura, en marcha desde 2024"],
        ["Técnico", "Bachiller Técnico Industrial en Electrónica, Colegio Técnico Nacional, 2017"],
        ["Cursos", "Data Scientist con Python, Data Analyst con Python, Python para análisis de datos, SQL, machine learning, redes neuronales y visualización de insights"],
        ["País", "Paraguay"]
      ],
      links: []
    }
  ];
  const GLOSSARY = {
    prob_1x2: {
      title: "Probabilidad 1 / Empate / 2",
      body:
        "Es una forma corta de leer un partido: 1 significa que gana el primer equipo listado, Empate significa que ambos terminan igualados y 2 significa que gana el segundo equipo listado. No es una apuesta ni una certeza; es una estimacion academica del modelo con los datos disponibles.",
      bullets: ["1 = gana el primer equipo que aparece en el partido.", "Empate = terminan igualados.", "2 = gana el segundo equipo que aparece en el partido."]
    },
    tournament_wall: {
      title: "Mural completo del torneo",
      body:
        "Es una vista tipo poster: grupos a los lados y llave eliminatoria al centro. Los filtros no destruyen el mapa completo; atenuan los partidos que no coinciden para conservar el contexto del torneo.",
      bullets: ["Cada rectangulo es un partido o cruce por completar.", "Finalizado muestra marcador.", "Pendiente muestra fecha o la mayor senal del modelo."]
    },
    group_map: {
      title: "Mapa de grupos",
      body:
        "Cada grupo muestra sus equipos y partidos como nodos. Los partidos finalizados se pintan como completados y muestran marcador; los pendientes muestran fecha y la mayor señal probabilistica actual.",
      bullets: ["Los filtros de grupo/equipo reducen el mapa.", "Las probabilidades cambian cuando se actualiza el JSON publico."]
    },
    knockout_map: {
      title: "Camino de eliminacion",
      body:
        "Resume las etapas posteriores a grupos. Antes de que se conozcan los clasificados, los nodos se muestran como espacios por completar. Cuando haya resultados, se iran completando con partidos reales.",
      bullets: ["Ronda de 32, octavos, cuartos, semifinales y finales.", "La app diferencia resultado observado de estimacion."]
    },
    posterior: {
      title: "Posterior bayesiano",
      body:
        "Es la estimacion actual despues de combinar supuestos iniciales con resultados observados. Si entran nuevos partidos, el posterior se recalcula.",
      bullets: ["Prior: informacion antes de observar resultados.", "Datos: goles/resultados disponibles.", "Posterior: estimacion actualizada."]
    }
  };

  function readJsonStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("storage read failed", key, error);
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("storage write failed", key, error);
    }
  }

  function viewScaleOption(value) {
    return VIEW_SCALE_OPTIONS.find((item) => item.id === value) || VIEW_SCALE_OPTIONS[0];
  }

  function loadViewScale() {
    try {
      return viewScaleOption(localStorage.getItem(VIEW_SCALE_STORAGE_KEY) || document.documentElement.dataset.viewScale).id;
    } catch (error) {
      return "normal";
    }
  }

  function saveViewScale(value) {
    try {
      localStorage.setItem(VIEW_SCALE_STORAGE_KEY, value);
    } catch (error) {
      console.warn("storage write failed", VIEW_SCALE_STORAGE_KEY, error);
    }
  }

  function renderViewScaleButton() {
    const button = $("#viewScaleButton");
    if (!button) return;
    const option = viewScaleOption(state.viewScale);
    button.textContent = option.label;
    button.title = `${option.help} Toque para cambiar el modo de lectura.`;
    button.setAttribute("aria-label", `${option.help} Toque para cambiar a otro tamano de lectura.`);
    button.classList.toggle("is-comfortable", option.id === "comfortable");
    button.classList.toggle("is-large", option.id === "large");
  }

  function applyViewScale(value, options = {}) {
    const option = viewScaleOption(value);
    state.viewScale = option.id;
    document.documentElement.dataset.viewScale = option.id;
    if (options.persist) saveViewScale(option.id);
    renderViewScaleButton();
  }

  function cycleViewScale() {
    const currentIndex = VIEW_SCALE_OPTIONS.findIndex((item) => item.id === state.viewScale);
    const next = VIEW_SCALE_OPTIONS[(currentIndex + 1) % VIEW_SCALE_OPTIONS.length];
    applyViewScale(next.id, { persist: true });
  }

  function createId(prefix) {
    if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function cleanUserName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 40);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeLookup(value) {
    return String(value || "")
      .replace(/\s*\([^)]*\)/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function teamFlagCode(team) {
    if (TEAM_FLAG_CODES[team]) return TEAM_FLAG_CODES[team];
    const lookup = normalizeLookup(team);
    const match = Object.entries(TEAM_FLAG_CODES).find(([name]) => normalizeLookup(name) === lookup);
    return match ? match[1] : "";
  }

  function flagFallback(team, code = "") {
    if (code) return code.replace("gb-", "").slice(0, 3).toUpperCase();
    return String(team || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function flagMarkup(team, className = "flag-badge") {
    const code = teamFlagCode(team);
    const fallback = flagFallback(team, code);
    if (!code) {
      return `<span class="${className} flag-empty" role="img" aria-label="Bandera no disponible para ${escapeHtml(team)}">${escapeHtml(fallback || "??")}</span>`;
    }
    return `<span class="${className}" role="img" aria-label="Bandera de ${escapeHtml(team)}" title="Bandera de ${escapeHtml(team)}">
      <img src="${FLAG_ICON_BASE}/${escapeHtml(code)}.svg" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false" />
      <span class="flag-fallback" hidden>${escapeHtml(fallback)}</span>
    </span>`;
  }

  function helpTip(key, label = "i") {
    const item = GLOSSARY[key];
    if (!item) return "";
    return `<button type="button" class="info-tip has-rich-popover" data-kind="glossary" data-glossary="${escapeHtml(key)}" aria-label="${escapeHtml(item.title)}">${escapeHtml(label)}</button>`;
  }

  function playerKey(player) {
    return normalizeLookup(`${player.team}|${player.name}`);
  }

  function cleanPlayerName(name) {
    return String(name || "").replace(/\s*\([^)]*\)/g, "").trim();
  }

  function playerMedia(player) {
    return PLAYER_MEDIA[normalizeLookup(cleanPlayerName(player.name))] || null;
  }

  function initials(name) {
    return cleanPlayerName(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function playerPortraitMarkup(player, sizeClass = "") {
    const media = playerMedia(player);
    if (media?.image) {
      return `<img class="player-photo ${sizeClass}" src="${escapeHtml(media.image)}" alt="Foto de ${escapeHtml(cleanPlayerName(player.name))}" loading="lazy" referrerpolicy="no-referrer" />`;
    }
    return `<span class="player-avatar ${sizeClass}" aria-hidden="true">${escapeHtml(initials(player.name) || flagFallback(player.team, teamFlagCode(player.team)))}</span>`;
  }

  function shortDate(value) {
    if (!value) return "s/d";
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-PY", { month: "short", day: "2-digit" });
  }

  function fullDateTime(value) {
    if (!value) return "s/d";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("es-PY", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function loadUserProfile() {
    return readJsonStorage(USER_STORAGE_KEY, null);
  }

  function saveUserProfile(profile) {
    state.user = profile;
    writeJsonStorage(USER_STORAGE_KEY, profile);
    renderUserButton();
  }

  function defaultVisitStats(now) {
    return {
      total_visits: 0,
      first_visit_at: now,
      last_visit_at: now,
      last_view: "resumen",
      view_counts: {},
      sessions: []
    };
  }

  function loadVisitStats() {
    return readJsonStorage(VISIT_STORAGE_KEY, defaultVisitStats(new Date().toISOString()));
  }

  function saveVisitStats(stats) {
    state.visits = stats;
    writeJsonStorage(VISIT_STORAGE_KEY, stats);
  }

  function predictionStorageKey() {
    const userId = state.user?.id || "anonimo";
    return `${PREDICTION_STORAGE_KEY}.${userId}`;
  }

  function loadPredictions() {
    return readJsonStorage(predictionStorageKey(), {});
  }

  function savePredictions(predictions) {
    writeJsonStorage(predictionStorageKey(), predictions);
  }

  function sendVisitEvent(action, view) {
    if (!window.APP_CONFIG.gasExecUrl || !state.user) return;
    const callback = `visitCb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const params = new URLSearchParams({
      action: "visit",
      callback,
      user_id: state.user.id,
      usuario: state.user.username,
      perfil: state.user.role,
      pais: state.user.country || "",
      institucion: state.user.institution || "",
      event: action,
      view: view || "",
      app_version: window.APP_CONFIG.appVersion,
      data_version: state.data?.metadata?.data_version || "",
      user_agent: navigator.userAgent.slice(0, 180)
    });
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callback];
      script.remove();
    };
    window[callback] = cleanup;
    script.onerror = cleanup;
    script.src = `${window.APP_CONFIG.gasExecUrl}?${params.toString()}`;
    document.head.appendChild(script);
  }

  function sendPredictionEvent(match, prediction) {
    if (!window.APP_CONFIG.gasExecUrl || !state.user) return;
    const callback = `predictionCb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const params = new URLSearchParams({
      action: "prediction",
      callback,
      user_id: state.user.id,
      usuario: state.user.username,
      match_id: match.match_id,
      team1: match.team1,
      team2: match.team2,
      goals_home: prediction.goals_home,
      goals_away: prediction.goals_away,
      confidence: prediction.confidence,
      app_version: window.APP_CONFIG.appVersion,
      data_version: state.data?.metadata?.data_version || ""
    });
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callback];
      script.remove();
    };
    window[callback] = cleanup;
    script.onerror = cleanup;
    script.src = `${window.APP_CONFIG.gasExecUrl}?${params.toString()}`;
    document.head.appendChild(script);
  }

  function beginVisitSession() {
    const now = new Date().toISOString();
    const stats = loadVisitStats();
    stats.total_visits = Number(stats.total_visits || 0) + 1;
    stats.first_visit_at = stats.first_visit_at || now;
    stats.last_visit_at = now;
    stats.sessions = Array.isArray(stats.sessions) ? stats.sessions.slice(-19) : [];
    stats.sessions.push({ at: now, app_version: window.APP_CONFIG.appVersion });
    saveVisitStats(stats);
    if (state.user) {
      state.user.last_seen_at = now;
      state.user.visit_count = stats.total_visits;
      saveUserProfile(state.user);
    }
    sendVisitEvent("session_start", stats.last_view || "resumen");
  }

  function trackView(target) {
    if (!state.visits || !target) return;
    state.visits.view_counts = state.visits.view_counts || {};
    state.visits.view_counts[target] = Number(state.visits.view_counts[target] || 0) + 1;
    state.visits.last_view = target;
    state.visits.last_visit_at = new Date().toISOString();
    saveVisitStats(state.visits);
    sendVisitEvent("view", target);
    if (state.data) renderVisitStats();
  }

  function renderUserButton() {
    const button = $("#userButton");
    if (!button) return;
    button.textContent = state.user?.username ? `Usuario: ${state.user.username}` : "Registrarse";
  }

  function showAuthGate(prefill) {
    const gate = $("#authGate");
    const form = $("#registrationForm");
    const profile = prefill ? state.user || loadUserProfile() : null;
    if (profile) {
      form.usuario.value = profile.username || "";
      form.nombre.value = profile.name || "";
      form.pais.value = profile.country || "";
      form.perfil.value = profile.role || "estudiante";
      form.institucion.value = profile.institution || "";
      $("#acceptDataRights").checked = true;
    } else {
      form.reset();
      form.perfil.value = "estudiante";
    }
    $("#authError").hidden = true;
    gate.hidden = false;
    $("#appShell").classList.add("access-locked");
    setTimeout(() => $("#registerUser").focus(), 0);
  }

  function hideAuthGate() {
    $("#authGate").hidden = true;
    $("#appShell").classList.remove("access-locked");
  }

  function handleRegistration(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const now = new Date().toISOString();
    const username = cleanUserName(form.usuario.value);
    const name = String(form.nombre.value || "").trim();
    const accepted = $("#acceptDataRights").checked;
    if (!username || !name || !accepted) {
      $("#authError").textContent = "Completa usuario, nombre y aceptacion de referencias/derechos.";
      $("#authError").hidden = false;
      return;
    }
    const previous = state.user || loadUserProfile();
    const profile = {
      id: previous?.id || createId("usr"),
      username,
      name,
      country: String(form.pais.value || "").trim(),
      role: form.perfil.value,
      institution: String(form.institucion.value || "").trim(),
      created_at: previous?.created_at || now,
      last_seen_at: now,
      accepted_terms_at: previous?.accepted_terms_at || now,
      accepted_terms_version: window.APP_CONFIG.appVersion,
      visit_count: state.visits?.total_visits || previous?.visit_count || 0
    };
    saveUserProfile(profile);
    hideAuthGate();
    if (!state.visits) beginVisitSession();
    if (state.appStarted) {
      renderVisitStats();
      renderUserButton();
    } else {
      startApp();
    }
  }

  function bar(value, label) {
    const width = Math.round((Number(value) || 0) * 100);
    return `
      <div class="bar" aria-label="${escapeHtml(label)} ${width}%">
        <span style="width:${Math.min(100, width)}%"></span>
      </div>
    `;
  }

  function markRecalculating() {
    const shell = $("#appShell");
    if (!shell) return;
    shell.classList.add("recalculating");
    clearTimeout(state.motionTimer);
    state.motionTimer = setTimeout(() => shell.classList.remove("recalculating"), 900);
  }

  function filteredTeams() {
    const query = state.filters.query.toLowerCase();
    return state.data.teams
      .filter((team) => state.filters.group === "all" || team.group === state.filters.group)
      .filter((team) => state.filters.team === "all" || team.team === state.filters.team)
      .filter((team) => !query || team.team.toLowerCase().includes(query))
      .sort((a, b) => b.p_advance_group - a.p_advance_group);
  }

  function filteredMatches() {
    const query = state.filters.query.toLowerCase();
    return state.data.matches
      .filter((match) => state.filters.group === "all" || match.group === state.filters.group)
      .filter((match) => state.filters.team === "all" || match.team1 === state.filters.team || match.team2 === state.filters.team)
      .filter((match) => state.filters.matchStatus === "all" || match.status === state.filters.matchStatus)
      .filter((match) => {
        if (!query) return true;
        return `${match.team1} ${match.team2} ${match.ground} ${match.round}`.toLowerCase().includes(query);
      });
  }

  function matchOutcomeFromScore(score) {
    if (!score) return "";
    if (Number(score.team1) > Number(score.team2)) return "home";
    if (Number(score.team2) > Number(score.team1)) return "away";
    return "draw";
  }

  function predictionOutcome(prediction) {
    const home = Number(prediction.goals_home);
    const away = Number(prediction.goals_away);
    if (home > away) return "home";
    if (away > home) return "away";
    return "draw";
  }

  function predictionLabel(outcome, match) {
    if (outcome === "home") return match.team1;
    if (outcome === "away") return match.team2;
    if (outcome === "draw") return "Empate";
    return "s/d";
  }

  function evaluatePrediction(match, prediction) {
    if (!prediction) return { status: "missing", points: 0, label: "sin pronostico" };
    if (match.status !== "final" || !match.score) {
      return { status: "pending", points: 0, label: "pendiente" };
    }
    const predictedOutcome = predictionOutcome(prediction);
    const actualOutcome = matchOutcomeFromScore(match.score);
    const exact =
      Number(prediction.goals_home) === Number(match.score.team1) &&
      Number(prediction.goals_away) === Number(match.score.team2);
    if (exact) return { status: "exact", points: 3, label: "marcador exacto" };
    if (predictedOutcome === actualOutcome) return { status: "sign", points: 1, label: "signo correcto" };
    return { status: "miss", points: 0, label: "falla" };
  }

  function predictionRows() {
    const predictions = loadPredictions();
    return state.data.matches
      .filter((match) => match.group)
      .map((match) => {
        const prediction = predictions[match.match_id];
        const evaluation = evaluatePrediction(match, prediction);
        return { match, prediction, evaluation };
      })
      .sort((a, b) => `${a.match.date} ${a.match.time}`.localeCompare(`${b.match.date} ${b.match.time}`));
  }

  function filteredPredictionRows() {
    const visibleMatchIds = new Set(filteredMatches().map((match) => match.match_id));
    return predictionRows().filter((row) => visibleMatchIds.has(row.match.match_id));
  }

  function predictionStats() {
    const rows = predictionRows();
    const saved = rows.filter((row) => row.prediction);
    const evaluated = saved.filter((row) => row.evaluation.status !== "pending");
    const points = evaluated.reduce((sum, row) => sum + row.evaluation.points, 0);
    const exact = evaluated.filter((row) => row.evaluation.status === "exact").length;
    const signs = evaluated.filter((row) => row.evaluation.status === "sign").length;
    const misses = evaluated.filter((row) => row.evaluation.status === "miss").length;
    const accuracy = evaluated.length ? (exact + signs) / evaluated.length : 0;
    return { rows, saved, evaluated, points, exact, signs, misses, accuracy };
  }

  function filteredPlayers() {
    const query = state.filters.query.toLowerCase();
    return state.data.players
      .filter((player) => state.filters.team === "all" || player.team === state.filters.team)
      .filter((player) => {
        if (state.filters.group === "all") return true;
        const team = state.data.teams.find((item) => item.team === player.team);
        return team?.group === state.filters.group;
      })
      .filter((player) => state.filters.playerPosition === "all" || player.position === state.filters.playerPosition)
      .filter((player) => {
        if (!query) return true;
        return `${player.name} ${player.team} ${player.club} ${player.position}`.toLowerCase().includes(query);
      });
  }

  function filteredHistoricalMatches() {
    const query = state.filters.query.toLowerCase();
    return (state.data.history?.historical_matches || [])
      .filter((match) => state.filters.cup === "all" || String(match.year) === state.filters.cup)
      .filter((match) => state.filters.team === "all" || match.team1 === state.filters.team || match.team2 === state.filters.team)
      .filter((match) => {
        if (!query) return true;
        return `${match.team1} ${match.team2} ${match.round} ${match.ground} ${match.winner}`.toLowerCase().includes(query);
      });
  }

  function filteredScorers() {
    const query = state.filters.query.toLowerCase();
    return (state.data.history?.scorers || [])
      .filter((scorer) => state.filters.team === "all" || scorer.team === state.filters.team)
      .filter((scorer) => state.filters.cup === "all" || scorer.years.includes(Number(state.filters.cup)))
      .filter((scorer) => {
        if (!query) return true;
        return `${scorer.player} ${scorer.team} ${scorer.years.join(" ")}`.toLowerCase().includes(query);
      });
  }

  function groupSortValue(group) {
    const match = String(group).match(/[A-L]$/);
    return match ? match[0].charCodeAt(0) : 99;
  }

  function groupIndex(group) {
    const match = String(group || "").match(/[A-L]$/);
    return match ? match[0].charCodeAt(0) - 65 : 0;
  }

  function groupColor(group) {
    return GROUP_PALETTE[groupIndex(group) % GROUP_PALETTE.length];
  }

  function groupStyle(group) {
    return `--group-color:${groupColor(group)}`;
  }

  function teamRecord(name) {
    return state.data?.teams?.find((team) => team.team === name) || null;
  }

  function defaultFilters() {
    return { group: "all", team: "all", query: "", matchStatus: "all", cup: "all", playerPosition: "all" };
  }

  function hasActiveFilters() {
    const defaults = defaultFilters();
    return Object.keys(defaults).some((key) => state.filters[key] !== defaults[key]);
  }

  function resetAllFilters() {
    state.filters = defaultFilters();
    const search = $("#searchInput");
    if (search) search.value = "";
    renderAll();
  }

  function applyGlobalFilter(filters, options = {}) {
    if (!state.data) return;
    if (Object.prototype.hasOwnProperty.call(filters, "group")) {
      state.filters.group = filters.group || "all";
      if (options.clearTeam !== false && filters.group !== undefined) state.filters.team = "all";
    }
    if (Object.prototype.hasOwnProperty.call(filters, "team")) {
      state.filters.team = filters.team || "all";
      const selectedTeam = teamRecord(state.filters.team);
      if (selectedTeam) state.filters.group = selectedTeam.group;
    }
    if (Object.prototype.hasOwnProperty.call(filters, "cup")) state.filters.cup = filters.cup || "all";
    if (Object.prototype.hasOwnProperty.call(filters, "status")) state.filters.matchStatus = filters.status || "all";
    if (Object.prototype.hasOwnProperty.call(filters, "position")) state.filters.playerPosition = filters.position || "all";
    if (Object.prototype.hasOwnProperty.call(filters, "query")) {
      state.filters.query = filters.query || "";
      const search = $("#searchInput");
      if (search) search.value = state.filters.query;
    }
    renderAll();
  }

  function applyMatchFilter(matchId) {
    const match = state.data?.matches?.find((item) => item.match_id === matchId);
    if (!match) return false;
    const filters = {
      status: match.status || "all",
      query: `${match.team1} ${match.team2}`
    };
    if (match.group) filters.group = match.group;
    applyGlobalFilter(filters, { clearTeam: false });
    return true;
  }

  function renderKpis() {
    const meta = state.data.metadata;
    const coverage = meta.coverage;
    const versionDate = meta.generated_at ? meta.generated_at.slice(0, 10) : meta.data_version;
    $("#kpiGrid").innerHTML = `
      <article class="kpi" data-filter-group="all">
        <span>Equipos en tablero</span>
        <strong>${coverage.teams}</strong>
      </article>
      <article class="kpi" data-filter-position="all">
        <span>Jugadores registrados</span>
        <strong>${coverage.players.toLocaleString("es-PY")}</strong>
      </article>
      <article class="kpi" data-filter-status="final">
        <span>Resultados 2026</span>
        <strong>${coverage.completed_matches}/${coverage.matches}</strong>
      </article>
      <article class="kpi">
        <span>Datos actualizados</span>
        <strong>${escapeHtml(versionDate)}</strong>
      </article>
    `;
    $("#dataStatus").textContent = `${state.status.source === "gas" ? "GAS" : "JSON publico"} · ${fullDateTime(meta.generated_at)}`;
    $("#backendStatus").textContent = state.status.error ? `Fallback activo: ${state.status.error}` : state.status.backend;
  }

  function renderModelFlow() {
    const coverage = state.data.metadata.coverage;
    const topTeam = [...state.data.teams].sort((a, b) => b.p_advance_group - a.p_advance_group)[0];
    const bestMatch = featuredPredictionMatch();
    const historyMatches = coverage.historical_matches || state.data.history?.coverage?.historical_matches || 0;
    const forecastText = bestMatch
      ? `${bestMatch.team1} vs ${bestMatch.team2}`
      : topTeam?.team || "sin cruce";
    const items = [
      {
        label: "Datos",
        value: `${coverage.completed_matches}/${coverage.matches}`,
        note: "resultados observados",
      },
      {
        label: "Prior",
        value: historyMatches.toLocaleString("es-PY"),
        note: "evidencia historica",
      },
      {
        label: "Posterior",
        value: topTeam ? WorldCupBayes.pct(topTeam.p_advance_group, 0) : "s/d",
        note: topTeam ? `${topTeam.team}: senal de avance` : "sin equipo",
      },
      {
        label: "Pronostico",
        value: forecastText,
        note: bestMatch?.date ? shortDate(bestMatch.date) : "partido destacado",
      },
    ];
    $("#modelFlow").innerHTML = `
      <div class="flow-motion" aria-hidden="true">
        <span class="flow-line"></span>
        <span class="flow-ball"></span>
      </div>
      ${items
        .map(
          (item, index) => `
            <article class="flow-step" style="--i:${index}">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              <small>${escapeHtml(item.note)}</small>
            </article>
          `
        )
        .join("")}
    `;
  }

  function featuredPredictionMatch() {
    const byDate = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
    return (
      filteredMatches()
        .filter((match) => match.status === "scheduled" && match.prediction)
        .sort(byDate)[0] ||
      state.data.matches
        .filter((match) => match.status === "scheduled" && match.prediction)
        .sort(byDate)[0] ||
      state.data.matches.find((match) => match.prediction) ||
      null
    );
  }

  function probabilityBars(match) {
    if (!match?.prediction) return "";
    const p = match.prediction;
    return `
      <div class="probability-bars">
        <article style="--p:${Math.round(p.home_win * 100)}">
          <span>1 gana ${escapeHtml(match.team1)}</span>
          <strong>${WorldCupBayes.pct(p.home_win, 1)}</strong>
        </article>
        <article style="--p:${Math.round(p.draw * 100)}">
          <span>X empate</span>
          <strong>${WorldCupBayes.pct(p.draw, 1)}</strong>
        </article>
        <article style="--p:${Math.round(p.away_win * 100)}">
          <span>2 gana ${escapeHtml(match.team2)}</span>
          <strong>${WorldCupBayes.pct(p.away_win, 1)}</strong>
        </article>
      </div>
    `;
  }

  function bayesMiniFigure(match) {
    const p = match?.prediction;
    const home = p ? Math.round(p.home_win * 100) : 0;
    const draw = p ? Math.round(p.draw * 100) : 0;
    const away = p ? Math.round(p.away_win * 100) : 0;
    return `
      <svg class="bayes-mini-figure" viewBox="0 0 720 260" role="img" aria-label="Esquema del calculo bayesiano de probabilidades">
        <defs>
          <linearGradient id="bayesGrad" x1="0" x2="1">
            <stop offset="0" stop-color="#2563eb" />
            <stop offset="0.52" stop-color="#d29b2d" />
            <stop offset="1" stop-color="#0f766e" />
          </linearGradient>
        </defs>
        <rect width="720" height="260" rx="18" class="bayes-figure-bg"></rect>
        <g class="bayes-node">
          <rect x="28" y="48" width="150" height="86" rx="14"></rect>
          <text x="103" y="82" text-anchor="middle">Prior</text>
          <text x="103" y="108" text-anchor="middle">historia + rating</text>
        </g>
        <g class="bayes-node">
          <rect x="28" y="154" width="150" height="66" rx="14"></rect>
          <text x="103" y="183" text-anchor="middle">Datos 2026</text>
          <text x="103" y="203" text-anchor="middle">goles observados</text>
        </g>
        <path class="bayes-arrow" d="M190 88 C248 88 250 126 302 126"></path>
        <path class="bayes-arrow" d="M190 188 C248 188 250 134 302 134"></path>
        <g class="bayes-posterior">
          <rect x="304" y="64" width="168" height="134" rx="16"></rect>
          <path d="M326 162 C350 112 378 104 402 138 C430 178 452 126 456 96"></path>
          <text x="388" y="92" text-anchor="middle">Posterior</text>
          <text x="388" y="184" text-anchor="middle">ataque y defensa</text>
        </g>
        <path class="bayes-arrow" d="M486 130 C528 130 530 130 568 130"></path>
        <g class="bayes-output">
          <rect x="570" y="44" width="122" height="172" rx="16"></rect>
          <text x="631" y="75" text-anchor="middle">Pronostico</text>
          <rect x="594" y="96" width="${Math.max(8, home)}" height="16" rx="8"></rect>
          <rect x="594" y="128" width="${Math.max(8, draw)}" height="16" rx="8"></rect>
          <rect x="594" y="160" width="${Math.max(8, away)}" height="16" rx="8"></rect>
          <text x="586" y="109" text-anchor="end">1</text>
          <text x="586" y="141" text-anchor="end">X</text>
          <text x="586" y="173" text-anchor="end">2</text>
        </g>
      </svg>
    `;
  }

  function renderModelFlowForecast() {
    const match = featuredPredictionMatch();
    const container = $("#modelFlowForecast");
    if (!container) return;
    if (!match?.prediction) {
      container.innerHTML = `<p class="empty-state">No hay pronosticos disponibles con los datos actuales.</p>`;
      return;
    }
    const p = match.prediction;
    const top = leadingPrediction(match);
    container.innerHTML = `
      <section class="flow-forecast-card" data-filter-match="${escapeHtml(match.match_id)}" data-filter-team="${escapeHtml(match.team1)}" tabindex="0">
        <div>
          <p class="eyebrow">Probabilidades visibles del modelo</p>
          <h3>${flagMarkup(match.team1)}${escapeHtml(match.team1)} vs ${flagMarkup(match.team2)}${escapeHtml(match.team2)}</h3>
          <p>
            El modelo suma muchos marcadores posibles y, con los datos actuales,
            la senal mas alta es <strong>${escapeHtml(top.label)}</strong>
            (${WorldCupBayes.pct(top.value, 1)}). Goles esperados:
            ${escapeHtml(match.team1)} ${WorldCupBayes.number(p.expected_goals_home)} y
            ${escapeHtml(match.team2)} ${WorldCupBayes.number(p.expected_goals_away)}.
          </p>
          ${probabilityBars(match)}
        </div>
        <div class="flow-forecast-figure">
          ${bayesMiniFigure(match)}
        </div>
      </section>
    `;
  }

  function renderContenders() {
    const rows = [...state.data.teams].sort((a, b) => b.p_champion_rough - a.p_champion_rough).slice(0, 10);
    $("#contenders").innerHTML = rows
      .map(
        (team, index) => `
        <article class="rank-row has-rich-popover" style="${groupStyle(team.group)}" data-kind="team" data-team="${escapeHtml(team.team)}" data-filter-team="${escapeHtml(team.team)}" tabindex="0">
          <div>
            <span class="rank">${index + 1}</span>
            ${flagMarkup(team.team)}
            <strong>${escapeHtml(team.team)}</strong>
            <small>${escapeHtml(team.group)} · rating ${team.rating}</small>
          </div>
          <div>
            <b>${WorldCupBayes.pct(team.p_champion_rough)}</b>
            ${bar(team.p_champion_rough, team.team)}
          </div>
        </article>
      `
      )
      .join("");
  }

  function teamOptions() {
    return `<option value="all">Todos los equipos</option>${state.data.teams
      .map((team) => `<option value="${escapeHtml(team.team)}">${escapeHtml(`${flagFallback(team.team, teamFlagCode(team.team))} - ${team.team}`)}</option>`)
      .join("")}`;
  }

  function renderFilters() {
    const groups = Object.keys(state.data.groups).sort((a, b) => groupSortValue(a) - groupSortValue(b));
    $("#groupButtons").innerHTML = [{ label: "Todos", value: "all" }, ...groups.map((group) => ({ label: group.replace("Group ", ""), value: group }))]
      .map(
        (item) => `
          <button type="button" class="${state.filters.group === item.value ? "active" : ""}" data-group="${escapeHtml(item.value)}" ${item.value === "all" ? "" : `style="${groupStyle(item.value)}"`}>
            ${escapeHtml(item.label)}
          </button>
        `
      )
      .join("");
    $("#teamFilter").innerHTML = teamOptions();
    $("#teamFilter").value = state.filters.team;
    $("#cupFilter").innerHTML = `<option value="all">Todas las Copas</option>${(state.data.history?.tournaments || [])
      .map((cup) => `<option value="${cup.year}">${cup.year} · ${escapeHtml(cup.champion || "s/d")}</option>`)
      .join("")}`;
    $("#cupFilter").value = state.filters.cup;
    $$("#statusButtons button").forEach((button) => {
      button.classList.toggle("active", button.dataset.status === state.filters.matchStatus);
    });
    $$("#positionButtons button").forEach((button) => {
      button.classList.toggle("active", button.dataset.position === state.filters.playerPosition);
    });
    const quickTeams = [...state.data.teams].sort((a, b) => b.p_champion_rough - a.p_champion_rough).slice(0, 8);
    $("#teamQuickButtons").innerHTML = quickTeams
      .map(
        (team) => `
          <button type="button" class="${state.filters.team === team.team ? "active" : ""}" data-team="${escapeHtml(team.team)}" style="${groupStyle(team.group)}">
            <span>${flagMarkup(team.team)}${escapeHtml(team.team)}</span>
            <b>${WorldCupBayes.pct(team.p_advance_group, 0)}</b>
          </button>
        `
      )
      .join("");
    const groupLabel = state.filters.group === "all" ? "todos los grupos" : state.filters.group;
    const teamLabel = state.filters.team === "all" ? "todos los equipos" : state.filters.team;
    const statusLabel = {
      all: "todos los partidos",
      scheduled: "pendientes",
      final: "finalizados"
    }[state.filters.matchStatus];
    const cupLabel = state.filters.cup === "all" ? "todas las Copas" : `Copa ${state.filters.cup}`;
    $("#filterSummary").textContent = `${groupLabel} · ${teamLabel} · ${cupLabel} · ${statusLabel}`;
    const activeFilters = hasActiveFilters();
    ["#resetFilters", "#globalResetFilters"].forEach((selector) => {
      const button = $(selector);
      if (!button) return;
      button.classList.toggle("is-active", activeFilters);
      button.disabled = !activeFilters;
      button.setAttribute("aria-disabled", String(!activeFilters));
      button.title = activeFilters ? "Quitar todos los filtros activos" : "No hay filtros activos";
    });
  }

  function renderGroupHeatmap() {
    const groups = Object.keys(state.data.groups).sort((a, b) => groupSortValue(a) - groupSortValue(b));
    $("#groupHeatmap").innerHTML = groups
      .map((group) => {
        const teams = state.data.groups[group]
          .map((name) => state.data.teams.find((team) => team.team === name))
          .filter(Boolean)
          .sort((a, b) => b.p_advance_group - a.p_advance_group);
        return `
          <article class="heatmap-group ${state.filters.group === group ? "active" : ""}" style="${groupStyle(group)}">
            <button type="button" data-group="${escapeHtml(group)}">${escapeHtml(group.replace("Group ", "Grupo "))}</button>
            <div>
              ${teams
                .map((team) => {
                  const p = Math.round(team.p_advance_group * 100);
                  return `
                    <span class="heat-team has-rich-popover" style="--p:${p};${groupStyle(team.group)}" data-kind="team" data-team="${escapeHtml(team.team)}" data-filter-team="${escapeHtml(team.team)}" tabindex="0">
                      <b>${flagMarkup(team.team)}${escapeHtml(team.team)}</b>
                      <small>${p}%</small>
                    </span>
                  `;
                })
                .join("")}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderAttackDefenseChart() {
    const rows = filteredTeams();
    const teams = rows.length ? rows : state.data.teams;
    const width = 620;
    const height = 360;
    const padding = 42;
    const attacks = teams.map((team) => Number(team.attack_posterior_mean));
    const defenses = teams.map((team) => Number(team.defense_posterior_mean));
    const minAttack = Math.min(...attacks) - 0.05;
    const maxAttack = Math.max(...attacks) + 0.05;
    const minDefense = Math.min(...defenses) - 0.05;
    const maxDefense = Math.max(...defenses) + 0.05;
    const x = (value) => padding + ((value - minAttack) / Math.max(0.01, maxAttack - minAttack)) * (width - padding * 2);
    const y = (value) => height - padding - ((maxDefense - value) / Math.max(0.01, maxDefense - minDefense)) * (height - padding * 2);
    const labelTeams = [...teams].sort((a, b) => b.p_advance_group - a.p_advance_group).slice(0, 7).map((team) => team.team);

    $("#attackDefenseChart").innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Ataque y defensa posterior por equipo">
        <rect x="0" y="0" width="${width}" height="${height}" rx="8" class="chart-bg"></rect>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="axis"></line>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="axis"></line>
        <text x="${width - padding}" y="${height - 12}" class="axis-label" text-anchor="end">ataque</text>
        <text x="18" y="${padding - 12}" class="axis-label">defensa solida</text>
        ${teams
          .map((team) => {
            const cx = x(team.attack_posterior_mean);
            const cy = y(team.defense_posterior_mean);
            const r = 5 + team.p_advance_group * 10;
            const top = labelTeams.includes(team.team);
            return `
              <g class="chart-point ${top ? "labeled" : ""}" style="${groupStyle(team.group)}" data-filter-team="${escapeHtml(team.team)}" tabindex="0">
                <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"></circle>
                ${top ? `<text x="${(cx + r + 4).toFixed(1)}" y="${(cy + 4).toFixed(1)}">${escapeHtml(team.team)}</text>` : ""}
              </g>
            `;
          })
          .join("")}
      </svg>
    `;
  }

  function renderNextMatches() {
    const rows = filteredMatches()
      .filter((match) => match.status === "scheduled" && match.prediction)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 5);
    $("#nextMatches").innerHTML = rows
      .map((match) => {
        const p = match.prediction;
        return `
          <article class="match-card" data-filter-match="${escapeHtml(match.match_id)}" tabindex="0">
            <header>
              <span>${shortDate(match.date)}</span>
              <b>${escapeHtml(match.group || match.round)}</b>
            </header>
            <strong>${flagMarkup(match.team1)}${escapeHtml(match.team1)} <em>vs</em> ${flagMarkup(match.team2)}${escapeHtml(match.team2)}</strong>
            <small>${escapeHtml(match.ground)}</small>
            <div class="triplet">
              <span style="--w:${Math.round(p.home_win * 100)}"><b>1</b><small>gana ${escapeHtml(match.team1)}</small><strong>${WorldCupBayes.pct(p.home_win, 0)}</strong></span>
              <span style="--w:${Math.round(p.draw * 100)}"><b>X</b><small>empate</small><strong>${WorldCupBayes.pct(p.draw, 0)}</strong></span>
              <span style="--w:${Math.round(p.away_win * 100)}"><b>2</b><small>gana ${escapeHtml(match.team2)}</small><strong>${WorldCupBayes.pct(p.away_win, 0)}</strong></span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderClassroomCards() {
    const completed = state.data.metadata.coverage.completed_matches;
    const visible = filteredTeams();
    const avgAdvance =
      visible.reduce((sum, team) => sum + Number(team.p_advance_group || 0), 0) / Math.max(1, visible.length);
    const top = [...visible].sort((a, b) => b.p_advance_group - a.p_advance_group)[0];
    const signalLabel = top?.team || "Sin datos";
    const signalNote =
      state.filters.team !== "all"
        ? "Equipo seleccionado en los filtros."
        : state.filters.group !== "all"
          ? "Mayor probabilidad dentro del grupo filtrado."
          : state.filters.query
            ? "Mayor probabilidad dentro de la busqueda."
            : "Mayor probabilidad actual de avanzar de grupo.";
    $("#classroomCards").innerHTML = `
      <article>
        <span>Prior</span>
        <strong>Antes</strong>
        <p>Historia, rating y experiencia del plantel.</p>
      </article>
      <article>
        <span>Datos</span>
        <strong>${completed}</strong>
        <p>Partidos finalizados ya entraron al modelo.</p>
      </article>
      <article>
        <span>Posterior</span>
        <strong>${WorldCupBayes.pct(avgAdvance, 0)}</strong>
        <p>Avance promedio en la seleccion actual.</p>
      </article>
      <article>
        <span>Señal</span>
        <strong>${top ? flagMarkup(top.team) : ""}${escapeHtml(signalLabel)}</strong>
        <p>${escapeHtml(signalNote)}</p>
      </article>
    `;
  }

  function renderStandings() {
    const selected = state.filters.group;
    const groups = selected === "all" ? Object.keys(state.data.standings) : [selected];
    $("#standings").innerHTML = groups
      .map((group) => {
        const rows = state.data.standings[group] || [];
        return `
          <section class="table-block" style="${groupStyle(group)}">
            <h3>${escapeHtml(group)}</h3>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Equipo</th><th>Pts</th><th>PJ</th><th>GF</th><th>GC</th><th>DG</th><th>Avance</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map((row) => {
                      const team = teamRecord(row.team);
                      return `
                        <tr class="has-rich-popover" style="${groupStyle(team?.group || group)}" data-kind="team" data-team="${escapeHtml(row.team)}" data-filter-team="${escapeHtml(row.team)}" tabindex="0">
                          <td><strong>${flagMarkup(row.team)}${escapeHtml(row.team)}</strong></td>
                          <td>${row.points}</td>
                          <td>${row.played}</td>
                          <td>${row.goals_for}</td>
                          <td>${row.goals_against}</td>
                          <td>${row.goal_difference}</td>
                          <td>${WorldCupBayes.pct(team?.p_advance_group || 0)}</td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          </section>
        `;
      })
      .join("");
  }

  function renderMatches() {
    const rows = filteredMatches();

    $("#matchesCount").textContent = `${rows.length} partidos`;
    $("#matchesTable").innerHTML = rows
      .map((match) => {
        const pred = match.prediction;
        const score = match.score ? `${match.score.team1}-${match.score.team2}` : "pendiente";
        return `
          <tr style="${match.group ? groupStyle(match.group) : ""}" data-filter-match="${escapeHtml(match.match_id)}" tabindex="0">
            <td>${shortDate(match.date)}<small>${escapeHtml(match.time)}</small></td>
            <td><strong>${flagMarkup(match.team1)}${escapeHtml(match.team1)}</strong><small>${flagMarkup(match.team2)}${escapeHtml(match.team2)}</small></td>
            <td>${escapeHtml(match.group || match.round)}</td>
            <td>${escapeHtml(match.ground)}</td>
            <td><span class="status ${match.status}">${score}</span></td>
            <td>
              ${
                pred
                  ? `<div class="prob-triplet-cell" aria-label="Probabilidad 1 X 2">
                      <span><b>1</b><small>${escapeHtml(match.team1)}</small><strong>${WorldCupBayes.pct(pred.home_win)}</strong></span>
                      <span><b>X</b><small>Empate</small><strong>${WorldCupBayes.pct(pred.draw)}</strong></span>
                      <span><b>2</b><small>${escapeHtml(match.team2)}</small><strong>${WorldCupBayes.pct(pred.away_win)}</strong></span>
                    </div>`
                  : "s/d"
              }
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function scoreLabel(match) {
    if (match.score) return `${match.score.team1}-${match.score.team2}`;
    return "pendiente";
  }

  function leadingPrediction(match) {
    const pred = match.prediction;
    if (!pred) return null;
    const options = [
      { code: "1", label: match.team1, value: pred.home_win },
      { code: "X", label: "Empate", value: pred.draw },
      { code: "2", label: match.team2, value: pred.away_win }
    ];
    return options.sort((a, b) => b.value - a.value)[0];
  }

  function groupMatchesByRound(matches) {
    return matches.reduce((acc, match) => {
      const key = match.group || match.round || "Sin fase";
      if (!acc[key]) acc[key] = [];
      acc[key].push(match);
      return acc;
    }, {});
  }

  function matchNode(match) {
    const signal = leadingPrediction(match);
    const done = match.status === "final";
    const statusClass = done ? "is-completed" : signal ? "is-estimated" : "is-pending";
    return `
      <article class="map-node ${done ? "done" : "pending"} ${statusClass}" style="${match.group ? groupStyle(match.group) : ""}" data-filter-match="${escapeHtml(match.match_id)}" tabindex="0">
        <header>
          <span>${shortDate(match.date)}</span>
          <b>${escapeHtml(match.round)}</b>
        </header>
        <strong>${flagMarkup(match.team1)}${escapeHtml(match.team1)}</strong>
        <strong>${flagMarkup(match.team2)}${escapeHtml(match.team2)}</strong>
        <footer>
          <span class="status ${match.status}">${escapeHtml(scoreLabel(match))}</span>
          ${
            signal
              ? `<small><b>${escapeHtml(signal.code)}</b> ${escapeHtml(signal.label)} · ${WorldCupBayes.pct(signal.value, 0)}</small>`
              : `<small>Clasificacion por completar</small>`
          }
        </footer>
      </article>
    `;
  }

  function groupLetter(group) {
    const match = String(group || "").match(/([A-L])$/);
    return match ? match[1] : "?";
  }

  function groupLabel(group) {
    return String(group || "Grupo").replace("Group ", "Grupo ");
  }

  function roundLabel(round) {
    const labels = {
      "Round of 32": "Ronda de 32",
      "Round of 16": "Octavos",
      "Quarter-final": "Cuartos",
      "Semi-final": "Semifinal",
      "Match for third place": "Tercer puesto",
      Final: "Final"
    };
    return labels[round] || round || "Fase";
  }

  function matchDateKey(match) {
    return `${match.date || ""} ${match.time || ""} ${match.match_id || ""}`;
  }

  function isSlotName(name) {
    const value = String(name || "").trim();
    return /^[123][A-L](?:\/[A-L])*$/.test(value) || /^[WL]\d+$/.test(value);
  }

  function slotHelp(name) {
    const value = String(name || "").trim();
    if (/^[WL]\d+$/.test(value)) {
      return `${value.startsWith("W") ? "Ganador" : "Perdedor"} partido ${value.slice(1)}`;
    }
    if (/^[123][A-L]/.test(value)) {
      const place = value[0] === "1" ? "1ro" : value[0] === "2" ? "2do" : "3ro";
      return `${place} grupo ${value.slice(1)}`;
    }
    return value;
  }

  function wallTeamPill(name) {
    if (isSlotName(name)) {
      return `<span class="wall-team-pill wall-slot" title="${escapeHtml(slotHelp(name))}"><span>${escapeHtml(name)}</span><b>${escapeHtml(slotHelp(name))}</b></span>`;
    }
    return `<span class="wall-team-pill">${flagMarkup(name, "flag-badge small")}<b>${escapeHtml(name)}</b></span>`;
  }

  function signalSummary(match) {
    const signal = leadingPrediction(match);
    if (!signal) return "";
    const label = signal.code === "X" ? "empate" : signal.label;
    return `senal: ${label} ${WorldCupBayes.pct(signal.value, 0)}`;
  }

  function wallMatchMatchesFilters(match) {
    const query = state.filters.query.toLowerCase();
    const activeGroupLetter = groupLetter(state.filters.group);
    const slotText = `${match.team1 || ""} ${match.team2 || ""}`;
    const groupOk =
      state.filters.group === "all" ||
      match.group === state.filters.group ||
      (!match.group && activeGroupLetter !== "?" && new RegExp(`(^|[^A-L])([123]${activeGroupLetter})(/|$|[^A-L])`).test(slotText));
    const teamOk = state.filters.team === "all" || match.team1 === state.filters.team || match.team2 === state.filters.team;
    const statusOk = state.filters.matchStatus === "all" || match.status === state.filters.matchStatus;
    const queryOk =
      !query ||
      `${match.team1 || ""} ${match.team2 || ""} ${match.ground || ""} ${match.round || ""} ${match.group || ""}`.toLowerCase().includes(query);
    return groupOk && teamOk && statusOk && queryOk;
  }

  function wallStatusClass(match) {
    if (match.status === "final") return "is-done";
    if (match.prediction) return "is-estimated";
    return "is-pending";
  }

  function wallMatchMeta(match) {
    if (match.status === "final" && match.score) return scoreLabel(match);
    return signalSummary(match) || shortDate(match.date) || "por definir";
  }

  function wallGroupMatch(match) {
    const muted = wallMatchMatchesFilters(match) ? "" : " is-muted";
    return `
      <article class="wall-match-row ${wallStatusClass(match)}${muted}" style="${groupStyle(match.group)}" data-filter-match="${escapeHtml(match.match_id)}" tabindex="0">
        <span class="wall-match-date">${escapeHtml(shortDate(match.date))}</span>
        <span class="wall-match-teams">
          ${wallTeamPill(match.team1)}
          <i>vs</i>
          ${wallTeamPill(match.team2)}
        </span>
        <span class="wall-match-meta">${escapeHtml(wallMatchMeta(match))}</span>
      </article>
    `;
  }

  function wallKnockoutNode(match) {
    const muted = wallMatchMatchesFilters(match) ? "" : " is-muted";
    return `
      <article class="wall-ko-node ${wallStatusClass(match)}${muted}" data-filter-match="${escapeHtml(match.match_id)}" tabindex="0">
        <header>
          <span>${escapeHtml(shortDate(match.date))}</span>
          <b>${escapeHtml(wallMatchMeta(match))}</b>
        </header>
        <div class="wall-ko-team">${wallTeamPill(match.team1)}</div>
        <div class="wall-ko-team">${wallTeamPill(match.team2)}</div>
      </article>
    `;
  }

  function renderWallGroups(groupNames, sideLabel) {
    return groupNames
      .map((group) => {
        const rows = state.data.matches
          .filter((match) => match.group === group)
          .sort((a, b) => matchDateKey(a).localeCompare(matchDateKey(b)));
        const completed = rows.filter((match) => match.status === "final").length;
        const muted = rows.length && rows.every((match) => !wallMatchMatchesFilters(match)) ? " is-muted" : "";
        return `
          <section class="wall-group${muted}" style="${groupStyle(group)}" data-filter-group="${escapeHtml(group)}" tabindex="0">
            <header>
              <span>${escapeHtml(groupLetter(group))}</span>
              <div>
                <h3>${escapeHtml(groupLabel(group))}</h3>
                <small>${completed}/${rows.length} finalizados - ${escapeHtml(sideLabel)}</small>
              </div>
            </header>
            <div class="wall-group-matches">${rows.map(wallGroupMatch).join("")}</div>
          </section>
        `;
      })
      .join("");
  }

  function splitRound(rows) {
    const pivot = Math.ceil(rows.length / 2);
    return [rows.slice(0, pivot), rows.slice(pivot)];
  }

  function renderWallRound(round, rows, extraClass = "") {
    return `
      <section class="wall-round ${extraClass}">
        <h3>${escapeHtml(roundLabel(round))}</h3>
        <div class="wall-round-nodes">
          ${rows.length ? rows.map(wallKnockoutNode).join("") : `<p class="wall-empty">Por completar</p>`}
        </div>
      </section>
    `;
  }

  function renderTournamentWall() {
    const wall = $("#tournamentWall");
    if (!wall) return;
    const matches = state.data.matches || [];
    const groupNames = [...new Set(matches.filter((match) => match.group).map((match) => match.group))].sort(
      (a, b) => groupSortValue(a) - groupSortValue(b)
    );
    const leftGroups = groupNames.slice(0, 6);
    const rightGroups = groupNames.slice(6);
    const knockoutByRound = matches
      .filter((match) => !match.group)
      .sort((a, b) => matchDateKey(a).localeCompare(matchDateKey(b)))
      .reduce((acc, match) => {
        if (!acc[match.round]) acc[match.round] = [];
        acc[match.round].push(match);
        return acc;
      }, {});
    const [r32Left, r32Right] = splitRound(knockoutByRound["Round of 32"] || []);
    const [r16Left, r16Right] = splitRound(knockoutByRound["Round of 16"] || []);
    const [qfLeft, qfRight] = splitRound(knockoutByRound["Quarter-final"] || []);
    const semis = knockoutByRound["Semi-final"] || [];
    const finals = knockoutByRound.Final || [];
    const thirdPlace = knockoutByRound["Match for third place"] || [];

    wall.innerHTML = `
      <div class="tournament-wall">
        <aside class="wall-groups wall-groups-left" aria-label="Grupos A a F">
          ${renderWallGroups(leftGroups, "lado izquierdo")}
        </aside>
        <section class="wall-bracket" aria-label="Llave central de eliminacion">
          <div class="wall-bracket-side wall-bracket-left">
            ${renderWallRound("Round of 32", r32Left)}
            ${renderWallRound("Round of 16", r16Left)}
            ${renderWallRound("Quarter-final", qfLeft)}
          </div>
          <div class="wall-bracket-core">
            <figure class="wall-cup">
              <img src="assets/img/generated/app-icon-1024.png" alt="" loading="lazy" />
              <figcaption>
                <strong>Copa 2026</strong>
                <span>seguimiento academico</span>
              </figcaption>
            </figure>
            ${renderWallRound("Semi-final", semis, "wall-round-semis")}
            ${renderWallRound("Final", finals, "wall-round-finals")}
            ${renderWallRound("Match for third place", thirdPlace, "wall-round-third")}
          </div>
          <div class="wall-bracket-side wall-bracket-right">
            ${renderWallRound("Quarter-final", qfRight)}
            ${renderWallRound("Round of 16", r16Right)}
            ${renderWallRound("Round of 32", r32Right)}
          </div>
        </section>
        <aside class="wall-groups wall-groups-right" aria-label="Grupos G a L">
          ${renderWallGroups(rightGroups, "lado derecho")}
        </aside>
      </div>
    `;
    updateWallViewport(false);
  }

  function updateWallViewport(animate = true) {
    const wall = $("#tournamentWall");
    if (!wall) return;
    wall.style.setProperty("--wall-zoom", String(state.wallZoom));
    wall.dataset.wallFocus = state.wallFocus;
    const zoom = $("#wallZoom");
    if (zoom) zoom.value = Math.round(state.wallZoom * 100);
    $$("#wallFocusButtons button").forEach((button) => {
      button.classList.toggle("active", button.dataset.wallFocus === state.wallFocus);
    });
    requestAnimationFrame(() => {
      const max = Math.max(0, wall.scrollWidth - wall.clientWidth);
      const target = {
        full: 0,
        left: 0,
        bracket: max * 0.48,
        right: max
      }[state.wallFocus] ?? 0;
      wall.scrollTo({ left: target, behavior: animate ? "smooth" : "auto" });
    });
  }

  function renderTournamentMap() {
    const matches = filteredMatches().filter((match) => match.group);
    const grouped = groupMatchesByRound(matches);
    const groupNames = Object.keys(grouped).sort((a, b) => groupSortValue(a) - groupSortValue(b));
    $("#tournamentMap").innerHTML = groupNames.length
      ? groupNames
          .map((group) => {
            const rows = grouped[group].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
            const standings = state.data.standings[group] || [];
            const completed = rows.filter((match) => match.status === "final").length;
            return `
              <section class="group-map-card" style="${groupStyle(group)}" data-filter-group="${escapeHtml(group)}" tabindex="0">
                <header>
                  <div>
                    <h3>${escapeHtml(group)}</h3>
                    <span>${completed}/${rows.length} partidos finalizados</span>
                  </div>
                  ${bar(rows.length ? completed / rows.length : 0, `avance ${group}`)}
                </header>
                <div class="group-team-strip">
                  ${standings
                    .slice(0, 4)
                    .map((row) => `<span data-filter-team="${escapeHtml(row.team)}" tabindex="0">${flagMarkup(row.team)}${escapeHtml(row.team)} <b>${row.points} pts</b></span>`)
                    .join("")}
                </div>
                <div class="map-node-grid">${rows.map(matchNode).join("")}</div>
              </section>
            `;
          })
          .join("")
      : `<p class="empty-state">No hay partidos de grupo con los filtros actuales.</p>`;
  }

  function renderKnockoutMap() {
    const order = ["Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Match for third place", "Final"];
    const rows = filteredMatches().filter((match) => !match.group);
    const byRound = rows.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});
    const rounds = order.filter((round) => byRound[round]?.length);
    $("#knockoutMap").innerHTML = rounds.length
      ? rounds
          .map(
            (round) => `
              <section class="knockout-column">
                <h3>${escapeHtml(round)}</h3>
                <div class="knockout-nodes">
                  ${byRound[round]
                    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
                    .map(matchNode)
                    .join("")}
                </div>
              </section>
            `
          )
          .join("")
      : `<p class="empty-state">Las etapas eliminatorias no coinciden con los filtros actuales o aun no tienen equipos definidos.</p>`;
  }

  function renderTournamentViews() {
    renderTournamentWall();
    renderTournamentMap();
    renderKnockoutMap();
  }

  function renderTeams() {
    const rows = filteredTeams();

    $("#teamsGrid").innerHTML = rows
      .map(
        (team) => `
        <article class="team-card has-rich-popover" style="${groupStyle(team.group)}" data-kind="team" data-team="${escapeHtml(team.team)}" data-filter-team="${escapeHtml(team.team)}" tabindex="0">
          <header>
            <strong class="team-heading">${flagMarkup(team.team, "flag-badge large")}${escapeHtml(team.team)}</strong>
            <span>${escapeHtml(team.group)}</span>
          </header>
          <dl>
            <div><dt>Rating</dt><dd>${team.rating}</dd></div>
            <div><dt>Ataque</dt><dd>${WorldCupBayes.number(team.attack_posterior_mean)}</dd></div>
            <div><dt>Defensa</dt><dd>${WorldCupBayes.number(team.defense_posterior_mean)}</dd></div>
            <div><dt>Plantel</dt><dd>${team.squad.players || 0}</dd></div>
          </dl>
          <footer>
            <span>Avance ${WorldCupBayes.pct(team.p_advance_group)}</span>
            ${bar(team.p_advance_group, `avance ${team.team}`)}
          </footer>
        </article>
      `
      )
      .join("");
  }

  function renderPlayers() {
    const rows = filteredPlayers().slice(0, 260);

    $("#playersCount").textContent = `${rows.length} visibles`;
    $("#playersTable").innerHTML = rows
      .map(
        (player) => {
          const team = teamRecord(player.team);
          return `
        <tr class="has-rich-popover" style="${team ? groupStyle(team.group) : ""}" data-kind="player" data-player-key="${escapeHtml(playerKey(player))}" data-filter-team="${escapeHtml(player.team)}" data-filter-position="${escapeHtml(player.position)}" tabindex="0">
          <td>${player.number ?? ""}</td>
          <td>
            <div class="player-cell">
              ${playerPortraitMarkup(player)}
              <span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.club)}</small></span>
            </div>
          </td>
          <td>${flagMarkup(player.team)}${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
          <td>${player.age ?? "s/d"}</td>
          <td>${player.caps}</td>
          <td>${player.goals}</td>
        </tr>
      `;
        }
      )
      .join("");
    renderScorers();
  }

  function renderScorers() {
    const rows = filteredScorers().slice(0, 18);
    $("#scorersCount").textContent = `${rows.length} visibles`;
    $("#scorersList").innerHTML = rows
      .map(
        (row, index) => `
          <article class="scorer-card" data-filter-team="${escapeHtml(row.team)}" data-filter-query="${escapeHtml(row.player)}" tabindex="0">
            <span class="rank">${index + 1}</span>
            <div>
              <strong>${escapeHtml(row.player)}</strong>
              <small>${escapeHtml(row.team)} · ${row.years.join(", ")}</small>
            </div>
            <b>${row.goals}</b>
          </article>
        `
      )
      .join("");
  }

  function selectedCountryHistory() {
    if (state.filters.team === "all") return null;
    return (state.data.history?.countries || []).find((row) => row.team === state.filters.team) || null;
  }

  function renderEvidenceHero() {
    const history = selectedCountryHistory();
    const cup = state.filters.cup === "all" ? null : (state.data.history?.tournaments || []).find((row) => String(row.year) === state.filters.cup);
    $("#evidenceTitle").textContent = history ? `${history.team}: historia mundialista` : "Historia mundialista comparada";
    $("#evidenceSubtitle").textContent = cup
      ? `Copa ${cup.year}: campeon ${cup.champion || "s/d"}, ${cup.matches} partidos y ${cup.goals} goles.`
      : "Cruza paises, Copas, partidos y jugadores para entender por que el modelo parte de ciertos priors.";
    const badges = history
      ? [
          ["Copas", history.appearances],
          ["Titulos", history.titles],
          ["Partidos", history.matches],
          ["GF/GC", `${history.goals_for}/${history.goals_against}`],
        ]
      : [
          ["Copas", state.data.history.coverage.tournaments],
          ["Partidos", state.data.history.coverage.historical_matches],
          ["Paises", state.data.history.coverage.countries],
          ["Goleadores", state.data.history.coverage.scorers],
        ];
    $("#evidenceBadges").innerHTML = badges
      .map(([label, value]) => `<span><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></span>`)
      .join("");
  }

  function renderTimelineChart() {
    const history = selectedCountryHistory();
    const cups = state.data.history?.tournaments || [];
    const yearRows = state.data.history?.country_years || [];
    const width = 680;
    const height = 280;
    const pad = 34;
    const maxGoals = Math.max(1, ...cups.map((cup) => cup.goals));
    let bars;
    if (history) {
      const byYear = new Map(yearRows.filter((row) => row.team === history.team).map((row) => [row.year, row]));
      bars = cups.map((cup) => {
        const row = byYear.get(cup.year);
        return {
          year: cup.year,
          value: row ? row.goals_for : 0,
          label: row ? `${row.goals_for} GF · ${row.matches} PJ` : "No participo",
          active: Boolean(row),
        };
      });
    } else {
      bars = cups.map((cup) => ({
        year: cup.year,
        value: cup.goals,
        label: `${cup.goals} goles · campeon ${cup.champion || "s/d"}`,
        active: state.filters.cup === "all" || String(cup.year) === state.filters.cup,
      }));
    }
    const maxValue = Math.max(1, ...bars.map((barItem) => barItem.value), maxGoals / 2);
    const step = (width - pad * 2) / Math.max(1, bars.length);
    $("#timelineChart").innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Linea de tiempo historica">
        <rect width="${width}" height="${height}" rx="8" class="chart-bg"></rect>
        <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="axis"></line>
        ${bars
          .map((barItem, index) => {
            const x = pad + index * step + step * 0.18;
            const h = (barItem.value / maxValue) * (height - pad * 2);
            const y = height - pad - h;
            return `
              <g class="timeline-bar ${barItem.active ? "active" : ""}" data-filter-cup="${escapeHtml(String(barItem.year))}" tabindex="0">
                <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(6, step * 0.58).toFixed(1)}" height="${h.toFixed(1)}" rx="5"></rect>
                <title>${barItem.year}: ${escapeHtml(barItem.label)}</title>
                ${index % 3 === 0 ? `<text x="${(x + step * 0.3).toFixed(1)}" y="${height - 10}" text-anchor="middle">${barItem.year}</text>` : ""}
              </g>
            `;
          })
          .join("")}
      </svg>
    `;
  }

  function renderHeadToHead() {
    const matches = filteredMatches().filter((match) => match.prediction).slice(0, 1);
    let pair = null;
    if (matches.length) {
      const [a, b] = [matches[0].team1, matches[0].team2].sort();
      pair = (state.data.history?.head_to_head || []).find((row) => row.team_a === a && row.team_b === b);
    }
    if (!pair && state.filters.team !== "all") {
      pair = (state.data.history?.head_to_head || []).find((row) => row.team_a === state.filters.team || row.team_b === state.filters.team);
    }
    if (!pair) {
      $("#headToHeadPanel").innerHTML = `<p class="empty-note">Elegí un país o revisá próximos cruces para ver antecedentes.</p>`;
      return;
    }
    $("#headToHeadPanel").innerHTML = `
      <div class="h2h-score">
        <span><small>${escapeHtml(pair.team_a)}</small><b>${pair.wins_a}</b></span>
        <span><small>Empates</small><b>${pair.draws}</b></span>
        <span><small>${escapeHtml(pair.team_b)}</small><b>${pair.wins_b}</b></span>
      </div>
      <p>${pair.matches} cruces · goles ${pair.goals_a}-${pair.goals_b}</p>
      <div class="meeting-list">
        ${pair.meetings
          .slice(0, 5)
          .map(
            (m) => `
              <article>
                <b>${m.year}</b>
                <span>${escapeHtml(m.team1)} ${escapeHtml(m.score)} ${escapeHtml(m.team2)}</span>
                <small>${escapeHtml(m.round)} · ganador: ${escapeHtml(m.winner)}</small>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderCountryHistoryTable() {
    let rows;
    if (state.filters.cup !== "all") {
      rows = (state.data.history?.country_years || [])
        .filter((row) => String(row.year) === state.filters.cup)
        .sort((a, b) => b.wins - a.wins || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for);
    } else {
      rows = [...(state.data.history?.countries || [])].sort(
        (a, b) => b.titles - a.titles || b.wins - a.wins || b.goal_difference - a.goal_difference
      );
    }
    if (state.filters.team !== "all") rows = rows.filter((row) => row.team === state.filters.team);
    rows = rows.slice(0, 16);
    $("#countryHistoryCount").textContent = `${rows.length} filas`;
    $("#countryHistoryTable").innerHTML = rows
      .map((row, index) => {
        const titleValue = state.filters.cup === "all" ? row.titles : row.champion ? "si" : "no";
        const appearanceValue = state.filters.cup === "all" ? row.appearances : row.year;
        return `
          <article class="history-row" data-filter-team="${escapeHtml(row.team)}" ${row.year ? `data-filter-cup="${escapeHtml(String(row.year))}"` : ""} tabindex="0">
            <span class="rank">${index + 1}</span>
            <strong>${escapeHtml(row.team)}</strong>
            <span>${appearanceValue}</span>
            <span>${row.matches} PJ</span>
            <span>${row.wins}-${row.draws}-${row.losses}</span>
            <span>${row.goals_for}/${row.goals_against}</span>
            <b>${escapeHtml(titleValue)}</b>
          </article>
        `;
      })
      .join("");
  }

  function renderHistoricalMatches() {
    const rows = filteredHistoricalMatches().slice(0, 160);
    $("#historicalMatchesCount").textContent = `${rows.length} partidos`;
    $("#historicalMatchesTable").innerHTML = rows
      .map(
        (match) => `
          <tr data-filter-cup="${escapeHtml(String(match.year))}" data-filter-team="${escapeHtml(match.team1)}" tabindex="0">
            <td>${match.year}</td>
            <td>${escapeHtml(match.round)}</td>
            <td><strong>${escapeHtml(match.team1)}</strong><small>${escapeHtml(match.team2)}</small></td>
            <td>${escapeHtml(match.score)}</td>
            <td>${escapeHtml(match.winner)}</td>
            <td>${escapeHtml(match.ground)}</td>
          </tr>
        `
      )
      .join("");
  }

  function renderEvidence() {
    renderEvidenceHero();
    renderTimelineChart();
    renderHeadToHead();
    renderCountryHistoryTable();
    renderHistoricalMatches();
  }

  function renderModelLab() {
    const teamSelectA = $("#teamA");
    const teamSelectB = $("#teamB");
    if (!teamSelectA.options.length) {
      const options = state.data.teams.map((team) => `<option value="${escapeHtml(team.team)}">${escapeHtml(team.team)}</option>`).join("");
      teamSelectA.innerHTML = options;
      teamSelectB.innerHTML = options;
      teamSelectA.value = "Mexico";
      teamSelectB.value = "South Korea";
      teamSelectA.addEventListener("change", renderModelLab);
      teamSelectB.addEventListener("change", renderModelLab);
    }
    const a = state.data.teams.find((team) => team.team === teamSelectA.value) || state.data.teams[0];
    const b = state.data.teams.find((team) => team.team === teamSelectB.value) || state.data.teams[1];
    if (!a || !b) return;
    const prediction = WorldCupBayes.predictFromTeams(a, b);
    $("#modelResult").innerHTML = `
      <div class="prob-grid">
        <article><span>${escapeHtml(a.team)}</span><strong>${WorldCupBayes.pct(prediction.home_win)}</strong></article>
        <article><span>Empate</span><strong>${WorldCupBayes.pct(prediction.draw)}</strong></article>
        <article><span>${escapeHtml(b.team)}</span><strong>${WorldCupBayes.pct(prediction.away_win)}</strong></article>
      </div>
      <p class="muted">Goles esperados: ${escapeHtml(a.team)} ${WorldCupBayes.number(prediction.expected_goals_home)} · ${escapeHtml(b.team)} ${WorldCupBayes.number(prediction.expected_goals_away)}</p>
      <div class="score-grid">
        ${prediction.scoreGrid
          .map((item) => `<span><b>${item.score}</b>${WorldCupBayes.pct(item.probability)}</span>`)
          .join("")}
      </div>
    `;
  }

  function renderMethod() {
    const model = state.data.metadata.model;
    $("#methodology").innerHTML = `
      <p><strong>${escapeHtml(model.name)}</strong></p>
      <p>${escapeHtml(model.prior)}</p>
      <p>${escapeHtml(model.likelihood)}</p>
      <p>${escapeHtml(model.posterior)}</p>
      <ul>
        ${model.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }

  function renderMethodologyDeep() {
    const container = $("#methodologyDeep");
    if (!container) return;
    const meta = state.data.metadata;
    const model = meta.model;
    const coverage = meta.coverage;
    const match = featuredPredictionMatch();
    const p = match?.prediction;
    const top = match ? leadingPrediction(match) : null;
    const historyCoverage = state.data.history?.coverage || {};
    container.innerHTML = `
      <section class="method-section method-summary">
        <article>
          <span>Datos 2026</span>
          <strong>${coverage.completed_matches}/${coverage.matches}</strong>
          <p>Resultados observados que actualizan parametros del torneo actual.</p>
        </article>
        <article>
          <span>Archivo historico</span>
          <strong>${(coverage.historical_matches || historyCoverage.historical_matches || 0).toLocaleString("es-PY")}</strong>
          <p>Partidos 1930-2022 usados para contexto, evidencia y priors.</p>
        </article>
        <article>
          <span>Modelo</span>
          <strong>Gamma-Poisson</strong>
          <p>Combina tasas de gol, ataque, defensa y simulacion de marcadores.</p>
        </article>
        <article>
          <span>Lectura</span>
          <strong>Probabilidades</strong>
          <p>No son certezas ni recomendaciones de apuesta: son senales con supuestos.</p>
        </article>
      </section>

      <section class="method-section method-equation-panel">
        <div>
          <p class="eyebrow">Formula conceptual</p>
          <h3>Prior + datos observados = posterior actualizado</h3>
          <p>
            Para cada equipo se parte de una tasa previa de goles. Cuando entran
            resultados, el modelo actualiza las tasas de ataque y defensa. Luego
            se proyectan goles esperados y se suman las probabilidades de todos
            los marcadores posibles.
          </p>
          <dl class="method-definitions">
            <div><dt>Prior</dt><dd>Conocimiento antes del nuevo partido: historia, rating y desempeno esperado.</dd></div>
            <div><dt>Likelihood</dt><dd>Que tan compatibles son los goles observados con una tasa de gol.</dd></div>
            <div><dt>Posterior</dt><dd>Nueva distribucion despues de combinar prior y datos.</dd></div>
            <div><dt>Pronostico 1-X-2</dt><dd>Suma de probabilidades de marcadores donde gana A, empatan o gana B.</dd></div>
          </dl>
        </div>
        <div class="method-equation">
          ${bayesMiniFigure(match)}
          <div class="formula-strip">
            <span>lambda A = sqrt(ataque A x defensa B)</span>
            <span>P(goles=k) = Poisson(lambda)</span>
            <span>P(1), P(X), P(2) = suma de marcadores</span>
          </div>
        </div>
      </section>

      <section class="method-section method-pipeline">
        ${[
          ["1", "Ingesta", "Calendario, resultados, planteles y evidencia historica se normalizan con scripts reproducibles."],
          ["2", "Calidad", "Se registran fuente, fecha, bytes y hash para trazabilidad de datos."],
          ["3", "Posterior", "Las tasas de ataque y defensa se recalculan cuando hay resultados nuevos."],
          ["4", "Simulacion", "Se evalua una grilla de marcadores y se estiman senales 1-X-2 y avance."],
          ["5", "Interpretacion", "La app muestra supuestos, limites y referencias para lectura academica."]
        ]
          .map(
            ([step, title, body]) => `
              <article>
                <span>${step}</span>
                <strong>${escapeHtml(title)}</strong>
                <p>${escapeHtml(body)}</p>
              </article>
            `
          )
          .join("")}
      </section>

      <section class="method-section method-current-example">
        <div>
          <h3>Ejemplo con el proximo partido estimado</h3>
          ${
            match && p
              ? `<p>
                  Partido: <strong>${flagMarkup(match.team1)}${escapeHtml(match.team1)} vs ${flagMarkup(match.team2)}${escapeHtml(match.team2)}</strong>.
                  Senal mayor: <strong>${escapeHtml(top.label)} ${WorldCupBayes.pct(top.value, 1)}</strong>.
                </p>
                ${probabilityBars(match)}
                <p class="muted">Goles esperados: ${escapeHtml(match.team1)} ${WorldCupBayes.number(p.expected_goals_home)}; ${escapeHtml(match.team2)} ${WorldCupBayes.number(p.expected_goals_away)}.</p>`
              : `<p>No hay un partido con pronostico disponible en este estado de datos.</p>`
          }
        </div>
        <div class="score-grid">
          ${(p?.scoreGrid || [])
            .map((item) => `<span><b>${escapeHtml(item.score)}</b>${WorldCupBayes.pct(item.probability)}</span>`)
            .join("")}
        </div>
      </section>

      <section class="method-section method-limits">
        <article>
          <h3>Supuestos principales</h3>
          <ul>
            <li>Los goles se aproximan con una distribucion Poisson.</li>
            <li>Los equipos tienen parametros de ataque y defensa actualizables.</li>
            <li>El posterior cambia cuando se incorporan resultados nuevos.</li>
            <li>La simulacion resume incertidumbre, no elimina incertidumbre.</li>
          </ul>
        </article>
        <article>
          <h3>Limitaciones</h3>
          <ul>
            ${model.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            <li>No debe leerse como certeza, causalidad ni recomendacion de apuesta.</li>
          </ul>
        </article>
        <article>
          <h3>Validacion y sensibilidad</h3>
          <ul>
            <li>Comparar pronosticos previos con resultados observados cuando haya partidos finalizados.</li>
            <li>Revisar cambios de probabilidad despues de cada fecha.</li>
            <li>Contrastar rankings con evidencia historica y datos de planteles.</li>
            <li>Documentar fuentes, fecha de generacion y version del modelo.</li>
          </ul>
        </article>
      </section>
    `;
  }

  function renderAuthorCards() {
    const container = $("#authorCards");
    if (!container) return;
    container.innerHTML = AUTHORS.map(
      (author) => `
        <article class="author-card">
          <span class="author-orbit" aria-hidden="true"></span>
          <small>${escapeHtml(author.role)}</small>
          <strong>${escapeHtml(author.name)}</strong>
          <p>${escapeHtml(author.focus)}</p>
          <dl class="author-details">
            ${(author.details || [])
              .map(
                ([label, value]) => `
                  <div>
                    <dt>${escapeHtml(label)}</dt>
                    <dd>${escapeHtml(value)}</dd>
                  </div>
                `
              )
              .join("")}
          </dl>
          ${
            author.links?.length
              ? `<div class="author-links">
                  ${author.links
                    .map(
                      ([label, url]) =>
                        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
                    )
                    .join("")}
                </div>`
              : ""
          }
          <em>${escapeHtml(author.note)}</em>
        </article>
      `
    ).join("");
  }

  function renderPredictionStats() {
    const stats = predictionStats();
    $("#predictionSummary").textContent = `${stats.saved.length} guardados · ${stats.evaluated.length} evaluados`;
    $("#predictionStats").innerHTML = `
      <article><span>Puntos</span><strong>${stats.points}</strong></article>
      <article><span>Aciertos</span><strong>${stats.exact + stats.signs}</strong></article>
      <article><span>Exactos</span><strong>${stats.exact}</strong></article>
      <article><span>Precision</span><strong>${WorldCupBayes.pct(stats.accuracy, 0)}</strong></article>
    `;
  }

  function renderPredictionBoard() {
    const stats = predictionStats();
    const evaluated = stats.rows.filter((row) => row.prediction && row.evaluation.status !== "pending");
    let cumulative = 0;
    const maxPoints = Math.max(3, evaluated.length * 3);
    const timeline = evaluated.map((row, index) => {
      cumulative += row.evaluation.points;
      const left = evaluated.length <= 1 ? 50 : (index / (evaluated.length - 1)) * 100;
      const bottom = (cumulative / maxPoints) * 76 + 8;
      return { row, cumulative, left, bottom };
    });
    $("#predictionBoard").innerHTML = `
      <div class="score-ribbon">
        <article><span>Guardados</span><strong>${stats.saved.length}</strong></article>
        <article><span>Evaluados</span><strong>${stats.evaluated.length}</strong></article>
        <article><span>Fallas</span><strong>${stats.misses}</strong></article>
      </div>
      <div class="accuracy-field">
        <span class="field-formula">score = exactos*3 + signos</span>
        <span class="field-axis"></span>
        ${
          timeline.length
            ? timeline
                .map(
                  (item) => `
                    <span class="accuracy-dot ${item.row.evaluation.status}" style="left:${item.left}%;bottom:${item.bottom}%">
                      <b>${item.cumulative}</b>
                      <small>${escapeHtml(item.row.match.team1)} vs ${escapeHtml(item.row.match.team2)}</small>
                    </span>
                  `
                )
                .join("")
            : `<p class="empty-note">Guarda pronosticos y volve cuando haya resultados para ver tu curva.</p>`
        }
      </div>
      <div class="result-legend">
        <span><b class="exact"></b> marcador exacto</span>
        <span><b class="sign"></b> signo correcto</span>
        <span><b class="miss"></b> falla</span>
      </div>
    `;
  }

  function renderPredictionMatches() {
    const allRows = filteredPredictionRows();
    const rows = allRows.slice(0, MAX_PREDICTION_CARDS);
    const hiddenRows = Math.max(0, allRows.length - rows.length);
    $("#predictionMatchCount").textContent = hiddenRows
      ? `${rows.length}/${allRows.length} visibles`
      : `${rows.length} partidos`;
    if (!rows.length) {
      $("#predictionMatches").innerHTML = `<p class="empty-note">No hay partidos con los filtros actuales.</p>`;
      return;
    }
    $("#predictionMatches").innerHTML = rows
      .map(({ match, prediction, evaluation }) => {
        const disabled = match.status === "final" ? "disabled" : "";
        const homeGoals = prediction?.goals_home ?? "";
        const awayGoals = prediction?.goals_away ?? "";
        const confidence = prediction?.confidence ?? 60;
        const predOutcome = prediction ? predictionOutcome(prediction) : "";
        const actual = match.score ? `${match.score.team1}-${match.score.team2}` : "pendiente";
        return `
          <article class="prediction-card ${evaluation.status}" data-match-id="${escapeHtml(match.match_id)}">
            <div class="prediction-meta">
              <span>${shortDate(match.date)} · ${escapeHtml(match.group || match.round)}</span>
              <b class="prediction-badge ${evaluation.status}">${escapeHtml(evaluation.label)}</b>
            </div>
            <div class="prediction-teams">
              <strong>${escapeHtml(match.team1)}</strong>
              <span>vs</span>
              <strong>${escapeHtml(match.team2)}</strong>
            </div>
            <div class="prediction-inputs">
              <label>
                ${escapeHtml(match.team1)}
                <input type="number" min="0" max="12" inputmode="numeric" data-pred-field="goals_home" value="${escapeHtml(homeGoals)}" ${disabled} />
              </label>
              <label>
                ${escapeHtml(match.team2)}
                <input type="number" min="0" max="12" inputmode="numeric" data-pred-field="goals_away" value="${escapeHtml(awayGoals)}" ${disabled} />
              </label>
              <label>
                Confianza
                <input type="range" min="10" max="100" step="5" data-pred-field="confidence" value="${escapeHtml(confidence)}" ${disabled} />
              </label>
            </div>
            <div class="prediction-footer">
              <span>Tu signo: ${prediction ? escapeHtml(predictionLabel(predOutcome, match)) : "sin cargar"}</span>
              <span>Resultado: ${escapeHtml(actual)}</span>
              <button type="button" data-save-prediction ${disabled}>Guardar</button>
            </div>
          </article>
        `;
      })
      .join("") +
      (hiddenRows
        ? `<p class="prediction-more-note">Hay ${hiddenRows} partidos mas. Ajusta grupo, equipo, estado o busqueda para enfocar la lista.</p>`
        : "");
  }

  function renderPredictions() {
    renderPredictionStats();
    renderPredictionBoard();
    renderPredictionMatches();
  }

  function renderSourcePanel() {
    const sources = state.data.sources;
    $("#sourcePanel").innerHTML = `
      <p><strong>OpenFootball</strong><a href="${escapeHtml(sources.openfootball_worldcup_json.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sources.openfootball_worldcup_json.url)}</a></p>
      <p><strong>Squads</strong><a href="${escapeHtml(sources.wikipedia_squads.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sources.wikipedia_squads.url)}</a></p>
      <p><strong>Referencia oficial</strong><a href="${escapeHtml(sources.official_reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sources.official_reference.url)}</a></p>
      <p><strong>Archivo FIFA</strong><a href="${escapeHtml(sources.fifa_archive.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sources.fifa_archive.url)}</a></p>
      <p><strong>Eventos historicos candidatos</strong><a href="${escapeHtml(sources.statsbomb_open_data?.url || "https://github.com/statsbomb/open-data")}" target="_blank" rel="noopener noreferrer">StatsBomb Open Data</a></p>
      <p><strong>Wyscout/Figshare</strong><a href="${escapeHtml(sources.wyscout_figshare_events?.url || "https://figshare.com/collections/Soccer_match_event_dataset/4415000")}" target="_blank" rel="noopener noreferrer">dataset academico de eventos</a></p>
      <p><strong>API 2026 candidata</strong><a href="${escapeHtml(sources.api_football_fixture_statistics?.url || "https://api-sports.io/documentation/football/v3")}" target="_blank" rel="noopener noreferrer">API-Football fixture statistics</a></p>
      <p><strong>Hoja operativa</strong><span>${escapeHtml(window.APP_CONFIG.spreadsheetId)}</span></p>
    `;
  }

  function renderVisitStats() {
    if (!state.visits) return;
    const profile = state.user || {};
    const stats = state.visits;
    const viewCounts = stats.view_counts || {};
    const viewLabels = {
      resumen: "Resumen",
      equipos: "Equipos",
      jugadores: "Jugadores",
      partidos: "Partidos",
      mapa: "Mapa",
      evidencia: "Evidencia",
      modelo: "Modelo",
      metodologia: "Metodologia",
      acerta: "Acerta",
      autores: "Autores",
      visitas: "Visitas",
      referencias: "Referencias",
      auditoria: "Auditoria"
    };
    $("#visitorStatus").textContent = profile.role ? `${profile.role} · sin password` : "perfil local";
    $("#visitSummary").textContent = `${stats.total_visits || 0} visitas`;
    $("#visitorProfile").innerHTML = `
      <div class="profile-card">
        <strong>${escapeHtml(profile.name || "Usuario")}</strong>
        <span>${escapeHtml(profile.username || "sin usuario")}</span>
        <dl>
          <div><dt>Perfil</dt><dd>${escapeHtml(profile.role || "s/d")}</dd></div>
          <div><dt>Pais</dt><dd>${escapeHtml(profile.country || "s/d")}</dd></div>
          <div><dt>Institucion</dt><dd>${escapeHtml(profile.institution || "s/d")}</dd></div>
          <div><dt>Registro</dt><dd>${fullDateTime(profile.created_at)}</dd></div>
        </dl>
        <div class="profile-actions">
          <button type="button" id="editRegistration" class="secondary-button">Editar registro</button>
          <button type="button" id="clearRegistration" class="ghost-button">Nuevo usuario</button>
        </div>
      </div>
    `;
    $("#visitStats").innerHTML = `
      <article><span>Visitas</span><strong>${stats.total_visits || 0}</strong></article>
      <article><span>Primer ingreso</span><strong>${fullDateTime(stats.first_visit_at)}</strong></article>
      <article><span>Ultimo ingreso</span><strong>${fullDateTime(stats.last_visit_at)}</strong></article>
      <article><span>Ultima vista</span><strong>${escapeHtml(viewLabels[stats.last_view] || stats.last_view || "Resumen")}</strong></article>
    `;
    const rows = Object.entries(viewLabels).map(([key, label]) => ({
      key,
      label,
      count: Number(viewCounts[key] || 0)
    }));
    const maxCount = Math.max(1, ...rows.map((row) => row.count));
    $("#viewStats").innerHTML = rows
      .map(
        (row) => `
          <article class="view-stat">
            <strong>${escapeHtml(row.label)}</strong>
            <span>${row.count}</span>
            <div class="bar"><span style="width:${Math.round((row.count / maxCount) * 100)}%"></span></div>
          </article>
        `
      )
      .join("");
  }

  function renderReferences() {
    const sources = state.data.sources;
    const historicalCount = Array.isArray(sources.openfootball_historical_worldcups)
      ? sources.openfootball_historical_worldcups.length
      : 0;
    const links = [
      ["FIFA World Cup 2026", sources.official_reference.url],
      ["Archivo historico FIFA", sources.fifa_archive.url],
      ["OpenFootball World Cup JSON", "https://github.com/openfootball/worldcup.json"],
      ["OpenFootball 2026 JSON", sources.openfootball_worldcup_json.url],
      ["Wikipedia squads 2026", sources.wikipedia_squads.url],
      ["flag-icons - banderas SVG MIT", "https://github.com/lipis/flag-icons"],
      ["Wikimedia Commons - imagenes libres", "https://commons.wikimedia.org/"],
      ["Wikidata - datos estructurados CC0", "https://www.wikidata.org/wiki/Wikidata:Licensing"],
      ["StatsBomb Open Data - eventos historicos", "https://github.com/statsbomb/open-data"],
      ["Wyscout/Figshare - soccer match event dataset", "https://figshare.com/collections/Soccer_match_event_dataset/4415000"],
      ["API-Football - estadisticas por fixture", "https://api-sports.io/documentation/football/v3"],
      ["football-data.org - API de partidos y competiciones", "https://www.football-data.org/documentation/api"],
      ["Repositorio del proyecto", window.APP_CONFIG.githubRepo],
      ["Hoja operativa Google Sheets", `https://docs.google.com/spreadsheets/d/${window.APP_CONFIG.spreadsheetId}/edit`]
    ];
    $("#rightsPanel").innerHTML = `
      <div class="rights-list">
        <article>
          <strong>Uso academico</strong>
          <p>La app es un material didactico de estadistica; no es una herramienta de apuestas ni una fuente oficial de resultados.</p>
        </article>
        <article>
          <strong>Trazabilidad</strong>
          <p>Cada generacion conserva URL, fecha de descarga, bytes y hash SHA-256 en el manifest publico.</p>
        </article>
        <article>
          <strong>Derechos de datos</strong>
          <p>Las marcas, nombres de torneos y contenidos de terceros pertenecen a sus titulares. Antes de reutilizar datos fuera del aula se deben revisar las condiciones de cada fuente enlazada.</p>
        </article>
        <article>
          <strong>Imagenes y banderas</strong>
          <p>Las banderas se muestran como SVG abiertos de flag-icons bajo licencia MIT. Las fotos de jugadores se muestran solo cuando existe una imagen libre con fuente y licencia registradas; si no hay licencia clara, se muestra un avatar.</p>
        </article>
        <article>
          <strong>Cobertura historica</strong>
          <p>Se procesan ${historicalCount} archivos historicos estructurados de OpenFootball y se enlaza el archivo FIFA como referencia oficial de consulta.</p>
        </article>
        <article>
          <strong>Datos finos de partido</strong>
          <p>StatsBomb Open Data y Wyscout/Figshare son utiles para estudiar eventos historicos como pases, tiros, ubicacion y acciones. Para 2026 en vivo, APIs como API-Football pueden ofrecer estadisticas por fixture, pero requieren revisar plan, token, licencia y permiso de redistribucion antes de integrarlas.</p>
        </article>
      </div>
    `;
    $("#linksPanel").innerHTML = links
      .map(
        ([label, url]) => `
          <a class="link-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
            <strong>${escapeHtml(label)}</strong>
            <span>${escapeHtml(url)}</span>
          </a>
        `
      )
      .join("");
  }

  function teamTooltip(team) {
    const history = (state.data.history?.countries || []).find((row) => row.team === team.team);
    return `
      <div class="tooltip-head">
        ${flagMarkup(team.team, "flag-badge tooltip-flag")}
        <div>
          <strong>${escapeHtml(team.team)}</strong>
          <small>${escapeHtml(team.group)} · rating ${team.rating}</small>
        </div>
      </div>
      <div class="tooltip-grid">
        <span><b>${WorldCupBayes.pct(team.p_advance_group)}</b><small>avance</small></span>
        <span><b>${WorldCupBayes.number(team.attack_posterior_mean)}</b><small>ataque</small></span>
        <span><b>${WorldCupBayes.number(team.defense_posterior_mean)}</b><small>defensa</small></span>
        <span><b>${team.squad.players || 0}</b><small>jugadores</small></span>
      </div>
      <p>${history ? `${history.appearances} Copas, ${history.matches} partidos historicos, ${history.goals_for}/${history.goals_against} GF/GC.` : "Sin resumen historico agregado para este pais."}</p>
    `;
  }

  function glossaryTooltip(key) {
    const item = GLOSSARY[key];
    if (!item) return "";
    return `
      <div class="tooltip-head glossary">
        <span class="tooltip-icon">i</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <small>definicion didactica</small>
        </div>
      </div>
      <p>${escapeHtml(item.body)}</p>
      ${
        item.bullets?.length
          ? `<ul class="tooltip-list">${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
          : ""
      }
    `;
  }

  function playerTooltip(player) {
    const media = playerMedia(player);
    const photo = playerPortraitMarkup(player, "large");
    return `
      <div class="tooltip-head player">
        ${photo}
        <div>
          <strong>${escapeHtml(cleanPlayerName(player.name))}</strong>
          <small>${flagMarkup(player.team)}${escapeHtml(player.team)} · ${escapeHtml(player.position)} · ${escapeHtml(player.club || "s/d")}</small>
        </div>
      </div>
      <div class="tooltip-grid">
        <span><b>${player.age ?? "s/d"}</b><small>edad</small></span>
        <span><b>${player.caps ?? 0}</b><small>caps</small></span>
        <span><b>${player.goals ?? 0}</b><small>goles</small></span>
        <span><b>${player.number ?? "s/d"}</b><small>dorsal</small></span>
      </div>
      ${
        media
          ? `<p class="media-source">Foto: ${escapeHtml(media.author)} · ${escapeHtml(media.license)} · <a href="${escapeHtml(media.source)}" target="_blank" rel="noopener noreferrer">Commons</a></p>`
          : `<p class="media-source">Sin foto libre verificada en el manifest; se muestra avatar academico.</p>`
      }
    `;
  }

  function tooltipContent(target) {
    if (target.dataset.kind === "glossary") {
      return glossaryTooltip(target.dataset.glossary);
    }
    if (!state.data) return "";
    if (target.dataset.kind === "team") {
      const team = teamRecord(target.dataset.team);
      return team ? teamTooltip(team) : "";
    }
    if (target.dataset.kind === "player") {
      const player = state.data.players.find((item) => playerKey(item) === target.dataset.playerKey);
      return player ? playerTooltip(player) : "";
    }
    return "";
  }

  function positionTooltip(event, tooltip) {
    const margin = 14;
    const width = tooltip.offsetWidth || 320;
    const height = tooltip.offsetHeight || 220;
    const x = Math.min(window.innerWidth - width - margin, Math.max(margin, event.clientX + 16));
    const y = Math.min(window.innerHeight - height - margin, Math.max(margin, event.clientY + 16));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function bindRichTooltips() {
    const tooltip = $("#richTooltip");
    if (!tooltip) return;
    let activeTarget = null;
    const show = (target, event) => {
      const html = tooltipContent(target);
      if (!html) return;
      activeTarget = target;
      tooltip.innerHTML = html;
      tooltip.hidden = false;
      positionTooltip(event, tooltip);
    };
    const hide = () => {
      activeTarget = null;
      tooltip.hidden = true;
    };
    document.addEventListener("pointerover", (event) => {
      const target = event.target.closest(".has-rich-popover");
      if (target) show(target, event);
    });
    document.addEventListener("pointermove", (event) => {
      if (!activeTarget || tooltip.hidden) return;
      positionTooltip(event, tooltip);
    });
    document.addEventListener("pointerout", (event) => {
      if (activeTarget && !event.relatedTarget?.closest?.(".has-rich-popover")) hide();
    });
    document.addEventListener("focusin", (event) => {
      const target = event.target.closest(".has-rich-popover");
      if (target) show(target, { clientX: 24, clientY: 88 });
    });
    document.addEventListener("focusout", hide);
    document.addEventListener("click", (event) => {
      const target = event.target.closest(".has-rich-popover");
      if (!target) return;
      show(target, event);
    });
  }

  function renderAll() {
    markRecalculating();
    renderKpis();
    renderModelFlow();
    renderModelFlowForecast();
    renderFilters();
    renderGroupHeatmap();
    renderAttackDefenseChart();
    renderNextMatches();
    renderClassroomCards();
    renderContenders();
    renderStandings();
    renderMatches();
    renderTournamentViews();
    renderTeams();
    renderPlayers();
    renderEvidence();
    renderModelLab();
    renderMethod();
    renderMethodologyDeep();
    renderPredictions();
    renderAuthorCards();
    renderSourcePanel();
    renderVisitStats();
    renderReferences();
  }

  function activateView(target, options = {}) {
    $$(".tab-button").forEach((item) => item.classList.toggle("active", item.dataset.target === target));
    $$(".view").forEach((view) => view.classList.toggle("active", view.id === target));
    if (options.track !== false) trackView(target);
  }

  function bindNavigation() {
    $$(".tab-button").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.target;
        activateView(target);
        const url = new URL(window.location.href);
        url.searchParams.set("view", target);
        window.history.replaceState({}, "", url);
      });
    });
    $("#userButton").addEventListener("click", () => showAuthGate(true));
    $("#viewScaleButton")?.addEventListener("click", cycleViewScale);
    document.addEventListener("click", (event) => {
      if (event.target.closest("#editRegistration")) {
        showAuthGate(true);
      }
      if (event.target.closest("#clearRegistration")) {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(VISIT_STORAGE_KEY);
        state.user = null;
        state.visits = null;
        renderUserButton();
        showAuthGate(false);
      }
      const savePrediction = event.target.closest("[data-save-prediction]");
      if (savePrediction) {
        const card = savePrediction.closest(".prediction-card");
        if (!card || !state.data) return;
        const matchId = card.dataset.matchId;
        const match = state.data.matches.find((item) => item.match_id === matchId);
        if (!match || match.status === "final") return;
        const homeInput = card.querySelector('[data-pred-field="goals_home"]');
        const awayInput = card.querySelector('[data-pred-field="goals_away"]');
        const confidenceInput = card.querySelector('[data-pred-field="confidence"]');
        const home = Number(homeInput.value);
        const away = Number(awayInput.value);
        if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
          card.classList.add("needs-score");
          return;
        }
        const predictions = loadPredictions();
        const record = {
          match_id: matchId,
          team1: match.team1,
          team2: match.team2,
          goals_home: home,
          goals_away: away,
          confidence: Number(confidenceInput.value || 60),
          data_version: state.data.metadata.data_version,
          updated_at: new Date().toISOString()
        };
        predictions[matchId] = record;
        savePredictions(predictions);
        sendPredictionEvent(match, record);
        renderPredictions();
      }
    });
  }

  function bindAuth() {
    $("#registrationForm").addEventListener("submit", handleRegistration);
  }

  function bindFilters() {
    $("#groupButtons").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-group]");
      if (!button) return;
      state.filters.group = button.dataset.group;
      state.filters.team = "all";
      renderAll();
    });
    $("#groupHeatmap").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-group]");
      if (!button) return;
      state.filters.group = button.dataset.group;
      state.filters.team = "all";
      renderAll();
    });
    $("#teamFilter").addEventListener("change", (event) => {
      state.filters.team = event.target.value;
      const selectedTeam = teamRecord(state.filters.team);
      if (selectedTeam) state.filters.group = selectedTeam.group;
      renderAll();
    });
    $("#cupFilter").addEventListener("change", (event) => {
      state.filters.cup = event.target.value;
      renderAll();
    });
    $("#teamQuickButtons").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-team]");
      if (!button) return;
      state.filters.team = button.dataset.team;
      const selectedTeam = teamRecord(state.filters.team);
      if (selectedTeam) state.filters.group = selectedTeam.group;
      renderAll();
    });
    $("#statusButtons").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-status]");
      if (!button) return;
      state.filters.matchStatus = button.dataset.status;
      renderAll();
    });
    $("#positionButtons").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-position]");
      if (!button) return;
      state.filters.playerPosition = button.dataset.position;
      renderAll();
    });
    $("#searchInput").addEventListener("input", (event) => {
      state.filters.query = event.target.value;
      renderAll();
    });
    ["#resetFilters", "#globalResetFilters"].forEach((selector) => {
      $(selector)?.addEventListener("click", resetAllFilters);
    });

    $("#wallFocusButtons")?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-wall-focus]");
      if (!button) return;
      state.wallFocus = button.dataset.wallFocus;
      updateWallViewport(true);
    });

    $("#wallZoom")?.addEventListener("input", (event) => {
      state.wallZoom = Number(event.target.value || 86) / 100;
      updateWallViewport(false);
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("a, input, select, textarea, .info-tip, [data-save-prediction]")) return;
      const target = event.target.closest("[data-filter-team], [data-filter-group], [data-filter-cup], [data-filter-status], [data-filter-position], [data-filter-query], [data-filter-match]");
      if (!target) return;
      if (target.dataset.filterMatch && applyMatchFilter(target.dataset.filterMatch)) {
        event.preventDefault();
        return;
      }
      const filters = {};
      if (target.dataset.filterTeam) filters.team = target.dataset.filterTeam;
      if (target.dataset.filterGroup) filters.group = target.dataset.filterGroup;
      if (target.dataset.filterCup) filters.cup = target.dataset.filterCup;
      if (target.dataset.filterStatus) filters.status = target.dataset.filterStatus;
      if (target.dataset.filterPosition) filters.position = target.dataset.filterPosition;
      if (target.dataset.filterQuery !== undefined) filters.query = target.dataset.filterQuery;
      if (!Object.keys(filters).length) return;
      event.preventDefault();
      applyGlobalFilter(filters);
    });

    document.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const target = event.target.closest?.("[data-filter-team], [data-filter-group], [data-filter-cup], [data-filter-status], [data-filter-position], [data-filter-query], [data-filter-match]");
      if (!target) return;
      target.click();
      event.preventDefault();
    });
  }

  function bindInstall() {
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      $("#installButton").hidden = false;
    });
    $("#installButton").addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      $("#installButton").hidden = true;
    });
  }

  function bindOnlineStatus() {
    function update() {
      $("#onlineStatus").textContent = navigator.onLine ? "online" : "offline";
      $("#onlineStatus").classList.toggle("offline", !navigator.onLine);
    }
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
  }

  function drawSoccerPolygon(ctx, sides, radius, rotation) {
    ctx.beginPath();
    for (let i = 0; i < sides; i += 1) {
      const angle = rotation + (Math.PI * 2 * i) / sides;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawSoccerBall(ctx, ball, image) {
    const { x, y, radius, angle } = ball;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (image?.complete && image.naturalWidth) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.08, 0, Math.PI * 2);
      ctx.clip();
      const size = radius * 3.05;
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }

    const body = ctx.createRadialGradient(-radius * 0.35, -radius * 0.38, radius * 0.08, 0, 0, radius);
    body.addColorStop(0, "#ffffff");
    body.addColorStop(0.58, "#eef5f2");
    body.addColorStop(1, "#b7c6c1");

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.clip();

    ctx.strokeStyle = "rgba(18, 30, 28, 0.28)";
    ctx.lineWidth = Math.max(1.4, radius * 0.055);
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI * 2 * i) / 6 + angle * 0.35;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * radius * 0.18, Math.sin(a) * radius * 0.18);
      ctx.quadraticCurveTo(
        Math.cos(a + 0.34) * radius * 0.52,
        Math.sin(a + 0.34) * radius * 0.52,
        Math.cos(a) * radius * 0.92,
        Math.sin(a) * radius * 0.92
      );
      ctx.stroke();
    }

    ctx.fillStyle = "#101817";
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = Math.max(1, radius * 0.035);
    ctx.save();
    drawSoccerPolygon(ctx, 5, radius * 0.28, -Math.PI / 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
      ctx.save();
      ctx.translate(Math.cos(a) * radius * 0.62, Math.sin(a) * radius * 0.62);
      ctx.rotate(a + angle * 0.18);
      drawSoccerPolygon(ctx, 5, radius * 0.18, -Math.PI / 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.rotate(-angle);
    const shine = ctx.createRadialGradient(-radius * 0.42, -radius * 0.46, 0, -radius * 0.42, -radius * 0.46, radius * 0.75);
    shine.addColorStop(0, "rgba(255,255,255,0.62)");
    shine.addColorStop(0.45, "rgba(255,255,255,0.14)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = shine;
    ctx.fill();

    ctx.restore();
  }

  function setupHeroBallCanvas() {
    const canvas = $("#heroBallCanvas");
    if (!canvas || canvas.dataset.ready === "true") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.dataset.ready = "true";

    const ballImage = new Image();
    ballImage.decoding = "async";
    ballImage.src = GENERATED_BALL_IMAGE_SRC;
    ballImage.addEventListener("load", () => restart(), { once: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = null;
    let lastTime = performance.now();
    let trail = [];
    let bounds = null;
    const ball = {
      x: 0,
      y: 0,
      vx: 2.6,
      vy: 1.45,
      radius: 30,
      angle: 0
    };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ball.radius = rect.width < 680 ? 22 : 34;
      const minX = rect.width < 680 ? rect.width * 0.66 : rect.width * 0.46;
      bounds = {
        width: rect.width,
        height: rect.height,
        minX: Math.min(rect.width - ball.radius, Math.max(ball.radius, minX)),
        maxX: rect.width - ball.radius - 18,
        minY: ball.radius + 16,
        maxY: rect.height - ball.radius - 18
      };
      if (!ball.x || !ball.y) {
        ball.x = bounds.minX + ball.radius * 1.4;
        ball.y = bounds.minY + ball.radius * 0.8;
      }
      ball.x = Math.max(bounds.minX, Math.min(bounds.maxX, ball.x));
      ball.y = Math.max(bounds.minY, Math.min(bounds.maxY, ball.y));
    }

    function drawFrame(now) {
      if (!bounds) resize();
      if (!bounds) return;
      const dt = Math.min(2.4, Math.max(0.4, (now - lastTime) / 16.7));
      lastTime = now;
      ctx.clearRect(0, 0, bounds.width, bounds.height);

      if (!reduced.matches) {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        if (ball.x <= bounds.minX || ball.x >= bounds.maxX) {
          ball.x = Math.max(bounds.minX, Math.min(bounds.maxX, ball.x));
          ball.vx *= -1;
        }
        if (ball.y <= bounds.minY || ball.y >= bounds.maxY) {
          ball.y = Math.max(bounds.minY, Math.min(bounds.maxY, ball.y));
          ball.vy *= -1;
        }
        ball.angle += (ball.vx / ball.radius) * dt * 0.9;
      }

      trail.push({ x: ball.x, y: ball.y, radius: ball.radius, age: 0 });
      trail = trail
        .map((item) => ({ ...item, age: item.age + 1 }))
        .filter((item) => item.age < 18);

      trail.forEach((item) => {
        const alpha = Math.max(0, 1 - item.age / 18) * 0.28;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius * (0.5 + item.age / 44), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 201, 107, ${alpha})`;
        ctx.fill();
      });

      ctx.save();
      ctx.translate(ball.x + ball.radius * 0.18, ball.y + ball.radius * 1.08);
      ctx.scale(1.2, 0.32);
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius * 0.84, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
      ctx.filter = "blur(5px)";
      ctx.fill();
      ctx.restore();
      ctx.filter = "none";

      drawSoccerBall(ctx, ball, ballImage);
      frame = reduced.matches ? null : requestAnimationFrame(drawFrame);
    }

    function restart() {
      resize();
      if (frame) cancelAnimationFrame(frame);
      lastTime = performance.now();
      trail = [];
      if (reduced.matches) drawFrame(lastTime);
      else frame = requestAnimationFrame(drawFrame);
    }

    const observer = new ResizeObserver(restart);
    observer.observe(canvas);
    reduced.addEventListener?.("change", restart);
    restart();
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("service-worker.js");
    } catch (error) {
      console.warn("service worker unavailable", error);
    }
  }

  async function startApp() {
    if (state.appStarted) return;
    state.appStarted = true;
    try {
      const loaded = await window.WorldCupData.loadWorldCupData();
      state.data = loaded.data;
      state.status = loaded.status;
      renderAll();
      const requestedView = new URLSearchParams(window.location.search).get("view");
      const target = requestedView && document.getElementById(requestedView) ? requestedView : state.visits?.last_view || "resumen";
      if (document.getElementById(target)) activateView(target, { track: false });
      trackView(target);
      $("#appShell").classList.remove("loading");
    } catch (error) {
      $("#fatalError").hidden = false;
      $("#fatalError").textContent = `No se pudieron cargar los datos publicos: ${error.message}`;
    }
  }

  async function init() {
    applyViewScale(loadViewScale());
    bindNavigation();
    bindAuth();
    bindFilters();
    bindInstall();
    bindOnlineStatus();
    bindRichTooltips();
    setupHeroBallCanvas();
    await registerServiceWorker();
    state.user = loadUserProfile();
    renderUserButton();
    if (!state.user) {
      showAuthGate(false);
      $("#appShell").classList.remove("loading");
      return;
    }
    beginVisitSession();
    hideAuthGate();
    await startApp();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
