# Secuencia de prompts - Mundial Probabilidades - 2026-06-16

## Proyecto

* Nombre: Copa Mundial 2026 - Probabilidades Bayesianas
* Ruta local: `G:\Mi unidad\MUNDIAL_PROBABILIDADES`
* Fecha de edicion: 2026-06-16

## Prompt operativo recibido

El usuario indico que la app no mostraba una figura suficientemente clara para
entender como el modelo bayesiano mejora su cercania con el resultado real a
medida que registra y agrega informacion de los partidos jugados. Tambien
senalo que la app seguia siendo dificil de entender, visualmente cargada y con
elementos repetidos en varias vistas, solicitando resolver esos puntos.

## Respuesta tecnica aplicada

* Se priorizo una figura dinamica en `Inicio` que compara la senal principal
  1-X-2 del modelo contra resultados reales ya observados.
* Se redujo la densidad inicial moviendo mapas, ataque/defensa, aula y tablas a
  un desplegable de analisis detallado.
* Se elimino el carril global repetitivo de la app.
* Se redujo la repeticion visual entre `Comparar` y `Metodologia`.
* Se actualizo version y cache PWA a `0.2.20`.
* Se validaron sintaxis, diff y render visual desktop/movil con Playwright.

## Archivos principales afectados

* `index.html`
* `assets/js/app.js`
* `assets/css/styles.css`
* `assets/js/config.js`
* `service-worker.js`
* `README.md`
* `docs/manual_usuario.md`
* `docs/manual_tecnico.md`
* `BITACORA_MUNDIAL_PROBABILIDADES_COPA2026_APPWEB.md`
