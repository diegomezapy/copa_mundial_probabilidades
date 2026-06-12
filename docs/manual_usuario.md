# Manual de usuario

## Proposito

La app permite explorar probabilidades de resultados de la Copa Mundial 2026 a
partir de datos abiertos y un modelo bayesiano explicable.

## Vistas

- Resumen: favoritos relativos y tablas por grupo.
- Equipos: rating, ataque, defensa, plantel y probabilidad de avance.
- Jugadores: planteles con posicion, edad, caps, goles y club.
- Partidos: calendario, resultados y probabilidades 1-X-2.
- Evidencia: historia por pais, Copa, partidos, mano a mano y goleadores.
- Modelo: laboratorio para comparar dos equipos.
- Acertá: pronosticos propios, puntaje, aciertos, fallas y evolucion.
- Autores: autoria, colaboracion y perfiles academicos editables.
- Visitas: perfil registrado y estadisticas locales de uso.
- Referencias: derechos de uso de datos, fuentes y paginas de interes.
- Auditoria: fuentes, version de datos y estado del backend.

## Lectura visual

La pantalla principal muestra una ruta del modelo que ordena el flujo
Datos-Prior-Posterior-Pronostico. El balon del hero rebota y rota dentro de la
cancha visual para representar informacion en movimiento; los trazos de pase y
simbolos estadisticos acompanan esa lectura.

Las tarjetas, tablas y graficos usan colores por grupo para reducir la
dominancia de un solo color y facilitar comparaciones visuales. La tarjeta
`Senal` responde a los filtros activos: equipo, grupo o busqueda.

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

## Filtros

El panel lateral permite combinar:

- grupo 2026;
- pais/equipo;
- estado de partidos;
- Copa historica;
- posicion de jugadores;
- busqueda por texto para paises, jugadores, sedes o rondas.

En escritorio, el panel lateral tiene desplazamiento interno para acceder a
todos los filtros sin cambiar el zoom del navegador. En movil, los filtros
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
