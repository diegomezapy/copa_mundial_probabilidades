(function () {
  const state = {
    data: null,
    status: null,
    filters: {
      group: "all",
      team: "all",
      query: "",
      matchStatus: "all"
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  function bar(value, label) {
    const width = Math.round((Number(value) || 0) * 100);
    return `
      <div class="bar" aria-label="${escapeHtml(label)} ${width}%">
        <span style="width:${Math.min(100, width)}%"></span>
      </div>
    `;
  }

  function renderKpis() {
    const meta = state.data.metadata;
    const coverage = meta.coverage;
    const versionDate = meta.generated_at ? meta.generated_at.slice(0, 10) : meta.data_version;
    $("#kpiGrid").innerHTML = `
      <article class="kpi">
        <span>Equipos</span>
        <strong>${coverage.teams}</strong>
      </article>
      <article class="kpi">
        <span>Jugadores</span>
        <strong>${coverage.players.toLocaleString("es-PY")}</strong>
      </article>
      <article class="kpi">
        <span>Partidos</span>
        <strong>${coverage.completed_matches}/${coverage.matches}</strong>
      </article>
      <article class="kpi">
        <span>Version de datos</span>
        <strong>${escapeHtml(versionDate)}</strong>
      </article>
    `;
    $("#dataStatus").textContent = `${state.status.source === "gas" ? "GAS" : "JSON publico"} · ${fullDateTime(meta.generated_at)}`;
    $("#backendStatus").textContent = state.status.error ? `Fallback activo: ${state.status.error}` : state.status.backend;
  }

  function renderContenders() {
    const rows = [...state.data.teams].sort((a, b) => b.p_champion_rough - a.p_champion_rough).slice(0, 10);
    $("#contenders").innerHTML = rows
      .map(
        (team, index) => `
        <article class="rank-row">
          <div>
            <span class="rank">${index + 1}</span>
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

  function groupOptions() {
    const groups = Object.keys(state.data.groups);
    return `<option value="all">Todos los grupos</option>${groups
      .map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`)
      .join("")}`;
  }

  function teamOptions() {
    return `<option value="all">Todos los equipos</option>${state.data.teams
      .map((team) => `<option value="${escapeHtml(team.team)}">${escapeHtml(team.team)}</option>`)
      .join("")}`;
  }

  function renderFilters() {
    $("#groupFilter").innerHTML = groupOptions();
    $("#teamFilter").innerHTML = teamOptions();
    $("#groupFilter").value = state.filters.group;
    $("#teamFilter").value = state.filters.team;
    $("#matchStatusFilter").value = state.filters.matchStatus;
  }

  function renderStandings() {
    const selected = state.filters.group;
    const groups = selected === "all" ? Object.keys(state.data.standings) : [selected];
    $("#standings").innerHTML = groups
      .map((group) => {
        const rows = state.data.standings[group] || [];
        return `
          <section class="table-block">
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
                      const team = state.data.teams.find((item) => item.team === row.team);
                      return `
                        <tr>
                          <td><strong>${escapeHtml(row.team)}</strong></td>
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
    const query = state.filters.query.toLowerCase();
    const rows = state.data.matches
      .filter((match) => state.filters.group === "all" || match.group === state.filters.group)
      .filter((match) => state.filters.team === "all" || match.team1 === state.filters.team || match.team2 === state.filters.team)
      .filter((match) => state.filters.matchStatus === "all" || match.status === state.filters.matchStatus)
      .filter((match) => {
        if (!query) return true;
        return `${match.team1} ${match.team2} ${match.ground} ${match.round}`.toLowerCase().includes(query);
      });

    $("#matchesCount").textContent = `${rows.length} partidos`;
    $("#matchesTable").innerHTML = rows
      .map((match) => {
        const pred = match.prediction;
        const score = match.score ? `${match.score.team1}-${match.score.team2}` : "pendiente";
        return `
          <tr>
            <td>${shortDate(match.date)}<small>${escapeHtml(match.time)}</small></td>
            <td><strong>${escapeHtml(match.team1)}</strong><small>${escapeHtml(match.team2)}</small></td>
            <td>${escapeHtml(match.group || match.round)}</td>
            <td>${escapeHtml(match.ground)}</td>
            <td><span class="status ${match.status}">${score}</span></td>
            <td>
              ${
                pred
                  ? `<span>${WorldCupBayes.pct(pred.home_win)} · ${WorldCupBayes.pct(pred.draw)} · ${WorldCupBayes.pct(pred.away_win)}</span>`
                  : "s/d"
              }
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function renderTeams() {
    const query = state.filters.query.toLowerCase();
    const rows = state.data.teams
      .filter((team) => state.filters.group === "all" || team.group === state.filters.group)
      .filter((team) => state.filters.team === "all" || team.team === state.filters.team)
      .filter((team) => !query || team.team.toLowerCase().includes(query))
      .sort((a, b) => b.p_advance_group - a.p_advance_group);

    $("#teamsGrid").innerHTML = rows
      .map(
        (team) => `
        <article class="team-card">
          <header>
            <strong>${escapeHtml(team.team)}</strong>
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
    const query = state.filters.query.toLowerCase();
    const rows = state.data.players
      .filter((player) => state.filters.team === "all" || player.team === state.filters.team)
      .filter((player) => {
        if (state.filters.group === "all") return true;
        const team = state.data.teams.find((item) => item.team === player.team);
        return team?.group === state.filters.group;
      })
      .filter((player) => {
        if (!query) return true;
        return `${player.name} ${player.team} ${player.club} ${player.position}`.toLowerCase().includes(query);
      })
      .slice(0, 260);

    $("#playersCount").textContent = `${rows.length} visibles`;
    $("#playersTable").innerHTML = rows
      .map(
        (player) => `
        <tr>
          <td>${player.number ?? ""}</td>
          <td><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.club)}</small></td>
          <td>${escapeHtml(player.team)}</td>
          <td>${escapeHtml(player.position)}</td>
          <td>${player.age ?? "s/d"}</td>
          <td>${player.caps}</td>
          <td>${player.goals}</td>
        </tr>
      `
      )
      .join("");
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

  function renderSourcePanel() {
    const sources = state.data.sources;
    $("#sourcePanel").innerHTML = `
      <p><strong>OpenFootball</strong><span>${escapeHtml(sources.openfootball_worldcup_json.url)}</span></p>
      <p><strong>Squads</strong><span>${escapeHtml(sources.wikipedia_squads.url)}</span></p>
      <p><strong>Referencia oficial</strong><span>${escapeHtml(sources.official_reference.url)}</span></p>
      <p><strong>Hoja operativa</strong><span>${escapeHtml(window.APP_CONFIG.spreadsheetId)}</span></p>
    `;
  }

  function renderAll() {
    renderKpis();
    renderFilters();
    renderContenders();
    renderStandings();
    renderMatches();
    renderTeams();
    renderPlayers();
    renderModelLab();
    renderMethod();
    renderSourcePanel();
  }

  function bindNavigation() {
    $$(".tab-button").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.target;
        $$(".tab-button").forEach((item) => item.classList.toggle("active", item === button));
        $$(".view").forEach((view) => view.classList.toggle("active", view.id === target));
      });
    });
  }

  function bindFilters() {
    $("#groupFilter").addEventListener("change", (event) => {
      state.filters.group = event.target.value;
      renderAll();
    });
    $("#teamFilter").addEventListener("change", (event) => {
      state.filters.team = event.target.value;
      renderAll();
    });
    $("#matchStatusFilter").addEventListener("change", (event) => {
      state.filters.matchStatus = event.target.value;
      renderMatches();
    });
    $("#searchInput").addEventListener("input", (event) => {
      state.filters.query = event.target.value;
      renderMatches();
      renderTeams();
      renderPlayers();
    });
    $("#resetFilters").addEventListener("click", () => {
      state.filters = { group: "all", team: "all", query: "", matchStatus: "all" };
      $("#searchInput").value = "";
      renderAll();
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

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("service-worker.js");
    } catch (error) {
      console.warn("service worker unavailable", error);
    }
  }

  async function init() {
    bindNavigation();
    bindFilters();
    bindInstall();
    bindOnlineStatus();
    await registerServiceWorker();
    try {
      const loaded = await window.WorldCupData.loadWorldCupData();
      state.data = loaded.data;
      state.status = loaded.status;
      renderAll();
      $("#appShell").classList.remove("loading");
    } catch (error) {
      $("#fatalError").hidden = false;
      $("#fatalError").textContent = `No se pudieron cargar los datos publicos: ${error.message}`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
