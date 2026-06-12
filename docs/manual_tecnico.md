# Manual tecnico

## Objetivo

Construir una app web publica, reproducible y auditable para visualizar datos y
pronosticos bayesianos de la Copa Mundial 2026.

## Componentes

| Componente | Archivo o servicio | Funcion |
| --- | --- | --- |
| Frontend | `index.html`, `assets/` | Interfaz publica GitHub Pages |
| Cache publico | `data/worldcup2026_latest.json` | Datos normalizados y pronosticos |
| Generador | `scripts/update_data.py` | Descarga, normaliza y recalcula |
| Backend | `gas/*.gs` | Sincroniza JSON con Google Sheets y sirve JSONP |
| Planilla | Google Sheets | Auditoria, respaldo y consulta operativa |
| Automatizacion | `.github/workflows/update-data.yml` | Regeneracion cada 6 horas |

## Capa visual

La version `0.2.4` usa un canvas para el balon del hero: posicion, velocidad,
rebote contra limites, rotacion, sombra y estela con `requestAnimationFrame`.
Se mantienen trazos de pase, simbolos estadisticos en movimiento, transiciones
de vistas, barras animadas y ruta visual del modelo. Las animaciones respetan
`prefers-reduced-motion` para usuarios que soliciten reducir movimiento.

## Pronosticos de usuarios

La vista `Acertá` guarda pronosticos por usuario en `localStorage` bajo
`mundialProbabilidades.predictions.v1.<user_id>`. Cada registro conserva
`match_id`, equipos, marcador previsto, confianza, version de datos y fecha de
actualizacion. La evaluacion se calcula en cliente cuando el partido queda
`final`: 3 puntos por marcador exacto, 1 por signo correcto y 0 por falla.

El backend GAS queda preparado para recibir `action=prediction` y escribir en
`PREDICCIONES_USUARIO` cuando el Web App responda anonimamente.

## Flujo de datos

1. `scripts/update_data.py` descarga calendario/resultados desde OpenFootball.
2. El script descarga planteles desde la pagina estructurada de squads.
3. El script descarga Copas historicas 1930-2022 desde OpenFootball.
4. Se generan evidencias historicas por pais, Copa, mano a mano y goleadores.
5. Se calculan parametros posteriores Gamma-Poisson por equipo.
6. Se simula el avance de grupos y se genera `worldcup2026_latest.json`.
7. GitHub Pages consume el JSON.
8. GAS puede ejecutar `syncFromGithub()` para copiar el mismo estado a Sheets.

## Registro y visitas

El frontend usa `localStorage` para guardar un perfil local sin password bajo
`mundialProbabilidades.user.v1`. El objetivo es personalizacion, conteo de
visitas y trazabilidad educativa, no autenticacion fuerte.

Las estadisticas locales se guardan en `mundialProbabilidades.visits.v1`:
visitas totales, primer ingreso, ultimo ingreso y conteo por vista. Si
`APP_CONFIG.gasExecUrl` se configura con un Web App anonimo realmente operativo,
el frontend puede enviar eventos JSONP con `action=visit`.

## Pestañas historicas en Sheets

`syncFromGithub()` crea y actualiza:

- `HISTORICO_COPAS`
- `HISTORICO_PAISES`
- `HISTORICO_PARTIDOS`
- `HISTORICO_GOLEADORES`
- `VISITAS`

## Validaciones minimas

```powershell
python scripts\update_data.py
python -m py_compile scripts\update_data.py scripts\make_assets.py
python -m http.server 8080
```

Luego verificar en navegador:

- carga de `index.html`;
- conteos de 48 equipos, 1.248 jugadores y 104 partidos;
- filtros de grupo/equipo;
- vista offline despues de primera carga;
- estado del backend GAS si se configura endpoint.

## Seguridad

No se publican tokens ni credenciales en el frontend. La vista publica solo lee
JSON abierto. Las acciones de sincronizacion sobre Sheets deben ejecutarse desde
Apps Script autorizado o con token administrativo guardado en Script Properties.
El registro sin password no debe usarse para proteger datos sensibles; solo
habilita una experiencia publica personalizada.
