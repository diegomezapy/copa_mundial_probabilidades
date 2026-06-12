# Diccionario de datos

## `metadata`

| Campo | Descripcion |
| --- | --- |
| `app_version` | Version operativa de la app |
| `data_version` | Identificador unico del cache generado |
| `generated_at` | Fecha UTC de generacion |
| `coverage` | Conteos de equipos, jugadores, partidos y grupos |
| `model` | Supuestos, prior, likelihood, posterior y limitaciones |

## `history`

| Campo | Descripcion |
| --- | --- |
| `tournaments` | Copas historicas 1930-2022 con partidos, equipos, goles y campeon |
| `countries` | Estadisticas agregadas por pais en todas las Copas |
| `country_years` | Rendimiento pais-Copa |
| `head_to_head` | Mano a mano historico entre paises |
| `historical_matches` | Partidos historicos normalizados |
| `scorers` | Goleadores historicos extraidos de eventos de gol disponibles |
| `coverage` | Conteos de cobertura historica |

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

## `history.countries`

| Campo | Descripcion |
| --- | --- |
| `appearances` | Cantidad de Copas con participacion |
| `matches` | Partidos historicos jugados |
| `wins`, `draws`, `losses` | Balance historico |
| `goals_for`, `goals_against` | Goles a favor y en contra |
| `titles`, `finals` | Titulos y finales detectadas |
| `win_rate` | Proporcion de victorias historicas |

## `history.scorers`

| Campo | Descripcion |
| --- | --- |
| `player` | Nombre del goleador segun la fuente |
| `team` | Pais |
| `goals` | Goles detectados en eventos de gol historicos |
| `years` | Copas donde aparece el jugador |
| `opponents` | Rivales a los que marco, limitado para interfaz |

## Perfil local y visitas

Estos campos no forman parte del JSON estadistico; se guardan en el navegador
del usuario.

| Campo | Descripcion |
| --- | --- |
| `mundialProbabilidades.user.v1` | Perfil local sin password: id, usuario, nombre, pais, perfil, institucion y fechas de registro/ultimo acceso |
| `mundialProbabilidades.visits.v1` | Conteos locales: visitas totales, primer ingreso, ultimo ingreso, ultima vista y conteo por seccion |
| `mundialProbabilidades.predictions.v1.<user_id>` | Pronosticos locales por partido: marcador previsto, confianza, version de datos y fecha de actualizacion |
| `VISITAS` | Pestana GAS preparada para eventos anonimos si el Web App queda publicamente disponible |
| `PREDICCIONES_USUARIO` | Pestana GAS preparada para pronosticos de usuarios cuando `action=prediction` quede disponible publicamente |
