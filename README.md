# Copa Mundial 2026 - Probabilidades Bayesianas

App web publica y academica para explorar datos de equipos, jugadores, partidos,
resultados y pronosticos bayesianos de la Copa Mundial 2026.

La app esta pensada para estudiantes de estadistica y cursos de modelos
multivariados. No produce recomendaciones de apuestas ni predicciones como
certeza; muestra probabilidades, supuestos, limitaciones y trazabilidad de datos.

## Arquitectura

- Frontend publico: HTML, CSS y JavaScript en GitHub Pages.
- Datos publicos: `data/worldcup2026_latest.json`.
- Generador reproducible: `scripts/update_data.py`.
- Backend operativo: Google Apps Script en `gas/`.
- Base auditable: Google Sheets `1k_zmucPFA9A7pyE7Y6ZZgb-c4K3UTlp6YknpovCv5pQ`.
- Automatizacion: GitHub Actions cada 6 horas y funcion GAS `syncFromGithub()`.

## Version actual

`0.2.19` refuerza la experiencia publica para telefonos y usuarios no tecnicos:
mantiene `Version` y `Actualizar app`, agrega `Activar avisos`, hace la
navegacion por vistas mucho mas visible al inicio, renombra `Acerta` como
`Mis pronosticos`, agrega respaldo por cookie para recordar el usuario local,
expone un panel didactico de estadisticas en la portada, mejora la red de etapas
eliminatorias y amplia la vista `Metodologia` con una explicacion paso a paso.
Mantiene el frontend conectado con el Web App GAS validado para registrar
visitas en `VISITAS`, la restriccion de `Visitas` y `Auditoria` a cuentas
administrativas, el boton `Vista`, el boton para limpiar filtros, multifiltros
globales, controles de zoom/foco, imagenes generadas, definiciones `(i)`, CSV
publicos, banderas SVG, fotos curadas con fuente/licencia, registro inicial,
referencias, evidencia historica 1930-2022 y filtros por Copa, pais, jugador y
posicion.

## Fuentes

- OpenFootball `worldcup.json` para calendario y resultados 2026.
- OpenFootball `worldcup.json` historico 1930-2022 para Copas pasadas.
- Pagina estructurada de squads de Wikipedia para planteles.
- Sitio oficial FIFA como referencia institucional del torneo.

Cada generacion guarda URL, fecha de descarga, bytes y hash SHA256 en
`data/sources_manifest.json`.

El generador tambien publica CSV normalizados para la hoja operativa:
`equipos.csv`, `jugadores.csv`, `partidos.csv`, `pronosticos.csv` y tablas
historicas bajo `data/sheets/`.

La hoja operativa `FUTBOL_PROBABILIDADES` puede leer esos CSV desde GitHub Pages
con `IMPORTDATA`. Para evitar el bloqueo `#REF!` de importaciones externas, el
libro debe tener habilitada la propiedad
`importFunctionsExternalUrlAccessAllowed=true`. Las columnas de fecha y marcador
historico se formatean explicitamente para que no se vean como numeros seriales.

## Ejecucion local

```powershell
pip install -r requirements.txt
python scripts\update_data.py
python scripts\make_assets.py
python -m http.server 8080
```

Abrir `http://localhost:8080`.

## Apps Script

El proyecto GAS configurado es:

`1semVUDI4jp8NNzACeFPBoDOSZ0KuHM-MJlLFBrFtWaaDpfL1ByUN9iq9`

Comandos operativos:

```powershell
clasp push -f
```

El frontend publico usa el Web App validado:

`https://script.google.com/macros/s/AKfycbxtuAbgT4K1ORsfs5WkPmKf2wnN4ygf0MX65xjZ_VCjGujtH-qwV6rzwDSqS4Cc9kfC7Q/exec`

Para mantener produccion, no cambiar `gasExecUrl` hasta que
`/exec?action=health&callback=cb` responda JSONP real y `action=visit` escriba
una fila comprobada en `VISITAS`.

Funciones manuales relevantes desde el editor de Apps Script:

- `setupWorkbook()`: crea las pestanas y cabeceras.
- `syncFromGithub()`: copia el JSON publicado a Sheets.
- `/exec?action=sync_public`: refresca datos publicos desde GitHub con bloqueo y
  ventana minima entre ejecuciones. No acepta carga de datos del usuario.
- `installDailySyncTrigger()`: instala sincronizacion diaria a las 06:00.
- `setAdminToken(token)`: guarda un token administrativo en Script Properties.

La sincronizacion `syncFromGithub()` tambien crea pestanas historicas:
`HISTORICO_COPAS`, `HISTORICO_PAISES`, `HISTORICO_PARTIDOS` y
`HISTORICO_GOLEADORES`.

El backend queda preparado para registrar visitas en la pestana `VISITAS`
mediante `/exec?action=visit`, pero el frontend no depende de GAS mientras la
prueba anonima del Web App siga devolviendo `403 Prohibido`.

El endpoint `/exec?action=bootstrap&callback=...` debe verificarse anonimamente
antes de escribir su URL en `assets/js/config.js`.

Estado operativo reciente:

- El deployment
  (`AKfycbxtuAbgT4K1ORsfs5WkPmKf2wnN4ygf0MX65xjZ_VCjGujtH-qwV6rzwDSqS4Cc9kfC7Q`)
  responde `health` como JSON y JSONP.
- La prueba manual `action=visit` devolvio `ok:true`.
- La hoja `VISITAS` recibio la fila de prueba `codex_manual_test` en
  `VISITAS!A2:K2`.
- `assets/js/config.js` ya apunta a ese Web App desde `0.2.17` y mantiene el
  registro remoto en `0.2.19`.

## Automatizacion de datos

El workflow activo esta en `.github/workflows/update-data.yml` y se ejecuta cada
6 horas o manualmente desde GitHub Actions. La copia
`docs/github-actions-update-data.yml` queda como respaldo documental.

La actualizacion reproducible tambien puede ejecutarse manualmente con:

```powershell
python scripts\update_data.py
git add data
git commit -m "data: actualizar cache mundial 2026"
git push
```

## Publicacion GitHub Pages

La app abre directamente en `index.html`. La fuente esperada de GitHub Pages es
la rama `main` en la raiz del repositorio.

URL esperada:

`https://diegomezapy.github.io/copa_mundial_probabilidades/`

## Modelo

El MVP usa una aproximacion bayesiana Gamma-Poisson:

- prior de ataque/defensa por equipo derivado de rating historico tipo Elo y
  covariables agregadas del plantel;
- likelihood Poisson para goles observados;
- posterior actualizado con resultados disponibles;
- simulacion Monte Carlo de avance de fase de grupos.

La probabilidad de campeon es un indice academico aproximado. La version actual
no ejecuta todavia una simulacion completa de llave eliminatoria.

## Documentacion

- [Manual tecnico](docs/manual_tecnico.md)
- [Manual de usuario](docs/manual_usuario.md)
- [Diccionario de datos](docs/diccionario_datos.md)
- [Metodologia bayesiana](docs/metodologia_bayesiana.md)
- [Bitacora](BITACORA_MUNDIAL_PROBABILIDADES_COPA2026_APPWEB.md)
