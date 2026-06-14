# Manual de usuario

## Proposito

La app permite explorar probabilidades de resultados de la Copa Mundial 2026 a
partir de datos abiertos y un modelo bayesiano explicable.

## Vistas

- Resumen: favoritos relativos y tablas por grupo.
- Equipos: rating, ataque, defensa, plantel y probabilidad de avance.
- Jugadores: planteles con posicion, edad, caps, goles y club.
- Partidos: calendario, resultados y probabilidades 1-X-2.
- Mapa: grupos, partidos y etapas del torneo como nodos rectangulares.
- Evidencia: historia por pais, Copa, partidos, mano a mano y goleadores.
- Modelo: laboratorio para comparar dos equipos.
- Acertá: pronosticos propios, puntaje, aciertos, fallas y evolucion.
- Autores: autoria, colaboracion y perfiles academicos editables.
- Visitas: vista administrativa con perfil registrado y estadisticas locales de uso.
- Referencias: derechos de uso de datos, fuentes y paginas de interes.
- Auditoria: fuentes, version de datos y estado del backend.

## Modo de lectura

El boton `Vista` de la barra superior cambia el tamano de lectura entre
`Normal`, `Comoda` y `Grande`. La opcion elegida queda guardada en el navegador
para que la app vuelva a abrir con el mismo tamano en ese telefono o equipo.
Use `Vista: grande` si las letras se ven demasiado pequenas en un celular.

## Lectura visual

La pantalla principal muestra una ruta del modelo que ordena el flujo
Datos-Prior-Posterior-Pronostico. El balon del hero rebota y rota dentro de la
cancha visual para representar informacion en movimiento; los trazos de pase y
simbolos estadisticos acompanan esa lectura.

Las tarjetas, tablas y graficos usan colores por grupo para reducir la
dominancia de un solo color y facilitar comparaciones visuales. La tarjeta
`Senal` responde a los filtros activos: equipo, grupo o busqueda.

Las vistas de equipos, jugadores, partidos y evidencia muestran banderas reales
en formato SVG para ayudar a reconocer rapidamente paises y grupos. En
Jugadores, algunas figuras destacadas tienen foto libre verificada; al posar el
cursor o enfocar una fila aparece una tarjeta con datos personales, estadisticas
basicas y la atribucion de la imagen. Cuando no hay una foto libre clara, la app
muestra un avatar para respetar derechos de uso.

En partidos, `Probabilidad 1 / Empate / 2` significa:

- 1: gana el primer equipo listado en la fila;
- Empate: ambos equipos terminan igualados;
- 2: gana el segundo equipo listado.

Los botones `(i)` abren definiciones emergentes para evitar dudas durante la
lectura de tablas, mapas y resultados.

## Mapa

La vista Mapa muestra grupos, partidos y eliminatorias como nodos. Un nodo verde
indica partido finalizado y muestra marcador; un nodo pendiente muestra fecha,
equipos y, cuando existe, la senal probabilistica actual. La vista responde a
los filtros activos de grupo, equipo, estado y busqueda.

## Acertá

Cada usuario puede cargar marcadores previstos para partidos pendientes. La app
guarda esos pronosticos en el navegador y, cuando el partido aparece como
finalizado en el JSON publico, calcula:

- 3 puntos por marcador exacto;
- 1 punto por signo correcto;
- 0 puntos por falla.

La vista muestra evolucion personal, aciertos, fallas, reglas de puntaje y una
lista acotada de partidos que respeta los filtros activos. La informacion de
autoria y colaboracion queda en la pestana Autores.
Mientras el backend GAS no este autorizado anonimamente, estos pronosticos son
locales al navegador.

## Autores

La pestana Autores separa los perfiles academicos del espacio de pronosticos.
Incluye el perfil de Diego Bernardo Meza Bogado, su afiliacion en FACEN-UNA,
ORCID y correo, ademas de un resumen academico de Nicolas Vera Ramos como
colaborador en matematica pura, analisis de datos, Python, SQL, machine
learning y visualizacion.

## Registro

La primera entrada solicita usuario, nombre, pais, perfil e institucion. No se
solicita password. El perfil queda guardado en el navegador para que el mismo
usuario pueda volver a ingresar sin credenciales.

El registro es una puerta educativa de personalizacion y trazabilidad local, no
un mecanismo de seguridad fuerte. Si se usa otro dispositivo o navegador, se
debe registrar el usuario nuevamente.

Los detalles de `Visitas` y `Auditoria` solo se muestran a las cuentas
administrativas configuradas por el proyecto. Para usuarios comunes, la app
mantiene la experiencia publica y redirige esas vistas a `Resumen`.

## Filtros

El panel lateral permite combinar:

- grupo 2026;
- pais/equipo;
- estado de partidos;
- Copa historica;
- posicion de jugadores;
- busqueda por texto para paises, jugadores, sedes o rondas.

En escritorio, el panel lateral tiene desplazamiento interno para acceder a
todos los filtros sin cambiar el zoom del navegador. En movil, la app usa
tipografia mas grande, botones tactiles, filtros menos comprimidos y tablas con
desplazamiento horizontal para no depender del zoom del navegador. Los filtros
quedan debajo del contenido principal.

## Lectura prudente

Las probabilidades son estimaciones educativas. Cambian cuando se actualizan
resultados o planteles. No deben interpretarse como certeza ni como consejo de
apuestas.

## Referencias y derechos

La vista Referencias enlaza las fuentes consultadas y recuerda que las marcas,
datos y contenidos de terceros pertenecen a sus titulares. Antes de reutilizar
datos fuera de actividades academicas se deben revisar las condiciones de uso de
cada fuente enlazada.

## Uso offline

Despues de una primera carga, el navegador conserva la app y el ultimo JSON en
cache. Si no hay conexion, se puede consultar la ultima version disponible.
