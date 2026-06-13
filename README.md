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

`0.2.8` agrega banderas SVG reales para los 48 equipos, fotos curadas de
jugadores desde Wikimedia Commons cuando existe fuente/licencia verificable y
tarjetas emergentes al posar el cursor sobre equipos o jugadores. Mantiene la
legibilidad movil de `0.2.7`, la correccion de `Senal` filtrable, colores por
grupo, microanimaciones, `Autores` en pestana propia, `Acerta` reorganizada,
balon canvas con rebote, pronosticos propios, registro inicial sin password,
estadisticas de visitas, referencias, derechos de uso, evidencia historica
1930-2022 y filtros por Copa, pais, jugador y posicion.

## Fuentes

- OpenFootball `worldcup.json` para calendario y resultados 2026.
- OpenFootball `worldcup.json` historico 1930-2022 para Copas pasadas.
- Pagina estructurada de squads de Wikipedia para planteles.
- Sitio oficial FIFA como referencia institucional del torneo.

Cada generacion guarda URL, fecha de descarga, bytes y hash SHA256 en
`data/sources_manifest.json`.

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
clasp version "v0.1.0 app publica mundial probabilidades"
clasp deploy --description "v0.1.0 app publica mundial probabilidades"
```

Funciones manuales relevantes desde el editor de Apps Script:

- `setupWorkbook()`: crea las pestañas y cabeceras.
- `syncFromGithub()`: copia el JSON publicado a Sheets.
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

Estado de la primera intervencion:

- `clasp push`, `clasp version` y `clasp deploy` fueron ejecutados correctamente.
- Deployment candidato:
  `AKfycbzk3i63t8l7aYjBTnoIXHDAnaa91_1TmjLaxaVaVkN-0mWrGriML54Spssg7gEDZXy0QA`.
- La prueba anonima de `/exec?action=health` devolvio `403 Prohibido`; por eso
  el frontend conserva fallback JSON local hasta que el propietario autorice la
  publicacion real del Web App.

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
