# Instrucciones para crear imagenes con GPT online

## Objetivo

Crear un set visual coherente para la app publica **Copa Mundial 2026 -
Probabilidades Bayesianas**, orientada a estudiantes de estadistica, docentes,
ninos y publico general. Las imagenes deben hacer que la app se vea moderna,
didactica y emocionante, sin perder rigor academico.

Estas instrucciones estan pensadas para pegarlas en GPT online con herramienta
de creacion de imagenes. Generar las imagenes una por una, revisar cada salida y
descargar solo las versiones que cumplan los criterios de aceptacion.

## Integracion realizada en la app

En la version `0.2.10`, las imagenes generadas desde
`G:\Mi unidad\MUNDIAL_PROBABILIDADES\imagenes` fueron normalizadas e integradas
en `assets/img/generated/`. Como el entorno local no tenia conversor WebP, los
fondos e ilustraciones se publicaron como JPEG optimizados y la pelota/icono se
mantuvieron en PNG.

Archivos publicados:

```text
assets/img/generated/hero-bayes-football-1920x1080.jpg
assets/img/generated/ball-realistic-transparent-1024.png
assets/img/generated/stat-symbols-motion-1600x900.jpg
assets/img/generated/bayes-model-flow-1600x900.jpg
assets/img/generated/tournament-nodes-map-1600x900.jpg
assets/img/generated/player-country-cards-1600x900.jpg
assets/img/generated/classroom-football-statistics-1600x900.jpg
assets/img/generated/open-data-references-1200x800.jpg
assets/img/generated/empty-state-data-loading-1200x800.jpg
assets/img/generated/section-soft-ball-data-1200x800.jpg
assets/img/generated/app-icon-1024.png
```

Los metadatos de origen y uso quedaron registrados en:

```text
assets/img/generated/GENERATED_IMAGES_MANIFEST.md
```

## Reglas de derechos y uso

- No usar logos oficiales de FIFA, Copa Mundial, federaciones, clubes, marcas
  deportivas, patrocinadores ni mascotas oficiales.
- No generar rostros reconocibles de jugadores reales, entrenadores reales o
  personas publicas.
- No copiar estilos de marcas conocidas ni de videojuegos especificos.
- Usar futbol como concepto generico: pelota, cancha, publico abstracto,
  banderas genericas, datos, nodos, probabilidades y simbolos estadisticos.
- No incluir texto dentro de las imagenes, salvo que se pida explicitamente. El
  texto final debe quedar en HTML/CSS para que sea legible y traducible.
- Si se genera una imagen con banderas, deben ser banderas nacionales simples,
  sin escudos federativos ni marcas.
- Registrar para cada archivo: fecha de generacion, prompt usado, herramienta y
  observaciones de uso.

## Estilo visual general

Direccion de arte:

- Moderno, academico, deportivo y didactico.
- Debe sentirse como una app educativa de datos, no como una app de apuestas.
- Combinar energia de futbol con claridad de tablero estadistico.
- Usar colores variados por grupos: azul, rojo, amarillo, verde, violeta,
  turquesa, coral, lima, naranja, cian y magenta suave.
- Evitar hegemonia del verde. El verde puede aparecer como cancha, pero no debe
  dominar toda la composicion.
- Incluir simbolos estadisticos en movimiento o sugeridos visualmente:
  distribuciones, nodos, intervalos, barras, puntos, matrices, lineas de
  simulacion, curvas y pequenos glifos matematicos.
- Mantener contraste alto y espacio libre para que la interfaz coloque texto
  encima sin saturacion.
- Preferir luz, profundidad, movimiento y capas limpias.
- No usar estilos oscuros pesados ni fondos excesivamente cargados.

## Prompt maestro para GPT online

Pegar este prompt antes de pedir cada imagen:

```text
Actua como director de arte senior para una app web academica publica sobre
probabilidades bayesianas de un torneo mundial de futbol 2026. Necesito imagenes
modernas, didacticas, limpias y emocionantes para estudiantes de estadistica y
ninos. No uses logos oficiales de FIFA, federaciones, clubes, marcas, sponsors,
mascotas oficiales ni rostros reconocibles de jugadores reales. No incluyas
texto legible dentro de la imagen. Debe verse como una experiencia educativa de
datos, no como una app de apuestas. Usa futbol generico, cancha, pelota,
simbolos estadisticos, nodos, probabilidades, curvas, intervalos y energia de
movimiento. Paleta variada, no dominada por verde. Composicion clara, con zonas
de respiro para superponer UI. Genera una imagen pulida, profesional,
compatible con una app web responsive.
```

## Set de imagenes requerido

### 1. Hero principal

Archivo sugerido: `assets/img/generated/hero-bayes-football-1920x1080.webp`

Formato: WebP o PNG, 1920 x 1080, sin texto.

Prompt:

```text
Crear un fondo hero horizontal 16:9 para una app academica de probabilidades
bayesianas del futbol mundial 2026. Vista inmersiva de una cancha moderna con
una pelota en movimiento, lineas luminosas de trayectoria, nodos de simulacion,
curvas de distribucion, pequenos puntos tipo Monte Carlo y paneles abstractos de
datos flotando. Debe haber espacio limpio en el tercio izquierdo para colocar
titulo y botones. Paleta variada con verde cancha moderado, azul, coral,
amarillo, violeta y cian. Estilo premium, educativo, optimista y moderno. Sin
logos, sin marcas, sin texto, sin personas reconocibles.
```

Criterios de aceptacion:

- Debe funcionar como fondo de portada.
- No debe tapar el texto del hero.
- La pelota debe parecer pelota de futbol, no boton o esfera generica.
- Debe comunicar estadistica y futbol al primer vistazo.

### 2. Pelota animable con transparencia

Archivo sugerido: `assets/img/generated/ball-realistic-transparent-1024.png`

Formato: PNG con fondo transparente, 1024 x 1024.

Prompt:

```text
Crear una pelota de futbol generica, realista pero ligeramente estilizada para
una app web educativa. Debe tener paneles claros, sombras suaves, volumen,
detalle suficiente y apariencia de pelota real en movimiento. Fondo totalmente
transparente. Sin logos, sin marcas, sin texto, sin escudos. La pelota debe
verse bien entre 48 px y 220 px, con borde limpio para animarla con CSS o canvas.
```

Criterios de aceptacion:

- Fondo realmente transparente.
- No debe parecer boton, ficha o icono plano.
- Debe tener luz y sombra que ayuden a simular rotacion.

### 3. Fondo de simbolos estadisticos

Archivo sugerido: `assets/img/generated/stat-symbols-motion-1600x900.webp`

Formato: WebP o PNG, 1600 x 900.

Prompt:

```text
Crear un fondo abstracto educativo con simbolos estadisticos y bayesianos en
movimiento sugerido: curvas suaves, puntos de simulacion Monte Carlo, matrices,
intervalos creibles, nodos conectados, barras pequenas y trayectorias de pelota.
Debe ser luminoso, moderno, limpio y apto para fondo de seccion. Sin texto
legible, sin formulas largas, sin logos. Paleta variada con azul, cian, coral,
amarillo y violeta, con verde solo como acento. Mucho espacio visual y contraste
suave para que encima se lean tarjetas y tablas.
```

Criterios de aceptacion:

- Debe aportar dinamismo sin competir con tablas.
- Los simbolos no deben parecer ruido ilegible.

### 4. Ilustracion didactica del modelo bayesiano

Archivo sugerido: `assets/img/generated/bayes-model-flow-1600x900.webp`

Formato: WebP o PNG, 1600 x 900, sin texto.

Prompt:

```text
Crear una ilustracion conceptual sin texto sobre un modelo bayesiano para
pronosticar partidos de futbol. Mostrar flujo visual: datos historicos,
planteles, resultados recientes, distribucion previa, actualizacion posterior,
simulacion y probabilidad final, todo con iconos abstractos, nodos y flechas
visuales sin palabras. Debe verse academico, claro, moderno y amigable para
estudiantes. Incluir una cancha sutil y una pelota pequena como hilo conductor.
Sin logos, sin marcas, sin rostros, sin texto.
```

Criterios de aceptacion:

- Debe sugerir proceso y aprendizaje.
- Debe tener espacios donde la app pueda superponer etiquetas reales.

### 5. Mapa visual de grupos y eliminatorias

Archivo sugerido: `assets/img/generated/tournament-nodes-map-1600x900.webp`

Formato: WebP o PNG, 1600 x 900.

Prompt:

```text
Crear una imagen de apoyo para una vista de mapa de torneo: grupos, partidos y
etapas conectadas por nodos rectangulares, como un tablero de datos deportivo.
Los nodos deben verse vacios o abstractos, sin texto, con algunos estados
visuales: pendiente, estimado, completado. Incluir lineas de conexion, pequenos
brillos de avance y una pelota sutil recorriendo el diagrama. Estilo moderno,
limpio, academico, con paleta variada por grupos. Sin logos, sin marcas, sin
texto legible.
```

Criterios de aceptacion:

- Debe parecer un mapa de avance, no una llave de apuestas.
- Los rectangulos deben inspirar la UI de nodos ya existente.

### 6. Imagen para fichas de jugadores y paises

Archivo sugerido: `assets/img/generated/player-country-cards-1600x900.webp`

Formato: WebP o PNG, 1600 x 900.

Prompt:

```text
Crear una composicion para una seccion de fichas de paises y jugadores de futbol
en una app educativa. Mostrar tarjetas abstractas con siluetas genericas de
jugadores, banderas nacionales simples sin escudos, pequenas estadisticas
visuales, barras, puntos y mapas minimos. No mostrar rostros reconocibles ni
jugadores reales. Sin texto legible, sin logos, sin marcas. Estilo claro,
amigable, moderno y apto para ninos y estudiantes.
```

Criterios de aceptacion:

- Debe reforzar exploracion por pais/jugador.
- Las figuras humanas deben ser genericas.

### 7. Imagen para aula y estudiantes

Archivo sugerido: `assets/img/generated/classroom-football-statistics-1600x900.webp`

Formato: WebP o PNG, 1600 x 900.

Prompt:

```text
Crear una escena educativa moderna y calida: estudiantes diversos mirando una
pantalla grande con una cancha de futbol abstracta, nodos, probabilidades y
graficos estadisticos. Debe comunicar aprendizaje, curiosidad y ciencia de
datos. Personas genericas, sin rostros hiperrealistas identificables. Sin texto
legible, sin logos, sin marcas. Paleta luminosa y variada, ambiente academico
pero divertido.
```

Criterios de aceptacion:

- Debe ser inclusiva, didactica y no infantilizar en exceso.
- No debe parecer publicidad comercial.

### 8. Imagen para referencias y derechos de uso

Archivo sugerido: `assets/img/generated/open-data-references-1200x800.webp`

Formato: WebP o PNG, 1200 x 800.

Prompt:

```text
Crear una ilustracion limpia sobre datos abiertos, referencias academicas y
derechos de uso en una app de futbol y estadistica. Mostrar documentos
abstractos, enlaces, base de datos, nube, sello de verificacion generico, cancha
pequena y simbolos estadisticos. Sin texto legible, sin logos, sin marcas.
Estilo institucional, confiable, moderno y claro.
```

Criterios de aceptacion:

- Debe comunicar trazabilidad y respeto por fuentes.
- No debe incluir sellos oficiales falsos.

### 9. Imagen de estado vacio o carga de datos

Archivo sugerido: `assets/img/generated/empty-state-data-loading-1200x800.webp`

Formato: WebP o PNG, 1200 x 800.

Prompt:

```text
Crear una imagen para estado vacio o carga de datos de una app academica de
futbol y probabilidades. Mostrar una pelota descansando cerca de pequenos nodos
de datos, barras suaves y una cancha abstracta, como si el modelo estuviera
esperando nuevos resultados. Debe ser clara, amable, moderna, con mucho espacio
en blanco. Sin texto, sin logos, sin marcas.
```

Criterios de aceptacion:

- Debe ser util para mensajes de "sin datos" o "cargando".
- Debe ser liviana visualmente.

### 10. Icono de app / PWA

Archivo sugerido: `assets/img/generated/app-icon-1024.png`

Formato: PNG, 1024 x 1024.

Prompt:

```text
Crear un icono cuadrado para una PWA educativa de probabilidades bayesianas del
futbol mundial. Debe combinar una pelota generica, una pequena curva de
distribucion y nodos de datos. Estilo simple, memorable, moderno, con buen
contraste en tamanos pequenos. Sin texto, sin logos oficiales, sin marcas, sin
escudos. Fondo limpio con paleta variada, no dominada por verde.
```

Criterios de aceptacion:

- Debe leerse bien en 64 px.
- Debe poder recortarse en mascara circular o squircle.

## Instrucciones de exportacion

Solicitar a GPT:

```text
Entrega la imagen en alta resolucion. No agregues texto ni marcas de agua. Si
puedes, deja fondo transparente solo en los archivos que lo piden explicitamente.
Mantén la composicion limpia y apta para web responsive.
```

Luego guardar los archivos en:

```text
assets/img/generated/
```

Nombres esperados:

```text
hero-bayes-football-1920x1080.webp
ball-realistic-transparent-1024.png
stat-symbols-motion-1600x900.webp
bayes-model-flow-1600x900.webp
tournament-nodes-map-1600x900.webp
player-country-cards-1600x900.webp
classroom-football-statistics-1600x900.webp
open-data-references-1200x800.webp
empty-state-data-loading-1200x800.webp
app-icon-1024.png
```

## Registro recomendado de metadatos

Crear o actualizar:

```text
assets/img/generated/GENERATED_IMAGES_MANIFEST.md
```

Con esta estructura:

```text
## nombre-del-archivo.ext

- Fecha:
- Herramienta:
- Prompt usado:
- Uso previsto:
- Restricciones revisadas:
- Observaciones:
```

## Checklist de aceptacion antes de integrar

- La imagen no contiene logos, marcas, escudos, sponsors ni texto ilegible.
- No aparecen jugadores reales ni rostros identificables.
- La pelota parece una pelota de futbol, no un boton.
- La imagen no se ve como publicidad de apuestas.
- La paleta no esta dominada por verde.
- Hay espacio visual para superponer elementos de UI.
- En movil no genera ruido ni reduce legibilidad.
- El archivo esta optimizado para web.
- Existe registro de prompt y fecha.

## Prompt final para pedir revision al mismo GPT

Despues de generar cada imagen, pedir:

```text
Evalua criticamente esta imagen para uso en una app academica publica sobre
probabilidades bayesianas de futbol. Indica si viola alguna restriccion de
derechos, si contiene logos o texto, si puede confundirse con apuestas, si se
veria bien en movil y si mantiene espacio suficiente para UI. Si falla algun
criterio, propone una version corregida.
```
