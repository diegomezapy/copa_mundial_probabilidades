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

La version `0.2.12` agrega una estimacion 1-X-2 permanente bajo `Ruta del
modelo`, una figura didactica del flujo bayesiano, una vista `Metodologia`
completa, multifiltros globales desde tablas/figuras/nodos y controles de
zoom/foco para el mural del torneo en escritorio. Mantiene el set de imagenes
generadas en `assets/img/generated/`, hero, iconos PWA, pelota animada,
definiciones emergentes `(i)`, nodos rectangulares de grupos/partidos/etapas y
exportaciones CSV publicas bajo `data/sheets/` para alimentar Google Sheets
mediante `IMPORTDATA`. Cada CSV queda registrado en `data/sources_manifest.json`
con filas, columnas, bytes y hash SHA-256.

El origen local `imagenes/` se mantiene fuera de Git; la app solo publica la
copia normalizada en `assets/img/generated/`. Los metadatos de integracion se
documentan en `assets/img/generated/GENERATED_IMAGES_MANIFEST.md`.

La version conserva las banderas SVG reales mediante `flag-icons@7.5.0`
con licencia MIT y un manifest curado `PLAYER_MEDIA` para fotos de jugadores
desde Wikimedia Commons, siempre con autor, licencia y enlace de fuente. Si no
hay foto libre verificada, la interfaz muestra un avatar. La funcion
`flagMarkup()` evita depender de emoji flags, que en Windows pueden aparecer
como letras regionales. Los elementos con `.has-rich-popover` muestran tarjetas
emergentes de equipo o jugador con estadisticas y atribucion de imagen.

La version conserva la legibilidad movil de `0.2.7`, el canvas del balon del
hero con posicion, velocidad, rebote contra limites, rotacion, sombra y estela
con `requestAnimationFrame`. Tambien conserva `renderClassroomCards()` con
`filteredTeams()`, colores por grupo mediante `--group-color`, scroll interno
del panel lateral en escritorio, microanimaciones en tablas, heatmaps y
graficos, y perfiles academicos estructurados en `Autores`. Las animaciones
respetan `prefers-reduced-motion` para usuarios que soliciten reducir
movimiento.

## Pronosticos de usuarios

La vista `Acertá` guarda pronosticos por usuario en `localStorage` bajo
`mundialProbabilidades.predictions.v1.<user_id>`. Cada registro conserva
`match_id`, equipos, marcador previsto, confianza, version de datos y fecha de
actualizacion. La evaluacion se calcula en cliente cuando el partido queda
`final`: 3 puntos por marcador exacto, 1 por signo correcto y 0 por falla.

El backend GAS queda preparado para recibir `action=prediction` y escribir en
`PREDICCIONES_USUARIO` cuando el Web App responda anonimamente.

La vista `Autores` renderiza `authorCards` de forma separada para no mezclar
perfiles academicos con el flujo de pronosticos de usuarios. Cada autor puede
incluir `details` y `links` para afiliacion, ORCID, correo u otros datos
academicos verificables.

## Flujo de datos

1. `scripts/update_data.py` descarga calendario/resultados desde OpenFootball.
2. El script descarga planteles desde la pagina estructurada de squads.
3. El script descarga Copas historicas 1930-2022 desde OpenFootball.
4. Se generan evidencias historicas por pais, Copa, mano a mano y goleadores.
5. Se calculan parametros posteriores Gamma-Poisson por equipo.
6. Se simula el avance de grupos y se genera `worldcup2026_latest.json`.
7. GitHub Pages consume el JSON.
8. Se publican CSV en `data/sheets/` para lectura desde Google Sheets.
9. GAS puede ejecutar `syncFromGithub()` para copiar el mismo estado a Sheets
   cuando el token administrativo y permisos del Web App esten configurados.
10. Como respaldo operativo, la hoja puede leer los CSV por `IMPORTDATA` desde
    GitHub Pages. Para que funcione sin `#REF!`, el libro debe tener
    `importFunctionsExternalUrlAccessAllowed=true`.

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

Mientras el token administrativo GAS no este configurado, la hoja puede leer
los CSV publicos con formulas `IMPORTDATA` apuntando a GitHub Pages. En la hoja
`FUTBOL_PROBABILIDADES`, se debe habilitar el acceso externo para funciones de
importacion y formatear explicitamente fechas/marcadores historicos para evitar
que Google Sheets muestre numeros seriales en columnas como `date` o `score`.

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
La accion `sync_public` de GAS solo vuelve a copiar el JSON publico fijo del
repositorio, usa bloqueo de script y aplica una ventana minima entre ejecuciones;
no debe usarse para recibir cargas arbitrarias de usuarios.
El registro sin password no debe usarse para proteger datos sensibles; solo
habilita una experiencia publica personalizada.
