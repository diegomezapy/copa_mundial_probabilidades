# Bitacora Mundial Probabilidades Copa 2026 Appweb

## 2026-06-12 07:20

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/` pendiente de verificar tras push/pages
* Responsable: Codex
* Version: `0.1.0`

### Objetivo de la intervencion

Crear una app web publica para reunir datos disponibles de equipos, jugadores y
partidos de la Copa Mundial 2026, actualizar resultados desde fuentes abiertas y
generar estimaciones bayesianas para uso academico.

### Diagnostico inicial

* La carpeta local no era repositorio Git.
* El remoto GitHub existe, pero no tenia refs publicadas al consultar `git ls-remote`.
* La hoja `FUTBOL_PROBABILIDADES` existia con una sola pestaña vacia `Hoja 1`.
* La cuenta `clasp` activa es `apoyomedicoips@gmail.com`.
* Se reviso el manual maestro institucional en
  `G:\Mi unidad\MANUAL_MAESTRO_FORMATOS_FUNCIONES_APPWEB`.

### Acciones realizadas

* Se inicializo repo local `main` y se conecto `origin`.
* Se creo frontend estatico GitHub Pages con PWA, filtros, tablas, laboratorio
  bayesiano y vista de auditoria.
* Se genero cache `data/worldcup2026_latest.json`.
* Se creo generador reproducible `scripts/update_data.py`.
* Se preparo plantilla de workflow `docs/github-actions-update-data.yml` cada 6
  horas.
* Se creo backend GAS con `setupWorkbook()`, `syncFromGithub()` y JSONP publico.
* Se agregaron manual tecnico, manual de usuario, diccionario y metodologia.
* Se guardo la secuencia de prompts del proyecto.

### Archivos modificados

* `index.html`
* `assets/css/styles.css`
* `assets/js/config.js`
* `assets/js/model.js`
* `assets/js/data.js`
* `assets/js/app.js`
* `service-worker.js`
* `manifest.webmanifest`
* `scripts/update_data.py`
* `scripts/make_assets.py`
* `gas/*.gs`
* `.github/workflows/update-data.yml`
* `README.md`
* `docs/*.md`

### Comandos o scripts ejecutados

```powershell
git init -b main
git remote add origin https://github.com/diegomezapy/copa_mundial_probabilidades.git
clasp show-authorized-user
python scripts\update_data.py
python scripts\make_assets.py
python -m py_compile scripts\update_data.py scripts\make_assets.py
node --check assets\js\config.js
node --check assets\js\model.js
node --check assets\js\data.js
node --check assets\js\app.js
node --check service-worker.js
python -m http.server 8080
clasp status
clasp push -f
clasp version "v0.1.0 app publica mundial probabilidades"
clasp deploy --versionNumber 1 --description "v0.1.0 app publica mundial probabilidades"
```

### Resultados verificados

* Cache generado con 48 equipos, 1.248 jugadores, 104 partidos y 2 partidos
  finalizados al momento de la generacion.
* Asset visual PNG generado localmente.
* Metadata de Google Sheet leida por conector: una pestaña `Hoja 1` vacia.
* App servida localmente por HTTP en `http://localhost:8080`.
* Capturas Playwright generadas para desktop y movil: `tmp/app-desktop-v2.png`
  y `tmp/app-mobile-v2.png`.
* Google Sheet inicializada con pestañas `CONFIG`, `EQUIPOS`, `JUGADORES`,
  `PARTIDOS`, `PRONOSTICOS`, `RUNS_MODELO`, `LOG`, `ERRORES`, `VERSIONES` y
  `USUARIOS`.
* GAS recibio `clasp push -f` con 7 archivos y creo version `1`.
* Deployment GAS candidato:
  `AKfycbzk3i63t8l7aYjBTnoIXHDAnaa91_1TmjLaxaVaVkN-0mWrGriML54Spssg7gEDZXy0QA`.

### Pruebas realizadas

* `py_compile` de scripts Python: correcto.
* `node --check` de JS y service worker: correcto.
* `Invoke-WebRequest http://localhost:8080/index.html`: HTTP 200.
* `Invoke-RestMethod http://localhost:8080/data/worldcup2026_latest.json`:
  metadata y conteos correctos.
* Playwright CLI genero capturas desktop y movil sin pantalla en blanco.
* `clasp status`: solo archivos GAS esperados luego de limpiar `desktop.ini`.
* `clasp push`, `clasp version` y `clasp deploy`: correctos.
* Prueba anonima `/exec?action=health`: `403 Prohibido`.
* Prueba anonima `/exec?action=bootstrap&callback=cb`: `403 Prohibido`.
* Primer `git push` rechazado por GitHub porque el token no tiene scope
  `workflow` para crear `.github/workflows/update-data.yml`.

### Errores o incidentes

* `git status` inicial fallo porque la carpeta aun no era repo.
* Un intento de script Python con heredoc Bash fallo por ejecutarse en
  PowerShell; se corrigio con here-string de PowerShell.
* `pandas.read_html()` directo contra Wikipedia devolvio 403 sin User-Agent; el
  script final usa `requests` con User-Agent explicito.
* El endpoint GAS versionado quedo desplegado, pero no responde anonimamente.
  Requiere autorizacion/publicacion manual del propietario o ajuste de permisos
  desde consola Apps Script.
* `clasp run setupWorkbook` y `clasp run syncFromGithub` no pudieron ejecutarse
  porque el script no esta desplegado como API executable.
* GitHub CLI esta autenticado como `diegomezapy` con scopes `repo`, `gist` y
  `read:org`, sin `workflow`.

### Soluciones aplicadas

* Inicializacion controlada del repo local.
* Generador con fuentes trazables, hashes y User-Agent.
* Fallback local JSON para que GitHub Pages funcione aunque GAS aun no este
  autorizado publicamente.
* Inicializacion estructural de la Google Sheet mediante conector, sin depender
  de `clasp run`.
* No se configuro `assets/js/config.js` con URL GAS porque el endpoint candidato
  no paso prueba anonima.
* El workflow automatico se movio a `docs/github-actions-update-data.yml` para
  permitir publicar el sitio con el token actual; debe copiarse a
  `.github/workflows/update-data.yml` cuando exista scope `workflow`.

### Pendientes

* Publicar commit en GitHub.
* Activar GitHub Pages en rama `main` raiz.
* Activar workflow de actualizacion con credenciales GitHub que incluyan scope
  `workflow`.
* Autorizar/publicar manualmente el Web App GAS para acceso anonimo real.
* Ejecutar `syncFromGithub()` desde Apps Script una vez autorizado.
* Pegar URL `/exec` validada en `assets/js/config.js` solo despues de recibir
  JSON/JSONP anonimo correcto.

### Riesgos

* Las fuentes abiertas pueden actualizarse con retraso respecto a FIFA.
* Los planteles dependen de pagina estructurada externa y pueden cambiar de
  formato.
* Apps Script puede requerir autorizacion manual del propietario antes de
  responder anonimamente.
* La probabilidad de campeon actual es un indice aproximado, no bracket completo.

### Recomendaciones

* Agregar una fuente deportiva con licencia/API si se requiere live feed de
  eventos, alineaciones o estadisticas jugador-partido.
* Evolucionar el modelo a simulacion completa de llave eliminatoria.
* Registrar cada cambio de fuente o modelo en `RUNS_MODELO` y `VERSIONES`.
