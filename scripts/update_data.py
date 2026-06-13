#!/usr/bin/env python3
"""Build the public World Cup 2026 data cache and Bayesian forecasts.

The script intentionally uses open, reproducible sources and records source
metadata in the generated JSON. It does not require API keys.
"""

from __future__ import annotations

import hashlib
import csv
import json
import math
import random
import re
import statistics
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
from typing import Any

import pandas as pd
import requests
from bs4 import BeautifulSoup


APP_VERSION = "0.2.11"
DATA_VERSION_PREFIX = "wc26"
ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SHEETS_DIR = DATA_DIR / "sheets"
WORLD_CUP_YEARS = [
    1930,
    1934,
    1938,
    1950,
    1954,
    1958,
    1962,
    1966,
    1970,
    1974,
    1978,
    1982,
    1986,
    1990,
    1994,
    1998,
    2002,
    2006,
    2010,
    2014,
    2018,
    2022,
]
OPENFOOTBALL_2026_URL = (
    "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json"
)
OPENFOOTBALL_YEAR_URL = (
    "https://raw.githubusercontent.com/openfootball/worldcup.json/master/{year}/worldcup.json"
)
SQUADS_URL = "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads"
USER_AGENT = (
    "MundialProbabilidadesAcademicBot/0.1 "
    "(https://github.com/diegomezapy/copa_mundial_probabilidades)"
)

TEAM_ALIASES = {
    "Bosnia and Herzegovina": "Bosnia & Herzegovina",
    "Bosnia-Herzegovina": "Bosnia & Herzegovina",
    "Cote d'Ivoire": "Ivory Coast",
    "Côte d'Ivoire": "Ivory Coast",
    "Czechoslovakia": "Czech Republic",
    "DR Congo": "DR Congo",
    "Germany FR": "Germany",
    "Iran": "Iran",
    "South Korea": "South Korea",
    "Türkiye": "Turkey",
    "United States": "USA",
    "United States of America": "USA",
    "West Germany": "Germany",
}

POSITION_ALIASES = {
    "1GK": "GK",
    "2DF": "DF",
    "3MF": "MF",
    "4FW": "FW",
    "GK": "GK",
    "DF": "DF",
    "MF": "MF",
    "FW": "FW",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def http_get(url: str) -> tuple[str, dict[str, Any]]:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=45)
    response.raise_for_status()
    body = response.text
    return body, {
        "url": url,
        "downloaded_at": now_iso(),
        "status_code": response.status_code,
        "bytes": len(response.content),
        "sha256": hashlib.sha256(response.content).hexdigest(),
    }


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    text = re.sub(r"\[\s*\d+\s*\]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_int(value: Any) -> int | None:
    text = clean_text(value)
    if not text or text.lower() == "nan":
        return None
    match = re.search(r"-?\d+", text)
    return int(match.group(0)) if match else None


def normalize_team(name: str) -> str:
    return TEAM_ALIASES.get(clean_text(name), clean_text(name))


def team_id(name: str) -> str:
    base = normalize_team(name).lower()
    base = base.replace("&", "and")
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return base


def normalize_position(value: Any) -> str:
    text = clean_text(value).upper().replace(" ", "")
    if text in POSITION_ALIASES:
        return POSITION_ALIASES[text]
    for code in ("GK", "DF", "MF", "FW"):
        if code in text:
            return code
    return text[:3] if text else ""


def parse_birth(value: Any) -> tuple[str | None, int | None]:
    text = clean_text(value)
    iso = None
    match = re.search(r"(\d{4}-\d{2}-\d{2})", text)
    if match:
        iso = match.group(1)
    age = None
    match_age = re.search(r"aged\s+(\d+)", text)
    if match_age:
        age = int(match_age.group(1))
    return iso, age


def fetch_worldcup_2026() -> tuple[dict[str, Any], dict[str, Any]]:
    body, meta = http_get(OPENFOOTBALL_2026_URL)
    return json.loads(body), meta


def fetch_historical_worldcups() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    matches: list[dict[str, Any]] = []
    tournaments: list[dict[str, Any]] = []
    source_meta: list[dict[str, Any]] = []
    for year in WORLD_CUP_YEARS:
        try:
            body, meta = http_get(OPENFOOTBALL_YEAR_URL.format(year=year))
            data = json.loads(body)
        except Exception as exc:
            print(f"[warn] historical fetch failed for {year}: {exc}")
            continue
        source_meta.append(meta | {"year": year})
        teams = set()
        goals = 0
        for match in data.get("matches", []):
            if "score" in match and match["score"].get("ft"):
                item = dict(match)
                item["year"] = year
                item["tournament"] = data.get("name", f"World Cup {year}")
                matches.append(item)
                teams.add(normalize_team(item.get("team1", "")))
                teams.add(normalize_team(item.get("team2", "")))
                final_score = final_goals(item)
                if final_score:
                    goals += final_score[0] + final_score[1]
        champion = infer_champion(data.get("matches", []))
        tournaments.append(
            {
                "year": year,
                "name": data.get("name", f"World Cup {year}"),
                "matches": len(data.get("matches", [])),
                "teams": len([team for team in teams if team]),
                "goals": goals,
                "avg_goals": round(goals / max(1, len(data.get("matches", []))), 2),
                "champion": champion,
                "source": "openfootball_worldcup_json",
            }
        )
    return matches, tournaments, source_meta


def extract_squads() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    html, meta = http_get(SQUADS_URL)
    soup = BeautifulSoup(html, "lxml")
    players: list[dict[str, Any]] = []

    for table in soup.select("table.wikitable"):
        headers = [clean_text(th.get_text(" ")) for th in table.select("tr th")]
        if "Player" not in headers or "Caps" not in headers or "Club" not in headers:
            continue

        heading = table.find_previous(["h3", "h2"])
        if not heading:
            continue
        raw_team = clean_text(heading.get_text(" "))
        raw_team = re.sub(r"\s*\[edit\]\s*$", "", raw_team)
        if raw_team.startswith("Group "):
            continue
        team = normalize_team(raw_team)

        try:
            df = pd.read_html(StringIO(str(table)))[0]
        except Exception as exc:
            print(f"[warn] squad table parse failed for {team}: {exc}")
            continue
        expected = {"No.", "Pos.", "Player", "Date of birth (age)", "Caps", "Goals", "Club"}
        if not expected.issubset(set(map(str, df.columns))):
            continue

        for _, row in df.iterrows():
            name = clean_text(row.get("Player"))
            if not name or name.lower() == "nan":
                continue
            birth_date, age = parse_birth(row.get("Date of birth (age)"))
            player = {
                "team": team,
                "team_id": team_id(team),
                "number": parse_int(row.get("No.")),
                "position": normalize_position(row.get("Pos.")),
                "name": name,
                "birth_date": birth_date,
                "age": age,
                "caps": parse_int(row.get("Caps")) or 0,
                "goals": parse_int(row.get("Goals")) or 0,
                "club": clean_text(row.get("Club")),
                "source": "wikipedia_2026_squads",
            }
            players.append(player)

    meta["rows_extracted"] = len(players)
    return players, meta


def completed_score(match: dict[str, Any]) -> tuple[int, int] | None:
    score = match.get("score") or {}
    ft = score.get("ft")
    if isinstance(ft, list) and len(ft) == 2:
        return int(ft[0]), int(ft[1])
    return None


def final_goals(match: dict[str, Any]) -> tuple[int, int] | None:
    score = match.get("score") or {}
    for key in ("et", "ft"):
        value = score.get(key)
        if isinstance(value, list) and len(value) == 2:
            return int(value[0]), int(value[1])
    return None


def match_winner(match: dict[str, Any]) -> str | None:
    team1 = normalize_team(match.get("team1", ""))
    team2 = normalize_team(match.get("team2", ""))
    score = match.get("score") or {}
    penalty = score.get("p")
    if isinstance(penalty, list) and len(penalty) == 2 and penalty[0] != penalty[1]:
        return team1 if penalty[0] > penalty[1] else team2
    goals = final_goals(match)
    if not goals or goals[0] == goals[1]:
        return None
    return team1 if goals[0] > goals[1] else team2


def infer_champion(matches: list[dict[str, Any]]) -> str:
    final_match = next((m for m in reversed(matches) if clean_text(m.get("round")).lower() == "final"), None)
    candidate = final_match or (matches[-1] if matches else None)
    return match_winner(candidate) if candidate else ""


def build_elo(matches: list[dict[str, Any]]) -> dict[str, float]:
    ratings: dict[str, float] = defaultdict(lambda: 1500.0)
    ordered = sorted(matches, key=lambda m: (m.get("year", 0), m.get("date", ""), m.get("time", "")))
    for match in ordered:
        t1 = normalize_team(match.get("team1", ""))
        t2 = normalize_team(match.get("team2", ""))
        if not t1 or not t2:
            continue
        score = completed_score(match)
        if not score:
            continue
        g1, g2 = score
        if g1 > g2:
            s1, s2 = 1.0, 0.0
        elif g1 < g2:
            s1, s2 = 0.0, 1.0
        else:
            s1, s2 = 0.5, 0.5
        r1, r2 = ratings[t1], ratings[t2]
        e1 = 1 / (1 + 10 ** ((r2 - r1) / 400))
        margin = max(1, abs(g1 - g2))
        k = 22 + min(18, margin * 4)
        ratings[t1] = r1 + k * (s1 - e1)
        ratings[t2] = r2 + k * (s2 - (1 - e1))
    return dict(ratings)


def poisson_pmf(lam: float, max_goals: int = 10) -> list[float]:
    probs = []
    for k in range(max_goals + 1):
        probs.append(math.exp(-lam) * (lam**k) / math.factorial(k))
    tail = max(0.0, 1.0 - sum(probs))
    probs[-1] += tail
    return probs


def match_probs(lambda1: float, lambda2: float) -> dict[str, float]:
    p1 = poisson_pmf(lambda1)
    p2 = poisson_pmf(lambda2)
    win1 = draw = win2 = 0.0
    for g1, pg1 in enumerate(p1):
        for g2, pg2 in enumerate(p2):
            p = pg1 * pg2
            if g1 > g2:
                win1 += p
            elif g1 == g2:
                draw += p
            else:
                win2 += p
    return {
        "home_win": round(win1, 4),
        "draw": round(draw, 4),
        "away_win": round(win2, 4),
        "expected_goals_home": round(lambda1, 3),
        "expected_goals_away": round(lambda2, 3),
    }


def rank_table(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        rows,
        key=lambda r: (r["points"], r["goal_difference"], r["goals_for"], r["wins"], r["team"]),
        reverse=True,
    )


def init_standing(team: str, group: str) -> dict[str, Any]:
    return {
        "team": team,
        "team_id": team_id(team),
        "group": group,
        "played": 0,
        "wins": 0,
        "draws": 0,
        "losses": 0,
        "goals_for": 0,
        "goals_against": 0,
        "goal_difference": 0,
        "points": 0,
    }


def apply_result(table: dict[str, dict[str, Any]], team1: str, team2: str, goals1: int, goals2: int) -> None:
    r1, r2 = table[team1], table[team2]
    r1["played"] += 1
    r2["played"] += 1
    r1["goals_for"] += goals1
    r1["goals_against"] += goals2
    r2["goals_for"] += goals2
    r2["goals_against"] += goals1
    if goals1 > goals2:
        r1["wins"] += 1
        r2["losses"] += 1
        r1["points"] += 3
    elif goals1 < goals2:
        r2["wins"] += 1
        r1["losses"] += 1
        r2["points"] += 3
    else:
        r1["draws"] += 1
        r2["draws"] += 1
        r1["points"] += 1
        r2["points"] += 1
    r1["goal_difference"] = r1["goals_for"] - r1["goals_against"]
    r2["goal_difference"] = r2["goals_for"] - r2["goals_against"]


def build_groups(matches: list[dict[str, Any]]) -> dict[str, list[str]]:
    groups: dict[str, set[str]] = defaultdict(set)
    for match in matches:
        group = match.get("group")
        if not group:
            continue
        groups[group].add(normalize_team(match["team1"]))
        groups[group].add(normalize_team(match["team2"]))
    return {group: sorted(teams) for group, teams in sorted(groups.items())}


def build_actual_standings(matches: list[dict[str, Any]], groups: dict[str, list[str]]) -> dict[str, list[dict[str, Any]]]:
    standings: dict[str, list[dict[str, Any]]] = {}
    for group, teams in groups.items():
        table = {team: init_standing(team, group) for team in teams}
        for match in matches:
            if match.get("group") != group:
                continue
            score = completed_score(match)
            if not score:
                continue
            apply_result(table, normalize_team(match["team1"]), normalize_team(match["team2"]), score[0], score[1])
        standings[group] = rank_table(list(table.values()))
    return standings


@dataclass
class TeamPosterior:
    attack_mean: float
    defense_mean: float
    rating: float
    prior_weight: float
    played: int
    goals_for: int
    goals_against: int


def build_team_posteriors(
    teams: list[str],
    matches: list[dict[str, Any]],
    ratings: dict[str, float],
    squad_stats: dict[str, dict[str, Any]],
) -> dict[str, TeamPosterior]:
    goals_for = defaultdict(int)
    goals_against = defaultdict(int)
    played = defaultdict(int)
    for match in matches:
        score = completed_score(match)
        if not score:
            continue
        t1, t2 = normalize_team(match["team1"]), normalize_team(match["team2"])
        g1, g2 = score
        goals_for[t1] += g1
        goals_against[t1] += g2
        goals_for[t2] += g2
        goals_against[t2] += g1
        played[t1] += 1
        played[t2] += 1

    median_rating = statistics.median([ratings.get(team, 1500.0) for team in teams])
    posteriors: dict[str, TeamPosterior] = {}
    for team in teams:
        stats = squad_stats.get(team, {})
        caps_boost = min(65.0, math.log1p(stats.get("total_caps", 0)) * 9.0)
        goal_boost = min(35.0, math.log1p(stats.get("total_international_goals", 0)) * 5.5)
        rating = ratings.get(team, 1500.0) + caps_boost + goal_boost
        strength = math.exp((rating - median_rating) / 650.0)
        base_goals = 1.34
        prior_weight = 4.0
        attack_prior = base_goals * strength
        defense_prior = base_goals / max(0.55, strength)
        gf = goals_for[team]
        ga = goals_against[team]
        n = played[team]
        attack_mean = (attack_prior * prior_weight + gf) / (prior_weight + n)
        defense_mean = (defense_prior * prior_weight + ga) / (prior_weight + n)
        posteriors[team] = TeamPosterior(
            attack_mean=attack_mean,
            defense_mean=defense_mean,
            rating=rating,
            prior_weight=prior_weight,
            played=n,
            goals_for=gf,
            goals_against=ga,
        )
    return posteriors


def predict_match(team1: str, team2: str, posteriors: dict[str, TeamPosterior]) -> dict[str, float]:
    p1 = posteriors[team1]
    p2 = posteriors[team2]
    lambda1 = max(0.15, math.sqrt(p1.attack_mean * p2.defense_mean))
    lambda2 = max(0.15, math.sqrt(p2.attack_mean * p1.defense_mean))
    return match_probs(lambda1, lambda2)


def simulate_group_advancement(
    matches: list[dict[str, Any]],
    groups: dict[str, list[str]],
    posteriors: dict[str, TeamPosterior],
    iterations: int = 2500,
) -> dict[str, dict[str, float]]:
    rng = random.Random(20260612)
    counts = {team: {"top2": 0, "advance": 0, "third": 0} for teams in groups.values() for team in teams}
    group_matches = [m for m in matches if m.get("group")]

    def sample_poisson(lam: float) -> int:
        limit = math.exp(-lam)
        k = 0
        product = 1.0
        while product > limit:
            k += 1
            product *= rng.random()
        return max(0, k - 1)

    for _ in range(iterations):
        simulated_tables: dict[str, list[dict[str, Any]]] = {}
        thirds: list[dict[str, Any]] = []
        for group, teams in groups.items():
            table = {team: init_standing(team, group) for team in teams}
            for match in group_matches:
                if match.get("group") != group:
                    continue
                t1, t2 = normalize_team(match["team1"]), normalize_team(match["team2"])
                score = completed_score(match)
                if score:
                    g1, g2 = score
                else:
                    pred = predict_match(t1, t2, posteriors)
                    g1 = sample_poisson(pred["expected_goals_home"])
                    g2 = sample_poisson(pred["expected_goals_away"])
                apply_result(table, t1, t2, g1, g2)
            ordered = rank_table(list(table.values()))
            simulated_tables[group] = ordered
            counts[ordered[0]["team"]]["top2"] += 1
            counts[ordered[1]["team"]]["top2"] += 1
            counts[ordered[0]["team"]]["advance"] += 1
            counts[ordered[1]["team"]]["advance"] += 1
            thirds.append(ordered[2])
            counts[ordered[2]["team"]]["third"] += 1
        best_thirds = rank_table(thirds)[:8]
        for row in best_thirds:
            counts[row["team"]]["advance"] += 1

    return {
        team: {
            "p_top2": round(values["top2"] / iterations, 4),
            "p_third": round(values["third"] / iterations, 4),
            "p_advance_group": round(values["advance"] / iterations, 4),
        }
        for team, values in counts.items()
    }


def normalize_match(match: dict[str, Any], index: int, posteriors: dict[str, TeamPosterior]) -> dict[str, Any]:
    team1 = normalize_team(match.get("team1", ""))
    team2 = normalize_team(match.get("team2", ""))
    score = completed_score(match)
    prediction = None
    if team1 in posteriors and team2 in posteriors:
        prediction = predict_match(team1, team2, posteriors)
    return {
        "match_id": f"wc26-{index:03d}",
        "round": match.get("round", ""),
        "date": match.get("date", ""),
        "time": match.get("time", ""),
        "team1": team1,
        "team1_id": team_id(team1) if team1 else "",
        "team2": team2,
        "team2_id": team_id(team2) if team2 else "",
        "group": match.get("group", ""),
        "ground": match.get("ground", ""),
        "status": "final" if score else "scheduled",
        "score": {"team1": score[0], "team2": score[1]} if score else None,
        "goals1": match.get("goals1", []),
        "goals2": match.get("goals2", []),
        "prediction": prediction,
    }


def build_squad_stats(players: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    stats: dict[str, dict[str, Any]] = {}
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for player in players:
        grouped[player["team"]].append(player)
    for team, rows in grouped.items():
        ages = [row["age"] for row in rows if row.get("age") is not None]
        stats[team] = {
            "players": len(rows),
            "avg_age": round(sum(ages) / len(ages), 2) if ages else None,
            "total_caps": sum(row.get("caps", 0) for row in rows),
            "total_international_goals": sum(row.get("goals", 0) for row in rows),
            "goalkeepers": sum(1 for row in rows if row.get("position") == "GK"),
            "defenders": sum(1 for row in rows if row.get("position") == "DF"),
            "midfielders": sum(1 for row in rows if row.get("position") == "MF"),
            "forwards": sum(1 for row in rows if row.get("position") == "FW"),
        }
    return stats


def empty_team_history(team: str) -> dict[str, Any]:
    return {
        "team": team,
        "team_id": team_id(team),
        "appearances": set(),
        "matches": 0,
        "wins": 0,
        "draws": 0,
        "losses": 0,
        "goals_for": 0,
        "goals_against": 0,
        "goal_difference": 0,
        "knockout_matches": 0,
        "finals": 0,
        "titles": 0,
        "last_year": None,
    }


def normalize_history_row(row: dict[str, Any]) -> dict[str, Any]:
    appearances = sorted(row["appearances"])
    matches = row["matches"]
    wins = row["wins"]
    row = dict(row)
    row["appearances"] = len(appearances)
    row["years"] = appearances
    row["last_year"] = appearances[-1] if appearances else None
    row["win_rate"] = round(wins / matches, 4) if matches else 0
    row["goals_per_match"] = round(row["goals_for"] / matches, 3) if matches else 0
    row["goals_against_per_match"] = round(row["goals_against"] / matches, 3) if matches else 0
    return row


def is_knockout_round(round_name: str) -> bool:
    text = clean_text(round_name).lower()
    return any(
        key in text
        for key in [
            "round of",
            "quarter",
            "semi",
            "final",
            "third",
            "match for third",
            "replay",
        ]
    )


def build_historical_evidence(
    historical_matches: list[dict[str, Any]],
    tournaments: list[dict[str, Any]],
    current_matches: list[dict[str, Any]],
) -> dict[str, Any]:
    country: dict[str, dict[str, Any]] = {}
    country_year: dict[tuple[str, int], dict[str, Any]] = {}
    pair_stats: dict[tuple[str, str], dict[str, Any]] = {}
    scorer_stats: dict[tuple[str, str], dict[str, Any]] = {}
    tournament_by_year = {row["year"]: row for row in tournaments}

    def ensure_country(team: str) -> dict[str, Any]:
        if team not in country:
            country[team] = empty_team_history(team)
        return country[team]

    def ensure_country_year(team: str, year: int) -> dict[str, Any]:
        key = (team, year)
        if key not in country_year:
            country_year[key] = {
                "team": team,
                "team_id": team_id(team),
                "year": year,
                "matches": 0,
                "wins": 0,
                "draws": 0,
                "losses": 0,
                "goals_for": 0,
                "goals_against": 0,
                "goal_difference": 0,
                "stage_reached": "",
                "champion": tournament_by_year.get(year, {}).get("champion") == team,
            }
        return country_year[key]

    def add_scorer(team: str, year: int, goal: dict[str, Any], opponent: str) -> None:
        name = clean_text(goal.get("name"))
        if not name:
            return
        key = (team, name)
        row = scorer_stats.setdefault(
            key,
            {
                "team": team,
                "team_id": team_id(team),
                "player": name,
                "goals": 0,
                "years": set(),
                "opponents": set(),
            },
        )
        row["goals"] += 1
        row["years"].add(year)
        row["opponents"].add(opponent)

    for match in historical_matches:
        year = int(match["year"])
        t1 = normalize_team(match.get("team1", ""))
        t2 = normalize_team(match.get("team2", ""))
        if not t1 or not t2:
            continue
        goals = final_goals(match)
        if not goals:
            continue
        g1, g2 = goals
        winner = match_winner(match)
        round_name = clean_text(match.get("round"))
        knockout = is_knockout_round(round_name)

        for team, opponent, gf, ga in [(t1, t2, g1, g2), (t2, t1, g2, g1)]:
            row = ensure_country(team)
            row["appearances"].add(year)
            row["matches"] += 1
            row["goals_for"] += gf
            row["goals_against"] += ga
            row["goal_difference"] += gf - ga
            if winner == team:
                row["wins"] += 1
            elif winner is None:
                row["draws"] += 1
            else:
                row["losses"] += 1
            if knockout:
                row["knockout_matches"] += 1
            if round_name.lower() == "final":
                row["finals"] += 1
            year_row = ensure_country_year(team, year)
            year_row["matches"] += 1
            year_row["goals_for"] += gf
            year_row["goals_against"] += ga
            year_row["goal_difference"] += gf - ga
            year_row["stage_reached"] = round_name
            if winner == team:
                year_row["wins"] += 1
            elif winner is None:
                year_row["draws"] += 1
            else:
                year_row["losses"] += 1

        pair_key = tuple(sorted([t1, t2]))
        pair = pair_stats.setdefault(
            pair_key,
            {
                "pair_id": "__".join(team_id(team) for team in pair_key),
                "team_a": pair_key[0],
                "team_b": pair_key[1],
                "matches": 0,
                "draws": 0,
                "wins_a": 0,
                "wins_b": 0,
                "goals_a": 0,
                "goals_b": 0,
                "meetings": [],
            },
        )
        pair["matches"] += 1
        if pair_key[0] == t1:
            ga, gb = g1, g2
        else:
            ga, gb = g2, g1
        pair["goals_a"] += ga
        pair["goals_b"] += gb
        if winner is None:
            pair["draws"] += 1
        elif winner == pair_key[0]:
            pair["wins_a"] += 1
        else:
            pair["wins_b"] += 1
        pair["meetings"].append(
            {
                "year": year,
                "round": round_name,
                "team1": t1,
                "team2": t2,
                "score": f"{g1}-{g2}",
                "winner": winner or "draw",
                "ground": clean_text(match.get("ground")),
            }
        )

        for goal in match.get("goals1", []):
            add_scorer(t1, year, goal, t2)
        for goal in match.get("goals2", []):
            add_scorer(t2, year, goal, t1)

    current_teams = sorted(
        {
            normalize_team(match.get("team1", ""))
            for match in current_matches
            if match.get("team1")
        }
        | {
            normalize_team(match.get("team2", ""))
            for match in current_matches
            if match.get("team2")
        }
    )
    for team in current_teams:
        ensure_country(team)

    for tournament in tournaments:
        champion = normalize_team(tournament.get("champion", ""))
        if champion:
            ensure_country(champion)["titles"] += 1

    historical_matches_light = []
    for idx, match in enumerate(historical_matches, 1):
        goals = final_goals(match)
        historical_matches_light.append(
            {
                "historical_match_id": f"hist-{match['year']}-{idx:04d}",
                "year": match["year"],
                "round": clean_text(match.get("round")),
                "date": clean_text(match.get("date")),
                "team1": normalize_team(match.get("team1", "")),
                "team2": normalize_team(match.get("team2", "")),
                "score": f"{goals[0]}-{goals[1]}" if goals else "",
                "winner": match_winner(match) or "draw",
                "ground": clean_text(match.get("ground")),
            }
        )

    country_rows = sorted(
        [normalize_history_row(row) for row in country.values()],
        key=lambda row: (row["titles"], row["wins"], row["goal_difference"], row["matches"]),
        reverse=True,
    )
    country_year_rows = sorted(
        [
            {
                **row,
                "win_rate": round(row["wins"] / row["matches"], 4) if row["matches"] else 0,
            }
            for row in country_year.values()
        ],
        key=lambda row: (row["year"], row["team"]),
    )
    pair_rows = []
    for pair in pair_stats.values():
        pair["meetings"] = sorted(pair["meetings"], key=lambda row: row["year"], reverse=True)[:8]
        pair_rows.append(pair)
    pair_rows.sort(key=lambda row: row["matches"], reverse=True)

    scorers = []
    for row in scorer_stats.values():
        scorers.append(
            {
                "team": row["team"],
                "team_id": row["team_id"],
                "player": row["player"],
                "goals": row["goals"],
                "years": sorted(row["years"]),
                "opponents": sorted(row["opponents"])[:8],
            }
        )
    scorers.sort(key=lambda row: (row["goals"], len(row["years"]), row["player"]), reverse=True)

    return {
        "tournaments": tournaments,
        "countries": country_rows,
        "country_years": country_year_rows,
        "head_to_head": pair_rows,
        "historical_matches": historical_matches_light,
        "scorers": scorers[:250],
        "coverage": {
            "tournaments": len(tournaments),
            "historical_matches": len(historical_matches_light),
            "countries": len(country_rows),
            "scorers": len(scorers),
        },
    }


def build_payload() -> dict[str, Any]:
    worldcup, openfootball_meta = fetch_worldcup_2026()
    players, squads_meta = extract_squads()
    historical, tournaments, historical_metas = fetch_historical_worldcups()
    current_completed = [m | {"year": 2026} for m in worldcup["matches"] if completed_score(m)]
    ratings = build_elo(historical + current_completed)
    groups = build_groups(worldcup["matches"])
    teams = sorted({team for group_teams in groups.values() for team in group_teams})
    squad_stats = build_squad_stats(players)
    posteriors = build_team_posteriors(teams, worldcup["matches"], ratings, squad_stats)
    standings = build_actual_standings(worldcup["matches"], groups)
    advancement = simulate_group_advancement(worldcup["matches"], groups, posteriors)
    history = build_historical_evidence(historical, tournaments, worldcup["matches"])

    team_rows = []
    for team in teams:
        posterior = posteriors[team]
        group = next((g for g, ts in groups.items() if team in ts), "")
        chances = advancement.get(team, {})
        rating_power = max(0.01, (posterior.rating - 1250) / 500)
        team_rows.append(
            {
                "team": team,
                "team_id": team_id(team),
                "group": group,
                "rating": round(posterior.rating, 1),
                "attack_posterior_mean": round(posterior.attack_mean, 3),
                "defense_posterior_mean": round(posterior.defense_mean, 3),
                "matches_observed_2026": posterior.played,
                "goals_for_observed_2026": posterior.goals_for,
                "goals_against_observed_2026": posterior.goals_against,
                "squad": squad_stats.get(team, {"players": 0}),
                "p_top2": chances.get("p_top2", 0),
                "p_advance_group": chances.get("p_advance_group", 0),
                "champion_index": round(rating_power * chances.get("p_advance_group", 0), 4),
            }
        )
    total_champion_index = sum(row["champion_index"] for row in team_rows) or 1
    for row in team_rows:
        row["p_champion_rough"] = round(row["champion_index"] / total_champion_index, 4)
        del row["champion_index"]

    matches = [normalize_match(match, i + 1, posteriors) for i, match in enumerate(worldcup["matches"])]
    completed = sum(1 for match in matches if match["status"] == "final")
    generated_at = now_iso()
    data_version = f"{DATA_VERSION_PREFIX}-{generated_at.replace(':', '').replace('-', '').replace('Z', 'z')}"

    payload = {
        "metadata": {
            "app_version": APP_VERSION,
            "data_version": data_version,
            "generated_at": generated_at,
            "timezone": "UTC",
            "tournament": worldcup.get("name", "World Cup 2026"),
            "coverage": {
                "teams": len(teams),
                "players": len(players),
                "matches": len(matches),
                "completed_matches": completed,
                "groups": len(groups),
                "historical_tournaments": history["coverage"]["tournaments"],
                "historical_matches": history["coverage"]["historical_matches"],
                "historical_countries": history["coverage"]["countries"],
                "historical_scorers": history["coverage"]["scorers"],
            },
            "model": {
                "name": "Gamma-Poisson + Monte Carlo group advancement",
                "language": "Bayesian teaching approximation, not betting advice",
                "prior": "Team attack/defense goal rates use Gamma priors derived from historical World Cup Elo-style ratings and squad caps/goals.",
                "likelihood": "Observed 2026 goals are treated as Poisson counts.",
                "posterior": "Posterior means update as completed match scores appear in the source JSON.",
                "simulation_iterations": 2500,
                "limitations": [
                    "No proprietary live event feed is used.",
                    "Player-level minutes, injuries and tactical lineups are not modeled unless added to the sheet/API.",
                    "Knockout champion probability is a rough educational index, not a full bracket simulation.",
                ],
            },
        },
        "sources": {
            "openfootball_worldcup_json": openfootball_meta,
            "wikipedia_squads": squads_meta,
            "official_reference": {
                "name": "FIFA World Cup 2026 official site",
                "url": "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
                "note": "Used as official reference for tournament context; automated cache uses open reproducible data sources.",
            },
            "fifa_archive": {
                "name": "FIFA World Cup archive",
                "url": "https://www.archives.fifa.com/fifa_world_cup",
                "note": "Official archive reference for past tournaments. Structured app data is regenerated from OpenFootball JSON.",
            },
            "flag_icons": {
                "name": "flag-icons",
                "url": "https://github.com/lipis/flag-icons",
                "version": "7.5.0",
                "license": "MIT",
                "note": "SVG flags used as visual aids for teams/countries. The frontend maps each team to a reviewed flag code.",
            },
            "wikimedia_commons": {
                "name": "Wikimedia Commons",
                "url": "https://commons.wikimedia.org/",
                "note": "Player photos are shown only when a curated frontend manifest records source, author and license.",
            },
            "wikidata_licensing": {
                "name": "Wikidata licensing",
                "url": "https://www.wikidata.org/wiki/Wikidata:Licensing",
                "note": "Reference for reusable structured metadata and rights context.",
            },
            "statsbomb_open_data": {
                "name": "StatsBomb Open Data",
                "url": "https://github.com/statsbomb/open-data",
                "note": "Candidate source for historical event data such as passes, shots and lineups. Terms require attribution and license review before model integration.",
            },
            "wyscout_figshare_events": {
                "name": "Soccer match event dataset",
                "url": "https://figshare.com/collections/Soccer_match_event_dataset/4415000",
                "note": "Open academic event dataset including FIFA World Cup 2018, with passes, shots, fouls, positions and player/action metadata.",
            },
            "api_football_fixture_statistics": {
                "name": "API-Football fixture statistics",
                "url": "https://api-sports.io/documentation/football/v3",
                "note": "Candidate API for 2026 fixture statistics such as shots on goal, shots off goal and related live match metrics. Requires API key and redistribution review.",
            },
            "football_data_org_api": {
                "name": "football-data.org API",
                "url": "https://www.football-data.org/documentation/api",
                "note": "Candidate API for fixtures, teams, standings, scorers and related competition data. Coverage and license must be checked before integration.",
            },
            "openfootball_historical_worldcups": historical_metas,
        },
        "groups": groups,
        "teams": sorted(team_rows, key=lambda r: (r["group"], r["team"])),
        "players": sorted(players, key=lambda r: (r["team"], r.get("number") or 99, r["name"])),
        "matches": matches,
        "standings": standings,
        "history": history,
    }
    return payload


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False)
    path.write_text(text + "\n", encoding="utf-8")


def write_csv(path: Path, headers: list[str], rows: list[list[Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(headers)
        writer.writerows(rows)


def write_sheet_exports(payload: dict[str, Any]) -> list[dict[str, Any]]:
    version = payload["metadata"]["data_version"]
    history = payload.get("history", {})
    exports: list[tuple[str, list[str], list[list[Any]]]] = []

    exports.append(
        (
            "equipos.csv",
            [
                "team_id",
                "team",
                "group",
                "rating",
                "attack_posterior_mean",
                "defense_posterior_mean",
                "matches_observed_2026",
                "goals_for_observed_2026",
                "goals_against_observed_2026",
                "players",
                "avg_age",
                "total_caps",
                "total_international_goals",
                "p_top2",
                "p_advance_group",
                "p_champion_rough",
                "data_version",
            ],
            [
                [
                    team["team_id"],
                    team["team"],
                    team["group"],
                    team["rating"],
                    team["attack_posterior_mean"],
                    team["defense_posterior_mean"],
                    team["matches_observed_2026"],
                    team["goals_for_observed_2026"],
                    team["goals_against_observed_2026"],
                    (team.get("squad") or {}).get("players", 0),
                    (team.get("squad") or {}).get("avg_age", ""),
                    (team.get("squad") or {}).get("total_caps", 0),
                    (team.get("squad") or {}).get("total_international_goals", 0),
                    team["p_top2"],
                    team["p_advance_group"],
                    team["p_champion_rough"],
                    version,
                ]
                for team in payload["teams"]
            ],
        )
    )

    exports.append(
        (
            "jugadores.csv",
            ["team_id", "team", "number", "position", "name", "birth_date", "age", "caps", "goals", "club", "source", "data_version"],
            [
                [
                    player["team_id"],
                    player["team"],
                    player.get("number", ""),
                    player.get("position", ""),
                    player["name"],
                    player.get("birth_date", ""),
                    player.get("age", ""),
                    player.get("caps", 0),
                    player.get("goals", 0),
                    player.get("club", ""),
                    player.get("source", ""),
                    version,
                ]
                for player in payload["players"]
            ],
        )
    )

    exports.append(
        (
            "partidos.csv",
            ["match_id", "round", "date", "time", "team1", "team2", "group", "ground", "status", "score_team1", "score_team2", "data_version"],
            [
                [
                    match["match_id"],
                    match["round"],
                    match["date"],
                    match["time"],
                    match["team1"],
                    match["team2"],
                    match.get("group", ""),
                    match.get("ground", ""),
                    match["status"],
                    (match.get("score") or {}).get("team1", ""),
                    (match.get("score") or {}).get("team2", ""),
                    version,
                ]
                for match in payload["matches"]
            ],
        )
    )

    exports.append(
        (
            "pronosticos.csv",
            [
                "match_id",
                "team1",
                "team2",
                "home_win",
                "draw",
                "away_win",
                "expected_goals_home",
                "expected_goals_away",
                "data_version",
            ],
            [
                [
                    match["match_id"],
                    match["team1"],
                    match["team2"],
                    match["prediction"]["home_win"],
                    match["prediction"]["draw"],
                    match["prediction"]["away_win"],
                    match["prediction"]["expected_goals_home"],
                    match["prediction"]["expected_goals_away"],
                    version,
                ]
                for match in payload["matches"]
                if match.get("prediction")
            ],
        )
    )

    exports.append(
        (
            "historico_copas.csv",
            ["year", "name", "matches", "teams", "goals", "avg_goals", "champion", "source", "data_version"],
            [
                [
                    cup["year"],
                    cup["name"],
                    cup["matches"],
                    cup["teams"],
                    cup["goals"],
                    cup["avg_goals"],
                    cup.get("champion", ""),
                    cup.get("source", ""),
                    version,
                ]
                for cup in history.get("tournaments", [])
            ],
        )
    )

    exports.append(
        (
            "historico_paises.csv",
            [
                "team_id",
                "team",
                "appearances",
                "matches",
                "wins",
                "draws",
                "losses",
                "goals_for",
                "goals_against",
                "goal_difference",
                "titles",
                "finals",
                "win_rate",
                "data_version",
            ],
            [
                [
                    row["team_id"],
                    row["team"],
                    row["appearances"],
                    row["matches"],
                    row["wins"],
                    row["draws"],
                    row["losses"],
                    row["goals_for"],
                    row["goals_against"],
                    row["goal_difference"],
                    row["titles"],
                    row["finals"],
                    row["win_rate"],
                    version,
                ]
                for row in history.get("countries", [])
            ],
        )
    )

    exports.append(
        (
            "historico_partidos.csv",
            ["historical_match_id", "year", "round", "date", "team1", "team2", "score", "winner", "ground", "data_version"],
            [
                [
                    row["historical_match_id"],
                    row["year"],
                    row["round"],
                    row["date"],
                    row["team1"],
                    row["team2"],
                    row["score"],
                    row["winner"],
                    row["ground"],
                    version,
                ]
                for row in history.get("historical_matches", [])
            ],
        )
    )

    exports.append(
        (
            "historico_goleadores.csv",
            ["team_id", "team", "player", "goals", "years", "opponents", "data_version"],
            [
                [
                    row["team_id"],
                    row["team"],
                    row["player"],
                    row["goals"],
                    ", ".join(str(item) for item in row.get("years", [])),
                    ", ".join(str(item) for item in row.get("opponents", [])),
                    version,
                ]
                for row in history.get("scorers", [])
            ],
        )
    )

    written: list[dict[str, Any]] = []
    for filename, headers, rows in exports:
        path = SHEETS_DIR / filename
        write_csv(path, headers, rows)
        written.append(
            {
                "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                "rows": len(rows),
                "columns": len(headers),
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "bytes": path.stat().st_size,
            }
        )
    return written


def main() -> None:
    payload = build_payload()
    write_json(DATA_DIR / "worldcup2026_latest.json", payload)
    csv_exports = write_sheet_exports(payload)
    manifest = {
        "generated_at": payload["metadata"]["generated_at"],
        "app_version": APP_VERSION,
        "data_version": payload["metadata"]["data_version"],
        "files": [
            {
                "path": "data/worldcup2026_latest.json",
                "sha256": hashlib.sha256(
                    (DATA_DIR / "worldcup2026_latest.json").read_bytes()
                ).hexdigest(),
                "bytes": (DATA_DIR / "worldcup2026_latest.json").stat().st_size,
            }
        ]
        + csv_exports,
        "sources": payload["sources"],
    }
    write_json(DATA_DIR / "sources_manifest.json", manifest)
    print(json.dumps(payload["metadata"]["coverage"], ensure_ascii=False))


if __name__ == "__main__":
    main()
