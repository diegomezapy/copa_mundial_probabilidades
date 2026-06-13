# Bitacora Mundial Probabilidades Copa 2026 Appweb

## 2026-06-12 20:38

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.8`

### Objetivo de la intervencion

Corregir la ausencia visible de banderas y fotos en la app publica, manteniendo
derechos de uso, atribucion de fuentes y compatibilidad movil.

### Diagnostico inicial

* La app ya tenia referencias de investigacion sobre banderas/fotos, pero la
  interfaz todavia no mostraba banderas reales ni fotos en forma suficientemente
  visible para el usuario.
* La primera implementacion con emoji flags no era robusta: en Windows los
  emoji de banderas pueden verse como codigos regionales, por ejemplo `MX`, y
  no como banderas.
* Para jugadores, no era aceptable usar fotos sin fuente/licencia clara. Se
  requeria un manifest curado y fallback visual.

### Acciones realizadas

* Se reemplazo el uso de emoji flags por banderas SVG de `flag-icons@7.5.0`
  bajo licencia MIT.
* Se agrego `TEAM_FLAG_CODES` para los 48 equipos del torneo y `flagMarkup()`
  para renderizar imagenes SVG con fallback textual.
* Se agrego `PLAYER_MEDIA` como primer manifest curado de fotos desde
  Wikimedia Commons, con enlace de fuente, autor y licencia por jugador.
* Se agregaron fotos/avatares en la tabla de jugadores y tarjetas emergentes
  ricas al posar el cursor o enfocar equipos y jugadores.
* Se agregaron banderas en rankings, botones rapidos, heatmaps, partidos,
  posiciones por grupo, tarjetas de equipos, selector de equipo y tabla de
  jugadores.
* Se actualizo la vista `Referencias` para enlazar flag-icons, Wikimedia
  Commons y Wikidata, y explicar el criterio de derechos de uso.
* Se agregaron `flag_icons`, `wikimedia_commons` y `wikidata_licensing` al
  bloque `sources` del JSON y del manifest publico.
* Se actualizo version/cache/frontend/GAS/JSON a `0.2.8`.
* Se actualizaron README, manual tecnico, manual de usuario y secuencia de
  prompts.

### Archivos modificados

* `assets/js/app.js`
* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `gas/Config.gs`
* `index.html`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
npm view flag-icons version license repository.url homepage --json
python scripts\update_data.py
node --check assets\js\config.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
npm install --prefix $env:TEMP\mundial-pw-playwright --no-save playwright@1.60.0
```

### Resultados verificados

* JSON local `0.2.8` generado con `data_version=wc26-20260613T004224z`.
* Cobertura conservada: 48 equipos, 1248 jugadores, 104 partidos, 3 partidos
  completados y 964 partidos historicos.
* Validacion local en Chromium desktop:
  48 banderas SVG encontradas y 48 cargadas desde `flag-icons`.
* Tooltip de Mexico verificado con
  `https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3/mx.svg`.
* Jugador Lionel Messi verificado con foto de Wikimedia Commons cargada
  (`naturalWidth=250`) y bandera Argentina `ar.svg`.
* Validacion local movil `390px`:
  48 banderas presentes, primera bandera visible cargada, `bodyOverflow=0` y
  botones con fuente minima `16.32px`.
* Capturas locales:
  `tmp/media-local-flags-svg-desktop.png` y
  `tmp/media-local-flags-svg-mobile.png`.

### Pruebas realizadas

* Sintaxis JS: correcta.
* Compilacion Python: correcta.
* Prueba local Chromium desktop: correcta.
* Prueba local Chromium movil `390px`: correcta.

### Errores o incidentes

* Los emoji flags no eran una solucion visual portable porque Windows puede
  representarlos como letras regionales.
* La instalacion temporal de Playwright dentro del repo genero errores por la
  carpeta sincronizada; se elimino `node_modules` del repo y se ejecuto la
  prueba desde una carpeta temporal local de Windows.

### Soluciones aplicadas

* Banderas SVG reales desde una libreria abierta y versionada.
* Fotos solo con manifest curado, fuente y licencia visible.
* Avatar cuando no existe imagen libre verificada.
* Tooltips ricos para paises y jugadores con datos estadisticos y atribucion.

### Pendientes

* Publicar `0.2.8` en GitHub Pages y validar la URL publica con cache-busting.
* Desplegar GAS candidato `0.2.8` si las credenciales de `clasp` lo permiten y
  volver a registrar el estado de acceso anonimo.

### Riesgos

* Las fotos externas dependen de Wikimedia Commons; si una imagen cambia o deja
  de responder, la app conserva avatar/fallback para no romper la interfaz.
* Las banderas dependen de CDN jsDelivr para `flag-icons`; si se requiere modo
  completamente offline, conviene vendorizar los SVG necesarios.

## 2026-06-12 18:18

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.7`

### Objetivo de la intervencion

Mejorar la legibilidad y usabilidad movil porque la app se percibia demasiado
pequena en celulares, con elementos dificiles de leer y tocar.

### Diagnostico inicial

* En viewport movil de `390px`, varios controles seguian con tamanos heredados
  de escritorio: botones de filtros en torno a `13.76px`, tablas en `14.4px`
  y controles tactiles de `36px`.
* Los filtros de grupo usaban 4 columnas en celular, comprimiendo texto y
  dificultando seleccion.
* Las tablas intentaban entrar completas en pantallas pequenas, reduciendo la
  lectura efectiva.

### Acciones realizadas

* Se agrego escala movil desde `@media (max-width: 680px)` con base
  tipografica `17px`.
* Se aumentaron botones, selects e inputs a `48px` de alto minimo.
* Las pestanas pasan a botones tactiles de `46px` y texto mayor.
* El hero mantiene lectura clara, con KPIs en dos columnas en celulares
  medianos y una columna en pantallas menores a `380px`.
* El panel de filtros usa botones de grupo mas grandes y menos comprimidos.
* Heatmaps, tarjetas Bayes, rankings, autores, equipos y pronosticos aumentan
  padding y tamanos de texto en movil.
* Las tablas pasan a `17px` y `min-width: 620px` dentro de `table-wrap` con
  desplazamiento horizontal tactil.
* Se actualizo version/cache/frontend/GAS/JSON a `0.2.7`.

### Archivos modificados

* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `gas/Config.gs`
* `index.html`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
python scripts\update_data.py
node --check assets\js\config.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
python -m http.server 8096
clasp push -f
clasp version "v0.2.7 legibilidad movil"
clasp deploy --versionNumber 10 --description "v0.2.7 legibilidad movil"
```

### Resultados verificados

* JSON local `0.2.7` generado con `data_version=wc26-20260612T221317z`.
* Cobertura conservada: 48 equipos, 1248 jugadores, 104 partidos y 964
  partidos historicos.
* Viewport movil `390px`: `scrollWidth=390`, sin desborde horizontal.
* Viewport movil `360px`: `scrollWidth=360`, sin desborde horizontal.
* Cuerpo movil: `fontSize=17px`, `lineHeight=26.35px`.
* H1 visible en `390px`: `41.65px`.
* Boton de pestana: `17px`, alto `46px`.
* Boton de filtro: `17px`, alto `48px`.
* Heatmap por equipo: `17px`, alto `46px`.
* Tablas: `17px`, `min-width=620px`, contenedor con `overflowX=auto`.
* Capturas locales:
  `tmp/mobile-after-first-viewport-390.png`,
  `tmp/mobile-after-jugadores-390.png`,
  `tmp/mobile-after-autores-390.png`,
  `tmp/mobile-after-legibility-390.png` y
  `tmp/mobile-after-legibility-360.png`.
* Commit funcional publicado:
  `4a65358 fix: mejorar legibilidad movil`.
* GitHub Pages build `27443911666` finalizado correctamente sobre
  `4a65358d88d4eeb924812846029056e73fd986c1`.
* URL publica validada con cache-busting:
  `https://diegomezapy.github.io/copa_mundial_probabilidades/?view=resumen&v=4a65358`.
* HTTP publico verificado: CSS, config JS y JSON respondieron `200`.
* JSON publico `0.2.7`: 48 equipos, 1248 jugadores, 104 partidos y 964
  partidos historicos.
* Viewport movil publico `390px`: `scrollWidth=390`, cuerpo `17px`, H1
  `41.65px`, pestanas `46px`, boton de filtro `48px`, tabla `17px`.
* Viewport movil publico `360px`: `scrollWidth=360`, cuerpo `17px`, H1
  `37.4px`, pestanas `46px`, boton de filtro `48px`, tabla `17px`.
* Capturas publicas:
  `tmp/mobile-public-after-legibility-390.png` y
  `tmp/mobile-public-after-legibility-360.png`.
* Desktop `1440px`: `scrollWidth=1440`, sin desborde horizontal, panel de
  filtros conserva `overflowY=auto`.
* GAS version `10` desplegada como Web App candidato
  `AKfycbwfCPG5UFL7pO7xw5NQWrTDt0zvLZdXrk6Lzb03fOfPmMbvjd4YbqrhJaTIeSx9rKpu`.
* Prueba anonima GAS:
  `https://script.google.com/macros/s/AKfycbwfCPG5UFL7pO7xw5NQWrTDt0zvLZdXrk6Lzb03fOfPmMbvjd4YbqrhJaTIeSx9rKpu/exec?action=health`
  devolvio `403 Prohibido`.

### Pruebas realizadas

* Sintaxis JS: correcta.
* Compilacion Python: correcta.
* Playwright local movil `390px` y `360px`: correcto.
* Playwright local desktop `1440px`: correcto.
* Playwright publico movil `390px` y `360px`: correcto.
* Prueba anonima GAS version 10: `403 Prohibido`.

### Errores o incidentes

* No se detectaron desbordes horizontales despues del ajuste.
* GAS sigue bloqueado anonimamente con `403 Prohibido`; se mantiene la app
  publica consumiendo JSON local/GitHub Pages.
* `git fetch` volvio a fallar por `desktop.ini` dentro de `.git\refs`; se
  retiraron esos metadatos de Google Drive antes de publicar.

### Soluciones aplicadas

* Escala movil legible y tactil.
* Tablas desplazables antes que comprimidas.
* Cache incrementado a `mundial-probabilidades-v0-2-7`.

### Pendientes

* Mantener documentado el bloqueo anonimo GAS `403 Acceso denegado` si se
  despliega nueva version GAS.

### Riesgos

* Las tablas son mas legibles pero algunas requieren desplazamiento horizontal
  en celular; se prioriza lectura real antes que miniaturizacion.

## 2026-06-12 16:31

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.6`

### Objetivo de la intervencion

Corregir la tarjeta `Senal` para que responda a filtros, habilitar navegacion
del panel lateral sin usar zoom, diversificar colores por grupo, sumar
movimientos didacticos a tablas y figuras, y actualizar perfiles academicos de
autores.

### Diagnostico inicial

* `renderClassroomCards()` usaba `filteredTeams()` para el promedio posterior,
  pero calculaba `Senal` con `state.data.teams`; por eso Mexico quedaba fijo.
* El panel lateral en escritorio podia quedar mas alto que la ventana y no tenia
  scroll interno.
* La interfaz seguia muy dominada por verdes, aunque ya tenia algunos acentos.
* Los perfiles de autores eran placeholders operativos y debian reemplazarse
  con datos academicos proporcionados por el usuario.

### Acciones realizadas

* `Senal` ahora usa el conjunto filtrado y cambia por grupo, equipo o busqueda.
* Al seleccionar un equipo, el filtro de grupo se sincroniza con el grupo real
  del equipo para evitar combinaciones imposibles.
* Se agrego paleta de 12 colores por grupo y variables `--group-color`.
* Se aplicaron colores de grupo a botones, accesos rapidos, heatmap, ranking,
  puntos del grafico, tablas, filas y tarjetas de equipos.
* El panel lateral tiene `max-height`, `overflow-y:auto` y scrollbar propio en
  escritorio; en movil vuelve a ser bloque normal debajo del contenido.
* Se agregaron microanimaciones a heatmaps, tablas, tarjetas didacticas y
  puntos del grafico, respetando `prefers-reduced-motion`.
* Se actualizo el perfil de Diego Bernardo Meza Bogado con afiliacion FACEN-UNA,
  Departamento de Estadistica, pais, ORCID y correo.
* Se resumio el perfil de Nicolas Vera Ramos con formacion en Matematica Pura,
  electronica, Python, SQL, analisis de datos, machine learning, redes
  neuronales y visualizacion.
* Se actualizo version frontend, cache, GAS y JSON a `0.2.6`.

### Archivos modificados

* `index.html`
* `assets/js/app.js`
* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `gas/Config.gs`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
node --check assets\js\config.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
python scripts\update_data.py
python -m http.server 8096
clasp push -f
clasp version "v0.2.6 filtros colores autores"
clasp deploy --versionNumber 9 --description "v0.2.6 filtros colores autores"
git fetch origin
git rebase origin/main
python scripts\update_data.py
git push origin main
gh run watch 27439477483 --repo diegomezapy/copa_mundial_probabilidades --exit-status --interval 10
```

### Resultados verificados

* JSON local y publico `0.2.6` generado con
  `data_version=wc26-20260612T204155z`.
* Cobertura conservada: 48 equipos, 1248 jugadores, 104 partidos y 964
  partidos historicos.
* `Senal` por defecto: `Mexico`.
* Al filtrar `Group B`, `Senal` cambia a `Switzerland`.
* Al seleccionar `Brazil`, el grupo activo pasa a `C` y `Senal` cambia a
  `Brazil`.
* Panel lateral desktop: `clientHeight=880`, `scrollHeight=1331`,
  `overflowY=auto` y `scrollTop` avanza hasta 451.
* Primeros colores de grupo verificados: `#0f766e`, `#2563eb`, `#7c3aed`,
  `#dc2626`.
* Autores verificados: `Diego Bernardo Meza Bogado` y `Nicolas Vera Ramos`.
* Enlaces verificados: ORCID `0000-0002-3469-6689` y correo
  `mailto:dmeza.py@gmail.com`.
* Sin desborde horizontal en la vista `Autores`.
* Commit publicado: `6056a7c feat: mejorar filtros colores y autores`.
* GitHub Pages build `27439477483` finalizado correctamente sobre
  `6056a7ce90791913ca08ade746739a28745471d3`.
* URL publica validada con cache-busting:
  `https://diegomezapy.github.io/copa_mundial_probabilidades/?view=resumen&v=6056a7c`.
* HTTP publico verificado:
  `index.html`, `assets/css/styles.css`, `assets/js/app.js` y
  `data/worldcup2026_latest.json` respondieron `200`.
* JSON publico verificado: 48 equipos, 1248 jugadores, 104 partidos, 22 copas
  historicas, 964 partidos historicos, 152 paises historicos y 250 goleadores
  historicos registrados.
* GAS version `9` desplegada como Web App
  `AKfycbw6GZlQk00ZoNf1aeseouHv_y-0ONCgXNYvcIhzPDNx2HQ5UpE-ewcXROWDKXGWv8vZYw`.
* Prueba anonima GAS:
  `https://script.google.com/macros/s/AKfycbw6GZlQk00ZoNf1aeseouHv_y-0ONCgXNYvcIhzPDNx2HQ5UpE-ewcXROWDKXGWv8vZYw/exec?action=health`
  devolvio `403 Acceso denegado`.
* Capturas locales:
  `tmp/app-local-resumen-v026-desktop.png`,
  `tmp/app-local-resumen-v026-mobile.png`,
  `tmp/app-local-autores-v026-desktop.png`,
  `tmp/app-local-autores-v026-mobile.png`,
  `tmp/app-local-resumen-filtros-colores-v026.png` y
  `tmp/app-local-autores-datos-v026.png`.
* Capturas publicas:
  `tmp/app-public-resumen-v026-desktop.png` y
  `tmp/app-public-autores-v026-desktop.png`.

### Pruebas realizadas

* `node --check`: correcto.
* `py_compile`: correcto.
* Playwright local desktop: senal filtrable, scroll de filtros, colores por
  grupo y autores.
* Playwright local movil: capturas de resumen y autores.
* Playwright publico desktop:
  * registro inicial `qa.public`;
  * `Senal` por defecto `Mexico`;
  * filtro `Group B` cambia `Senal` a `Switzerland`;
  * selector `Brazil` sincroniza grupo activo a `Group C` y cambia `Senal` a
    `Brazil`;
  * panel lateral con `clientHeight=880`, `scrollHeight=1331`,
    `overflowY=auto` y `scrollTop=451`;
  * primeros colores de grupo: `#0f766e`, `#2563eb`, `#7c3aed`, `#dc2626`;
  * autores muestran nombre completo, ORCID, correo y resumen academico.
* Prueba anonima GAS: `403 Acceso denegado`.

### Errores o incidentes

* La prueba inicial mostro que `Group B + Brazil` producia `Sin datos`; se
  resolvio sincronizando automaticamente el grupo al equipo elegido.
* El primer `git push` fue rechazado porque el workflow remoto agrego el commit
  `004059a data: actualizar cache mundial 2026`; se integro con rebase.
* `git fetch` fallo inicialmente por archivos `desktop.ini` dentro de
  `.git\refs`; se retiraron esos artefactos de Google Drive antes de continuar.
* El rebase dejo procesos `git`/`vim` y candados `.git\index.lock` /
  `.git\packed-refs.lock`; se confirmo que no habia procesos activos y se
  limpiaron los candados vacios.

### Soluciones aplicadas

* `renderClassroomCards()` usa `filteredTeams()` tambien para `Senal`.
* `teamFilter` y accesos rapidos actualizan `state.filters.group` con el grupo
  real del equipo seleccionado.
* CSS con variables de grupo y scroll interno del panel lateral.
* Tarjetas de autores con `details` y `links` estructurados.

### Pendientes

* Mantener documentado el bloqueo anonimo GAS `403 Acceso denegado` hasta que
  el propietario republique el Web App con acceso real anonimo.
* Considerar actualizar el workflow de Pages por la advertencia de deprecacion
  de acciones Node.js 20 antes de septiembre de 2026.

### Riesgos

* `color-mix()` requiere navegadores modernos; se mantiene estructura legible
  aun si algun color avanzado no se aplica.
* Las animaciones deben permanecer sutiles para no distraer ni saturar la
  lectura academica.

## 2026-06-12 15:44

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.5`

### Objetivo de la intervencion

Separar autores y colaboracion en una pestana propia, mejorar el orden de los
elementos y reducir vistas cargadas o apretadas, especialmente en `Acerta`.

### Diagnostico inicial

* La vista `Acerta` mezclaba hero, metricas, evolucion, autores y 36 tarjetas
  de partidos en una misma pantalla.
* La informacion de autoria competia con el flujo operativo de pronosticos.
* En pantallas pequenas habia riesgo de vistas largas y pesadas para
  estudiantes o ninos.

### Acciones realizadas

* Se agrego la pestana `Autores`.
* Se movio `Autores y colaboracion` fuera de `Acerta`.
* Se reorganizo `Acerta` en tres bloques: resumen de pronosticos, evolucion y
  puntaje, mas partidos filtrados.
* Se limito la primera carga visual de partidos a 18 tarjetas y se agrego una
  nota cuando hay mas partidos disponibles bajo los filtros actuales.
* Se hizo que los partidos de `Acerta` respeten grupo, equipo, estado y
  busqueda del panel lateral.
* Se ajustaron estilos para reducir densidad, evitar anchos fijos en tarjetas y
  prevenir desbordes horizontales.
* En movil, la vista activa y sus pestanas pasan antes que el panel de filtros;
  los filtros quedan debajo para no bloquear el contenido principal.
* Se actualizo version frontend, cache, GAS y JSON a `0.2.5`.

### Archivos modificados

* `index.html`
* `assets/js/app.js`
* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `gas/Config.gs`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
node --check assets\js\config.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
python scripts\update_data.py
python -m http.server 8095
clasp push -f
clasp version "v0.2.5 separar autores y ordenar vistas"
clasp deploy --versionNumber 8 --description "v0.2.5 separar autores y ordenar vistas"
git push
gh api repos/diegomezapy/copa_mundial_probabilidades/pages/builds/latest
```

### Resultados verificados

* JSON local `0.2.5` generado con 48 equipos, 1248 jugadores, 104 partidos y
  964 partidos historicos.
* `Acerta` ya no contiene el bloque `authorCards`.
* La pestana `Autores` muestra 2 tarjetas de perfiles y 4 notas de
  colaboracion/actualizacion.
* `Acerta` muestra 18 tarjetas iniciales y `18/72 visibles` con filtros
  generales.
* Sin desborde horizontal en desktop `1440px` ni movil `390px`.
* El mensaje vacio del panel de evolucion queda debajo de la formula y no se
  superpone.
* En movil, la pestana activa `Autores` queda visible, el contenido aparece
  antes de filtros y no hay desborde horizontal.
* GAS version `8` desplegada como Web App
  `AKfycbw3Ocimn2emzT6q1M9BT4EkmscVihRLRThNA9dM8tAL3fkjRez_saqRDhpjPxRqgYCM8w`.
* Prueba anonima del nuevo Web App:
  `https://script.google.com/macros/s/AKfycbw3Ocimn2emzT6q1M9BT4EkmscVihRLRThNA9dM8tAL3fkjRez_saqRDhpjPxRqgYCM8w/exec?action=health`
  devolvio `403 Acceso denegado`.
* Commit funcional publicado: `63354e1 feat: separar autores y ordenar acerta`.
* Commit final de orden movil publicado:
  `a3c1cbd fix: ordenar vistas moviles`.
* `origin/main` y GitHub `main` verificados en
  `a3c1cbd0d4f40bb26bf62477f36a14addf0c309e`.
* HTML publico verificado con `v0.2.5`, pestana `Autores` y sin el texto
  antiguo `Acerta de los autores`.
* JSON publico verificado con `app_version=0.2.5`,
  `data_version=wc26-20260612T193932z`, 48 equipos, 1248 jugadores, 104
  partidos y 964 partidos historicos.
* CSS publico verificado con `?v=a3c1cbd`: contiene orden movil
  `workspace` antes de filtros y ya no fuerza `flex-wrap: nowrap` en tabs.
* Playwright publico desktop y movil valido `Acerta`: 18 tarjetas,
  `18/72 visibles`, autores fuera de `Acerta`, footer `v0.2.5` y sin
  desborde horizontal.
* Playwright publico movil valido `Autores`: pestana activa visible, contenido
  antes de filtros, 2 tarjetas de autores, 4 notas y sin desborde horizontal.
* Capturas locales:
  `tmp/app-local-acerta-desktop2-v025.png`,
  `tmp/app-local-acerta-mobile-top-v025.png`,
  `tmp/app-local-acerta-mobile-focus-v025.png` y
  `tmp/app-local-autores-desktop-v025.png`,
  `tmp/app-local-autores-mobile-order-v025.png` y
  `tmp/app-local-autores-mobile-tabs-v025.png`.
* Capturas publicas:
  `tmp/app-public-acerta-desktop-v025.png`,
  `tmp/app-public-acerta-mobile-v025.png`,
  `tmp/app-public-autores-desktop-v025.png`,
  `tmp/app-public-autores-mobile-v025.png` y
  `tmp/app-public-autores-mobile-final-v025.png`.

### Pruebas realizadas

* `node --check`: correcto.
* `py_compile`: correcto.
* Playwright local desktop: registro, vista `Acerta`, pestana `Autores`,
  conteo de tarjetas, ausencia de autores dentro de `Acerta` y control de
  desborde horizontal.
* Playwright local movil: registro, vista `Acerta`, tarjetas, inicio de vista y
  control de desborde horizontal.
* Playwright local movil `Autores`: verificacion de contenido antes de filtros,
  pestana activa visible y sin desborde horizontal.
* Prueba anonima GAS: `403 Acceso denegado`.
* Playwright publico desktop/movil para `Acerta` y `Autores`.
* Verificacion HTTP publica de `index.html`, `worldcup2026_latest.json` y
  `assets/css/styles.css` con cache-busting.

### Errores o incidentes

* Se detecto que el mensaje vacio de evolucion se cruzaba visualmente con la
  formula del tablero; se agrego una regla especifica para centrarlo debajo de
  la formula.

### Soluciones aplicadas

* Separacion de responsabilidades por pestanas.
* Render de autores independiente de `renderPredictions()`.
* Lista de pronosticos filtrable y acotada para evitar saturacion inicial.
* CSS responsive para `Acerta`, `Autores`, tarjetas de pronostico y tabs.

### Pendientes

* Mantener documentado el bloqueo anonimo GAS `403 Acceso denegado` hasta que
  el propietario republique el Web App con acceso real anonimo.

### Riesgos

* Si el usuario espera ver todos los partidos simultaneamente en `Acerta`, debe
  usar filtros para enfocar la lista; esto se prioriza para mejorar legibilidad.
* El backend GAS sigue pendiente de prueba anonima exitosa.

## 2026-06-12 15:23

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.4`

### Objetivo de la intervencion

Corregir el efecto visual del balon, que se percibia como un boton flotante, y
reemplazarlo por una animacion mas realista inspirada en pelota con limites,
velocidad, rebote y repintado continuo.

### Diagnostico inicial

* El balon anterior era un elemento CSS circular con gradientes.
* Visualmente no se leia como pelota de futbol y podia parecer un boton movido
  de forma extrana por el fondo.
* El usuario aporto un ejemplo Java con una clase `pelota`, limites, velocidad,
  rebote y `Timer` para repintado cada 16 ms.

### Acciones realizadas

* Se reemplazo el `span.motion-ball` por `canvas#heroBallCanvas`.
* Se implemento animacion con `requestAnimationFrame`, posicion, velocidad,
  rebote contra limites, rotacion, sombra y estela.
* Se dibujo el balon en Canvas 2D con base circular, paneles oscuros, lineas,
  brillo y sombra.
* Se retiro la animacion CSS antigua `ballFlight`/`ballShadow`.
* Se ajusto el comportamiento movil para ubicar el balon mas hacia el lateral y
  reducir su opacidad.
* Se actualizo version frontend, cache, GAS y JSON a `0.2.4`.

### Archivos modificados

* `index.html`
* `assets/js/app.js`
* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `gas/Config.gs`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
node --check assets\js\config.js
node --check assets\js\model.js
node --check assets\js\data.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
python scripts\update_data.py
git push
clasp push -f
clasp version "v0.2.4 balon canvas rebote"
clasp deploy --versionNumber 7 --description "v0.2.4 balon canvas rebote"
```

### Resultados verificados

* JSON local `0.2.4` generado con `data_version=wc26-20260612T191926z`.
* Cobertura historica conservada: 22 Copas, 964 partidos historicos, 152
  paises y 536 goleadores.
* Canvas del hero verificado con pixeles no transparentes y cambio entre frames.
* Vista desktop validada con footer `v0.2.4`.
* Vista movil validada con canvas activo, 12 grupos y footer `v0.2.4`.
* Capturas: `tmp/app-ball-canvas-desktop-a.png`,
  `tmp/app-ball-canvas-desktop-b.png`, `tmp/app-ball-canvas-mobile.png` y
  `tmp/app-ball-canvas-mobile-v2.png`.
* Commit publicado en GitHub: `c7fcd71 feat: reemplazar balon por animacion canvas`.
* GitHub Pages build `built` para commit
  `c7fcd713b4284d8ad56784698196c74e3a287718`.
* JSON publico verificado:
  `https://diegomezapy.github.io/copa_mundial_probabilidades/data/worldcup2026_latest.json?v=c7fcd71`
  con `app_version=0.2.4`, 48 equipos, 1248 jugadores, 104 partidos y 964
  partidos historicos.
* HTML publico verificado con `heroBallCanvas`, footer `v0.2.4` y sin la clase
  antigua `motion-ball`.
* Playwright publico valido movimiento real del canvas en desktop y movil
  comparando hashes entre frames.
* Capturas publicas:
  `tmp/app-public-ball-canvas-desktop.png`,
  `tmp/app-public-ball-canvas-desktop-movement.png` y
  `tmp/app-public-ball-canvas-mobile-movement.png`.
* GAS version `7` desplegada como Web App
  `AKfycbw_41GWkNQuLNb8w12N0Ke06crIGSOCUVTnIUUmNqk7U5f8Q1YKc-tFng2j_D5t1FTn-g`.

### Pruebas realizadas

* `node --check`: correcto.
* `py_compile`: correcto.
* Playwright local desktop: registro, canvas, comparacion de frames y captura.
* Playwright local movil: registro, canvas, tablero y captura.
* Prueba publica desktop: registro `public.ball.desk`, canvas `1392x343`,
  cambio de hash entre frames y footer `v0.2.4`.
* Prueba publica movil: registro `public.ball.mob`, canvas `362x792`, cambio
  de hash entre frames y footer `v0.2.4`.
* Prueba anonima GAS:
  `https://script.google.com/macros/s/AKfycbw_41GWkNQuLNb8w12N0Ke06crIGSOCUVTnIUUmNqk7U5f8Q1YKc-tFng2j_D5t1FTn-g/exec?action=health`
  devolvio `403 Acceso denegado`.

### Errores o incidentes

* El primer ajuste movil dejaba el balon demasiado cerca del titulo; se movio
  mas hacia el lateral y se redujo opacidad.
* El nuevo Web App GAS quedo creado y versionado, pero no disponible para
  acceso anonimo: retorna `403 Acceso denegado`.

### Soluciones aplicadas

* Animacion canvas con fisica simple y repintado real.
* Dibujo del balon como objeto futbolistico, no como boton CSS.
* Respeto de `prefers-reduced-motion`: el canvas se desactiva junto con las
  capas animadas.
* Se conserva GitHub Pages como superficie publica funcional con datos JSON
  abiertos y fallbacks locales, sin depender del endpoint GAS bloqueado.

### Pendientes

* Resolver desde la consola/cuenta propietaria de Apps Script el permiso real
  del Web App GAS para que `action=health` responda anonimamente.
* Una vez que GAS pase prueba anonima HTTP, habilitar sincronizacion remota de
  visitas y pronosticos.

### Riesgos

* En pantallas pequenas, el balon debe acompanar sin tapar lectura; se redujo
  opacidad y se desplazo al lateral.
* Canvas agrega trabajo grafico; se mantiene acotado al hero y sin dependencias
  externas.
* El backend GAS sigue bloqueado para usuarios anonimos; la app publica opera
  con datos JSON y almacenamiento local hasta corregir permisos del Web App.

## 2026-06-12 15:05

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.3`

### Objetivo de la intervencion

Agregar una experiencia tipo quiniela academica para que cada usuario anote sus
pronosticos, vea aciertos/fallas y consulte una seccion de autores con perfiles
academicos operativos.

### Diagnostico inicial

* La app tenia registro local, visitas, evidencia y animaciones, pero faltaba
  participacion activa del usuario sobre partidos.
* No hay backend GAS anonimo operativo; por tanto, los pronosticos debian ser
  locales hasta resolver el `403 Prohibido`.
* El repo no contiene CV formal de Diego Gomez Apy ni Nicolas Vera; se debia
  evitar inventar titulos, cargos o filiaciones.

### Acciones realizadas

* Se agrego la vista `Acertá` en la navegacion principal.
* Se implementaron pronosticos locales por usuario en `localStorage`.
* Se agrego evaluacion automatica: 3 puntos por marcador exacto, 1 por signo
  correcto y 0 por falla.
* Se agrego tablero de evolucion personal, resumen de puntos, aciertos,
  exactos, precision y lista de partidos para guardar pronosticos.
* Se agregaron perfiles de autores: Diego Gomez Apy como autor principal y
  Nicolas Vera como colaborador, con resumen academico operativo editable.
* Se agregaron simbolos estadisticos animados en el hero.
* Se preparo GAS para futura accion `prediction` y pestana
  `PREDICCIONES_USUARIO`.
* Se actualizo version frontend, cache, GAS y JSON a `0.2.3`.
* Se publico el commit `365a75c` en GitHub Pages.
* Se subio GAS con `clasp push -f`, se creo version `6` y se desplego el Web
  App `AKfycbzG1xeZ4YZpQeiUNGIQpKkz4CE99333t58iRMiodzjrA9k-E9xI-Ysr3OZC_uf_51HHDw`.

### Archivos modificados

* `index.html`
* `assets/js/app.js`
* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `gas/Config.gs`
* `gas/Code.gs`
* `gas/Auditoria.gs`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/diccionario_datos.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
node --check assets\js\config.js
node --check assets\js\model.js
node --check assets\js\data.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
python scripts\update_data.py
git push
clasp push -f
clasp version "v0.2.3 acierta usuarios autores"
clasp deploy --versionNumber 6 --description "v0.2.3 acierta usuarios autores"
```

### Resultados verificados

* JSON local `0.2.3` generado con `data_version=wc26-20260612T190050z`.
* Cobertura historica conservada: 22 Copas, 964 partidos historicos, 152
  paises y 536 goleadores.
* Vista `Acertá` local validada con usuario `acerta.final`.
* Se guardo 1 pronostico local y el resumen mostro `1 guardados · 0 evaluados`.
* Se verificaron 2 tarjetas de autores, 36 partidos listados, ancho de grilla
  de 1086 px en escritorio y footer `v0.2.3`.
* Capturas: `tmp/app-acerta-desktop.png`, `tmp/app-acerta-desktop-v2.png`,
  `tmp/app-acerta-mobile.png` y `tmp/app-acerta-final-desktop.png`.
* URL publica verificada:
  `https://diegomezapy.github.io/copa_mundial_probabilidades/?v=365a75c&view=acerta`.
* JSON publico verificado con `app_version=0.2.3`,
  `data_version=wc26-20260612T190050z` y 964 partidos historicos.
* HTML publico verificado con vista `acerta` y `predictionMatches`.
* Captura publica: `tmp/app-public-acerta-desktop.png`.

### Pruebas realizadas

* `node --check`: correcto.
* `py_compile`: correcto.
* Playwright local desktop: registro, vista `Acertá`, guardado de pronostico,
  autores y grilla de partidos.
* Playwright local movil: registro, vista `Acertá`, autores y footer.
* Playwright publico: registro nuevo `public.acerta`, guardado de 1 pronostico,
  2 autores, 36 partidos y footer `v0.2.3`.
* GitHub Pages build `built` para commit `365a75c`.
* Prueba HTTP anonima de GitHub Pages: `200`.
* Prueba HTTP anonima del Web App GAS v6 para `health` y `prediction`: `403
  Prohibido`.

### Errores o incidentes

* La primera version de `Mis partidos para acertar` ocupaba solo media columna;
  se corrigio con `content-grid.two > .span-2` y grilla responsive para
  tarjetas de pronostico.

### Soluciones aplicadas

* Participacion activa sin backend obligatorio.
* Persistencia local por usuario registrado.
* Preparacion de endpoint GAS futuro sin activar dependencia publica.
* Perfiles academicos prudentes, sin credenciales no verificadas.

### Pendientes

* Resolver `403 Prohibido` del Web App GAS para sincronizar pronosticos en
  Google Sheets.
* Completar perfiles academicos oficiales de Diego Gomez Apy y Nicolas Vera si
  el usuario provee CV, filiacion o texto formal.

### Riesgos

* Los pronosticos son locales al navegador mientras GAS no este disponible.
* Si el usuario borra almacenamiento local, pierde su historial.
* Los perfiles de autores deben revisarse antes de usarse como CV publico
  formal.

## 2026-06-12 14:48

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.2`

### Objetivo de la intervencion

Mejorar orden, modernidad y dinamismo visual de la app, incorporando efectos
que emulen el movimiento del balon y ayuden a entender el flujo del modelo.

### Diagnostico inicial

* La app ya tenia evidencia historica, filtros, visitas y referencias, pero la
  lectura del resumen todavia podia sentirse extensa y poco coreografiada.
* El hero y el tablero necesitaban una capa de movimiento con sentido
  estadistico, sin convertir la app en una portada decorativa.

### Acciones realizadas

* Se agrego una capa animada en el hero con balon, trazos de pase y lineas de
  cancha.
* Se agrego la seccion `Ruta del modelo` en el resumen para ordenar
  Datos-Prior-Posterior-Pronostico.
* Se agregaron transiciones suaves de vistas, entrada de pasos, barras animadas
  y hover moderno en paneles.
* Se incorporo soporte `prefers-reduced-motion` para reducir animaciones cuando
  el usuario lo solicite.
* Se actualizo version frontend, cache, GAS y JSON a `0.2.2`.
* Se publico el commit `5d86d42` en GitHub Pages.
* Se subio GAS con `clasp push -f`, se creo version `5` y se desplego el Web
  App `AKfycbzECqC9jBhu4UPak6nMfsfM3JwGmTq1gAGISmnJ0_McMqfFEN6Nbz_1-YEEyOj4KpNTAw`.

### Archivos modificados

* `index.html`
* `assets/css/styles.css`
* `assets/js/app.js`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `gas/Config.gs`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
node --check assets\js\config.js
node --check assets\js\model.js
node --check assets\js\data.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
python scripts\update_data.py
git push
clasp push -f
clasp version "v0.2.2 movimiento balon ruta visual"
clasp deploy --versionNumber 5 --description "v0.2.2 movimiento balon ruta visual"
```

### Resultados verificados

* JSON local `0.2.2` generado con `data_version=wc26-20260612T184705z`.
* Cobertura historica conservada: 22 Copas, 964 partidos historicos, 152
  paises y 536 goleadores.
* Vista Resumen desktop validada con 4 pasos de ruta del modelo, balon animado
  y footer `v0.2.2`.
* Vista Resumen movil validada con 4 pasos, 12 grupos y footer `v0.2.2`.
* Capturas: `tmp/app-motion-desktop.png` y `tmp/app-motion-mobile.png`.
* URL publica verificada:
  `https://diegomezapy.github.io/copa_mundial_probabilidades/?v=5d86d42&view=resumen`.
* JSON publico verificado con `app_version=0.2.2`,
  `data_version=wc26-20260612T184705z` y 964 partidos historicos.
* HTML publico verificado con `ball-motion-layer` y `modelFlow`.
* Captura publica: `tmp/app-public-motion-desktop.png`.

### Pruebas realizadas

* `node --check`: correcto.
* `py_compile`: correcto.
* Playwright local desktop: registro nuevo, ruta del modelo, balon y tablero.
* Playwright local movil: registro nuevo, ruta del modelo y tablero responsive.
* Playwright publico: registro nuevo `public.motion`, 4 pasos de ruta del
  modelo, balon presente, 12 grupos y footer `v0.2.2`.
* GitHub Pages build `built` para commit `5d86d42`.
* Prueba HTTP anonima de GitHub Pages: `200`.
* Prueba HTTP anonima del Web App GAS v5 para `health`: `403 Prohibido`.

### Errores o incidentes

* La animacion inicial de la pelota de la ruta del modelo se ajusto para usar el
  ancho real del panel y evitar desbordes en pantallas amplias.

### Soluciones aplicadas

* Movimiento visual orientado a explicar el flujo estadistico, no decoracion sin
  funcion.
* Animaciones CSS sin dependencias externas.
* Fallback de accesibilidad para reducir movimiento.

### Pendientes

* Mantener pendiente el bloqueo `403 Prohibido` del Web App GAS anonimo.

### Riesgos

* Animaciones excesivas pueden distraer; se mantuvieron concentradas en hero,
  ruta del modelo y transiciones suaves.
* En dispositivos de bajo rendimiento, `prefers-reduced-motion` permite una
  experiencia menos animada.

## 2026-06-12 14:27

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.1`

### Objetivo de la intervencion

Agregar registro inicial de usuario sin password, ingreso posterior con perfil
local, estadisticas de visitas, referencias permanentes, derechos de uso de
datos y paginas de interes.

### Diagnostico inicial

* La app era publica y no requeria registro.
* El Web App GAS v0.2.0 seguia devolviendo `403 Prohibido` anonimamente, por lo
  que no era prudente hacer depender el acceso del backend.
* La auditoria mostraba fuentes, pero faltaba una seccion didactica separada de
  referencias, derechos de datos y enlaces de interes.

### Acciones realizadas

* Se agrego puerta de registro inicial con usuario, nombre, pais, perfil,
  institucion y aceptacion de referencias/derechos.
* Se implemento ingreso posterior sin password mediante `localStorage`.
* Se agrego vista `Visitas` con perfil local, visitas totales, primer ingreso,
  ultimo ingreso, ultima vista y conteo por seccion.
* Se agrego vista `Referencias` con derechos de uso, trazabilidad y enlaces a
  fuentes consultadas.
* Se preparo GAS para recibir `/exec?action=visit` y registrar eventos en la
  pestana `VISITAS` cuando el Web App quede anonimamente disponible.
* Se actualizo version frontend, cache, GAS y JSON a `0.2.1`.
* Se publico el commit `56c2f2f` en GitHub Pages.
* Se subio GAS con `clasp push -f`, se creo version `4` y se desplego el Web
  App `AKfycbx2I2cP5Wi_RZmHnrWT8X8YEYhm-tzZhPWdg8OarjlS2fBO0Gz9-1WJVF9xE9kWrpoILA`.

### Archivos modificados

* `index.html`
* `assets/js/app.js`
* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `gas/Config.gs`
* `gas/Code.gs`
* `gas/Auditoria.gs`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `docs/diccionario_datos.md`
* `docs/PROMPTS_MUNDIAL_PROBABILIDADES_2026-06-12.md`

### Comandos o scripts ejecutados

```powershell
node --check assets\js\config.js
node --check assets\js\model.js
node --check assets\js\data.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
python scripts\update_data.py
git push
clasp push -f
clasp version "v0.2.1 registro visitas referencias"
clasp deploy --versionNumber 4 --description "v0.2.1 registro visitas referencias"
```

### Resultados verificados

* JSON local `0.2.1` generado con `data_version=wc26-20260612T182509z`.
* Cobertura historica conservada: 22 Copas, 964 partidos historicos, 152
  paises y 536 goleadores.
* Registro inicial validado en navegador limpio.
* Ingreso posterior sin password validado al recargar.
* Vista `Visitas` validada con perfil `estudiante.demo` y conteos locales.
* Vista `Referencias` validada con 7 enlaces y panel de derechos de datos.
* Capturas: `tmp/app-visitas-desktop.png`,
  `tmp/app-referencias-desktop.png`, `tmp/app-registro-mobile.png` y
  `tmp/app-resumen-mobile-registered.png`.
* URL publica verificada:
  `https://diegomezapy.github.io/copa_mundial_probabilidades/?v=56c2f2f&view=referencias`.
* GitHub Pages sirvio `index.html` con `0.2.1`, `authGate` y `Referencias`.
* JSON publico verificado con `app_version=0.2.1`,
  `data_version=wc26-20260612T182509z` y 964 partidos historicos.
* Captura publica: `tmp/app-public-referencias-desktop.png`.

### Pruebas realizadas

* `node --check`: correcto.
* `py_compile`: correcto.
* Playwright local desktop: registro, visitas, referencias y recarga sin
  password.
* Playwright local movil: registro y carga de tablero con 12 grupos.
* Playwright publico: registro nuevo `public.demo`, vista Referencias con 7
  enlaces y footer `v0.2.1`.
* Prueba HTTP anonima de GitHub Pages: `200`.
* Prueba HTTP anonima del Web App GAS v4 para `health` y `visit`: `403
  Prohibido`.

### Errores o incidentes

* La primera espera Playwright uso un selector incorrecto para un elemento
  `hidden`; se corrigio la prueba usando estado `hidden`.
* GAS sigue sin poder usarse como dependencia publica hasta resolver el `403`
  anonimo del Web App.
* Un selector Playwright publico uso `footer` y matcheo pies internos de
  tarjetas; se corrigio a `.footer`.

### Soluciones aplicadas

* Registro sin password como perfil local, evitando recolectar contrasenas.
* Conteo de visitas local y preparacion de eventos GAS sin activar dependencia
  mientras no exista endpoint publico validado.
* Seccion separada de referencias para respetar derechos de uso y facilitar
  consulta academica.

### Pendientes

* Resolver permisos del Web App GAS para que `/exec?action=health` y
  `/exec?action=visit` respondan anonimamente.
* Ejecutar `setupWorkbook()` o sincronizacion equivalente cuando GAS quede
  operativo para crear la pestana `VISITAS`.

### Riesgos

* El registro local no es autenticacion fuerte y no debe proteger datos
  sensibles.
* Las estadisticas de visitas son locales al navegador mientras GAS no este
  publicado anonimamente.
* Los derechos de uso dependen de las condiciones vigentes de cada fuente
  enlazada; deben revisarse antes de reutilizacion externa.

## 2026-06-12 09:05

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.2.0`

### Objetivo de la intervencion

Enriquecer la app con evidencia historica y estadisticas didacticas filtrables
por pais, Copa pasada y jugadores, para que el tablero sea mas comprensible,
atractivo y util en aula.

### Diagnostico inicial

* La app tenia panel lateral, mapa de avance por grupo y tarjetas didacticas,
  pero aun faltaba contexto historico profundo.
* El JSON solo exponia datos 2026 y planteles actuales; los partidos historicos
  se usaban internamente para rating pero no estaban disponibles para el panel.

### Acciones realizadas

* Se amplio `scripts/update_data.py` para descargar Copas 1930-2022 desde
  OpenFootball.
* Se agregaron agregaciones historicas: Copas, paises, pais-Copa, mano a mano,
  partidos historicos y goleadores historicos.
* Se corrigio el conteo de titulos para contar un titulo por torneo, no por
  partido del campeon.
* Se normalizaron alias historicos clave: `United States` a `USA`,
  `West Germany` a `Germany` y `Czechoslovakia` a `Czech Republic`.
* Se agregaron filtros por Copa historica y posicion de jugadores.
* Se creo la vista `Evidencia` con hero, badges, linea de tiempo, mano a mano,
  ranking historico por pais y tabla de partidos historicos.
* Se agregaron goleadores historicos a la vista `Jugadores`.
* Se agrego soporte de URL directa `?view=evidencia`.
* Se ampliaron pestanas GAS para historico:
  `HISTORICO_COPAS`, `HISTORICO_PAISES`, `HISTORICO_PARTIDOS`,
  `HISTORICO_GOLEADORES`.
* Se publico el commit `5e5be71` en GitHub Pages.
* Se subio GAS con `clasp push -f`, se creo version `3` y se desplego el Web
  App `AKfycbxwEbxIXzqpNoAFw6whSeWczye90udTIVzTnPQypmK-iQ8P2uIK3te6MbB84uWTpUeqCw`.

### Archivos modificados

* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `index.html`
* `assets/js/app.js`
* `assets/js/config.js`
* `assets/css/styles.css`
* `service-worker.js`
* `gas/Config.gs`
* `gas/Sync.gs`
* `README.md`
* `docs/manual_tecnico.md`
* `docs/manual_usuario.md`
* `docs/diccionario_datos.md`

### Comandos o scripts ejecutados

```powershell
python scripts\update_data.py
python -m py_compile scripts\update_data.py scripts\make_assets.py
node --check assets\js\config.js
node --check assets\js\model.js
node --check assets\js\data.js
node --check assets\js\app.js
node --check service-worker.js
npx playwright screenshot --full-page --wait-for-selector "#countryHistoryTable .history-row" --viewport-size "1440,1200" "http://localhost:8080?v=020&view=evidencia" tmp\app-evidencia-desktop.png
npx playwright screenshot --full-page --wait-for-selector "#scorersList .scorer-card" --viewport-size "390,980" "http://localhost:8080?v=020&view=jugadores" tmp\app-jugadores-mobile.png
```

### Resultados verificados

* Cache `0.2.0` generado con 48 equipos, 1.248 jugadores, 104 partidos 2026,
  22 Copas historicas, 964 partidos historicos, 152 paises historicos y 536
  goleadores historicos detectados.
* Captura local de `Evidencia`: `tmp/app-evidencia-desktop.png`.
* Captura local de `Jugadores`: `tmp/app-jugadores-mobile.png`.

### Pruebas realizadas

* `py_compile`: correcto.
* `node --check`: correcto.
* Playwright espero selectores de datos reales antes de capturar.

### Errores o incidentes

* Se detecto conteo incorrecto de titulos historicos por acumulacion por
  partido; corregido a acumulacion por torneo.

### Soluciones aplicadas

* Dataset historico reproducible dentro del JSON publico.
* Filtros combinables por pais, Copa, jugador, posicion, grupo y estado.
* Vista de evidencia separada para no saturar el resumen principal.

### Pendientes

* Publicar commit y verificar URL publica con `?view=evidencia`.
* Empujar GAS v0.2.0 y versionar.
* Mantener pendiente autorizacion anonima del Web App GAS si sigue 403.

### Riesgos

* OpenFootball no reemplaza fuente oficial FIFA; se usa como fuente estructurada
  reproducible y FIFA queda como referencia oficial.
* Los goleadores historicos dependen de eventos de gol disponibles en la fuente;
  no deben interpretarse como base biografica completa de jugadores.

## 2026-06-12 08:05

### Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Cliente o institucion: Proyecto academico publico
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Repositorio: `https://github.com/diegomezapy/copa_mundial_probabilidades.git`
* URL publica: `https://diegomezapy.github.io/copa_mundial_probabilidades/`
* Responsable: Codex
* Version: `0.1.1`

### Objetivo de la intervencion

Mejorar radicalmente la experiencia visual y didactica: agregar panel lateral de
filtros con botones y un tablero estadistico mas atractivo para estudiantes,
ninos y publico general.

### Diagnostico inicial

* La app publica ya estaba operativa en GitHub Pages.
* La vista tenia filtros superiores basicos y tablas funcionales, pero faltaba
  un panel lateral de filtros y graficos mas didacticos.
* El arbol local estaba sincronizado con `origin/main` en commit `6ecbb55`.

### Acciones realizadas

* Se reemplazo la barra superior de filtros por un panel lateral con:
  busqueda, botones de grupos, selector de equipo, accesos rapidos a equipos y
  botones de estado de partido.
* Se agrego tablero estadistico en la vista Resumen:
  mapa de avance por grupo, grafico ataque vs defensa, proximos cruces con
  probabilidades 1-X-2 y tarjetas "Aula Bayes".
* Se ajusto responsive para desktop y movil.
* Se actualizo version frontend/cache/datos a `0.1.1`.
* Se regenero `data/worldcup2026_latest.json`.

### Archivos modificados

* `index.html`
* `assets/css/styles.css`
* `assets/js/app.js`
* `assets/js/config.js`
* `service-worker.js`
* `scripts/update_data.py`
* `data/worldcup2026_latest.json`
* `data/sources_manifest.json`
* `gas/Config.gs`

### Comandos o scripts ejecutados

```powershell
python scripts\update_data.py
node --check assets\js\config.js
node --check assets\js\model.js
node --check assets\js\data.js
node --check assets\js\app.js
node --check service-worker.js
python -m py_compile scripts\update_data.py scripts\make_assets.py
npx playwright screenshot --full-page --wait-for-selector "#groupHeatmap .heatmap-group" --viewport-size "390,980" http://localhost:8080?v=013 tmp\app-dashboard-mobile-v3.png
npx playwright screenshot --full-page --wait-for-selector "#attackDefenseChart svg" --viewport-size "1440,1200" http://localhost:8080?v=013 tmp\app-dashboard-desktop-v3.png
```

### Resultados verificados

* El cache conserva 48 equipos, 1.248 jugadores, 104 partidos y 2 partidos
  finalizados.
* La app local responde HTTP 200 en `http://localhost:8080`.
* Capturas verificadas:
  `tmp/app-dashboard-desktop-v3.png` y `tmp/app-dashboard-mobile-v3.png`.
* Commit publicado: `9cc2218 feat: mejorar tablero didactico y filtros laterales`.
* URL publica verificada con cache-busting:
  `https://diegomezapy.github.io/copa_mundial_probabilidades/?v=9cc2218`
  respondio HTTP 200 con HTML de 10.771 bytes.
* GitHub Pages API reporto estado `built`.
* Captura publica verificada:
  `tmp/app-public-dashboard.png`, esperando selector `#groupHeatmap .heatmap-group`.
* GAS recibio `clasp push -f` y creo version `2`.
* Deployment GAS v0.1.1 candidato:
  `AKfycbx2vDDgNbCRhpaZV3ouT1Tk2gbEg6zSXxjR9JQzIV8e2cgxKq-Z62b4v31g7JBcVuq_UQ`.

### Pruebas realizadas

* `node --check`: correcto.
* `py_compile`: correcto.
* `git diff --check`: sin errores.
* Playwright espero selectores reales de datos antes de capturar.
* `Invoke-WebRequest` a Pages publica: HTTP 200.
* Prueba anonima GAS v0.1.1 `/exec?action=health`: `403 Prohibido`.

### Errores o incidentes

* Una captura movil inicial se tomo antes de terminar la carga del JSON; se
  repitio usando `--wait-for-selector`.
* Se detecto que los botones de grupos en movil quedaban demasiado altos al
  pasar a una sola columna; se mantuvo grilla compacta de cuatro columnas.
* El nuevo deployment GAS sigue sin acceso anonimo real, igual que v0.1.0.

### Soluciones aplicadas

* Panel lateral operativo con botones persistentes.
* Dashboard visual con graficos propios sin dependencias externas.
* Cache PWA actualizado a `mundial-probabilidades-v0-1-1`.

### Pendientes

* Mantener pendiente la autorizacion anonima real del Web App GAS.

### Riesgos

* GitHub Actions volvera a generar el cache y puede crear un commit automatico
  posterior a la publicacion manual.
* La app sigue usando fallback JSON publico mientras GAS responda 403 anonimo.

### Recomendaciones

* Incorporar al manual maestro el patron "panel lateral + mapa de probabilidad +
  tarjetas didacticas" para apps academicas de modelos estadisticos.

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
* Tras recibir un nuevo token con scope `workflow`, se agrego el workflow activo
  `.github/workflows/update-data.yml`.
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
* El token nuevo del portapapeles fue verificado por API con scopes `repo`,
  `workflow` y `write:packages`; no se imprimio ni se guardo en archivos.

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
* Luego de contar con token `workflow`, se restauro el archivo activo en
  `.github/workflows/update-data.yml`.

### Pendientes

* Publicar commit en GitHub.
* Activar GitHub Pages en rama `main` raiz.
* Verificar primera ejecucion de GitHub Actions una vez publicado el workflow.
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
