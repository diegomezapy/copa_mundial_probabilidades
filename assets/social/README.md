# Piezas para redes

## `mundial_probabilidades_demo_10s_4fps.gif`

GIF promocional de 10 segundos para compartir la novedad de la app publica
**Copa Mundial 2026 - Probabilidades Bayesianas**.

Caracteristicas:

* Duracion: 10 segundos.
* Velocidad: 4 cuadros por segundo.
* Total: 40 cuadros.
* Tamano: 960 x 540 px.
* Peso aproximado: 2.98 MB.
* Fuente visual: app publica en GitHub Pages.
* Narrativa: portada, datos, filtros, fichas, probabilidades, mapa, evidencia,
  metodologia, pronosticos de usuarios y cierre con enlace.
* Incluye barra de progreso, pelota en movimiento y rotulos breves para redes.

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

El script usa Playwright para capturar la app publica y Pillow para componer el
GIF con rotulos breves de funcionalidades.
