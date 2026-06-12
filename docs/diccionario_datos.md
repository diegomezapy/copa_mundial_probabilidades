# Diccionario de datos

## `metadata`

| Campo | Descripcion |
| --- | --- |
| `app_version` | Version operativa de la app |
| `data_version` | Identificador unico del cache generado |
| `generated_at` | Fecha UTC de generacion |
| `coverage` | Conteos de equipos, jugadores, partidos y grupos |
| `model` | Supuestos, prior, likelihood, posterior y limitaciones |

## `teams`

| Campo | Descripcion |
| --- | --- |
| `team_id` | Identificador normalizado |
| `team` | Nombre del equipo |
| `group` | Grupo del torneo |
| `rating` | Rating historico ajustado con covariables agregadas de plantel |
| `attack_posterior_mean` | Media posterior de goles a favor esperados |
| `defense_posterior_mean` | Media posterior de goles concedidos esperados |
| `p_top2` | Probabilidad simulada de terminar top 2 del grupo |
| `p_advance_group` | Probabilidad simulada de avanzar desde fase de grupos |
| `p_champion_rough` | Indice academico aproximado de campeon |

## `players`

| Campo | Descripcion |
| --- | --- |
| `team` | Equipo |
| `number` | Numero de camiseta |
| `position` | Posicion GK, DF, MF o FW |
| `name` | Nombre del jugador |
| `birth_date` | Fecha de nacimiento cuando esta disponible |
| `age` | Edad informada al inicio del torneo |
| `caps` | Partidos internacionales antes del torneo |
| `goals` | Goles internacionales antes del torneo |
| `club` | Club previo al torneo |

## `matches`

| Campo | Descripcion |
| --- | --- |
| `match_id` | Identificador del partido |
| `round` | Jornada o fase |
| `date` | Fecha |
| `time` | Hora informada por la fuente |
| `team1`, `team2` | Equipos |
| `group` | Grupo, si aplica |
| `ground` | Sede |
| `status` | `scheduled` o `final` |
| `score` | Marcador final cuando existe |
| `prediction` | Probabilidades y goles esperados |

