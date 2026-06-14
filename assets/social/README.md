# Piezas para redes

## `mundial_probabilidades_demo_15s_5fps_suave.gif`

GIF promocional actualizado para compartir la app publica **Copa Mundial 2026 -
Probabilidades Bayesianas** con transiciones mas suaves.

Caracteristicas:

* Duracion: 15 segundos.
* Cuadros: 75 frames a 5 cuadros por segundo.
* Tamano: 960 x 540 px.
* Peso aproximado: 14.81 MB.
* Fuente visual: storyboard local `imagenes/NUEVAS/`.
* Narrativa: portada, recalculo bayesiano, filtros, fichas, probabilidades,
  mapa, evidencia historica, metodologia, pronosticos de usuarios y cierre.
* Transiciones: paneo/zoom suave por escena y fundido corto entre imagenes.
* Uso recomendado: publicaciones donde se prioriza calidad visual y recorrido
  didactico. Para WhatsApp o redes con limite estricto de peso, puede convenir
  convertirlo a video MP4 desde el GIF.

Vista previa estatica:

```text
assets/social/mundial_probabilidades_demo_15s_5fps_suave_preview.jpg
```

URL publica esperada:

```text
https://diegomezapy.github.io/copa_mundial_probabilidades/assets/social/mundial_probabilidades_demo_15s_5fps_suave.gif
```

Regeneracion:

```powershell
python scripts\create_social_gif.py
```

## `mundial_probabilidades_demo_10s_4fps.gif`

GIF promocional de 10 segundos para compartir la novedad de la app publica
**Copa Mundial 2026 - Probabilidades Bayesianas**.

Caracteristicas:

* Duracion: 10 segundos.
* Version storyboard actual: 10 escenas de 1 segundo, optimizadas para redes.
* Fallback por captura: 40 cuadros a 4 cuadros por segundo.
* Tamano: 960 x 540 px.
* Peso aproximado: 2.21 MB.
* Fuente visual: app publica en GitHub Pages.
* Narrativa: portada, datos, filtros, fichas, probabilidades, mapa, evidencia,
  metodologia, pronosticos de usuarios y cierre con enlace.
* La version actual fue regenerada desde el storyboard local
  `imagenes/NUEVAS/`, inspirado en las ideas visuales nuevas.
* Incluye barra de progreso, pelota en movimiento y rotulos breves para redes
  dentro de las escenas fuente.

Vista previa estatica:

```text
assets/social/mundial_probabilidades_demo_10s_4fps_preview.jpg
```

URL publica:

```text
https://diegomezapy.github.io/copa_mundial_probabilidades/assets/social/mundial_probabilidades_demo_10s_4fps.gif
```

Texto sugerido para publicar:

```text
assets/social/TEXTO_DIFUSION_MUNDIAL_PROBABILIDADES.md
```

Regeneracion:

```powershell
python scripts\create_social_gif.py
```

Si existe `imagenes/NUEVAS/`, el script usa esas 10 imagenes como storyboard y
genera 40 cuadros con movimiento suave. Si esa carpeta no existe, usa
Playwright para capturar la app publica y Pillow para componer el GIF con
rotulos breves de funcionalidades.
