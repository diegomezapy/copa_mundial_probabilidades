(function () {
  const MAX_GOALS = 10;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function factorial(n) {
    let result = 1;
    for (let i = 2; i <= n; i += 1) result *= i;
    return result;
  }

  function poisson(lam, k) {
    return Math.exp(-lam) * Math.pow(lam, k) / factorial(k);
  }

  function poissonVector(lam, maxGoals = MAX_GOALS) {
    const values = [];
    let sum = 0;
    for (let i = 0; i <= maxGoals; i += 1) {
      const p = poisson(lam, i);
      values.push(p);
      sum += p;
    }
    values[maxGoals] += Math.max(0, 1 - sum);
    return values;
  }

  function matchProbabilities(lambdaHome, lambdaAway) {
    const home = poissonVector(clamp(lambdaHome, 0.15, 5.5));
    const away = poissonVector(clamp(lambdaAway, 0.15, 5.5));
    let homeWin = 0;
    let draw = 0;
    let awayWin = 0;
    const scoreGrid = [];
    for (let h = 0; h < home.length; h += 1) {
      for (let a = 0; a < away.length; a += 1) {
        const p = home[h] * away[a];
        if (h > a) homeWin += p;
        if (h === a) draw += p;
        if (h < a) awayWin += p;
        if (h <= 5 && a <= 5) {
          scoreGrid.push({ score: `${h}-${a}`, probability: p });
        }
      }
    }
    scoreGrid.sort((x, y) => y.probability - x.probability);
    return {
      home_win: homeWin,
      draw,
      away_win: awayWin,
      expected_goals_home: lambdaHome,
      expected_goals_away: lambdaAway,
      scoreGrid: scoreGrid.slice(0, 8)
    };
  }

  function predictFromTeams(teamA, teamB) {
    const lambdaHome = Math.sqrt(teamA.attack_posterior_mean * teamB.defense_posterior_mean);
    const lambdaAway = Math.sqrt(teamB.attack_posterior_mean * teamA.defense_posterior_mean);
    return matchProbabilities(lambdaHome, lambdaAway);
  }

  function pct(value, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "s/d";
    return `${(Number(value) * 100).toFixed(digits)}%`;
  }

  function number(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "s/d";
    return Number(value).toLocaleString("es-PY", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits
    });
  }

  window.WorldCupBayes = {
    matchProbabilities,
    predictFromTeams,
    pct,
    number
  };
})();

