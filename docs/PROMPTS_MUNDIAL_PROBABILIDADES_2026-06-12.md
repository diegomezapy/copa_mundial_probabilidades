# Secuencia de prompts - Mundial Probabilidades

Ultima edicion: 2026-06-12

## Prompt inicial del proyecto

El usuario solicito crear una app web publica en el repositorio
`diegomezapy/copa_mundial_probabilidades.git` para reunir datos disponibles de
equipos y jugadores de la Copa del Mundo 2026, actualizar automaticamente
resultados y recalcular estimaciones mediante modelos bayesianos. El objetivo
declarado es academico, orientado a estudiantes de estadistica y comprension de
modelos multivariados de pronostico y modelos bayesianos.

## Recursos indicados por el usuario

- Carpeta Drive:
  `https://drive.google.com/drive/folders/1GD7861rXIMcNjZIs4OsJo1sqTt87ELDj?usp=sharing`
- Hoja online:
  `https://docs.google.com/spreadsheets/d/1k_zmucPFA9A7pyE7Y6ZZgb-c4K3UTlp6YknpovCv5pQ/edit?usp=sharing`
- Proyecto GAS:
  `https://script.google.com/u/0/home/projects/1semVUDI4jp8NNzACeFPBoDOSZ0KuHM-MJlLFBrFtWaaDpfL1ByUN9iq9/edit`

## Decisiones tomadas en la primera intervencion

- Arquitectura GitHub Pages + JSON publico + GAS + Google Sheets.
- Datos abiertos reproducibles sin tokens en frontend.
- Modelo Gamma-Poisson como MVP bayesiano explicable.
- PWA con cache offline para consulta.
- GAS preparado para sincronizar JSON desde GitHub hacia Sheets.

## Solicitudes posteriores

- Agregar panel lateral de filtros y tablero estadistico mas atractivo y
  didactico para estudiantes y ninos.
- Enriquecer la app con evidencia historica, estadisticas filtrables por pais,
  Copas pasadas, jugadores y otras fuentes de interes.
- Solicitar registro inicial de cada usuario, permitir ingreso posterior sin
  password, mostrar estadisticas de visitas y mantener una seccion permanente
  de referencias, derechos de uso de datos y paginas de interes.
- Mejorar orden, modernidad y animaciones; incorporar efectos que emulen el
  movimiento del balon y hagan la app mas atractiva.
- Permitir que los usuarios anoten sus propios aciertos, vean evolucion de
  aciertos y fallas, agregar vista `Acerta de los autores` con perfiles de
  Diego Gomez Apy y Nicolas Vera, y sumar simbolos estadisticos animados.
- Corregir el efecto del balon porque parecia un boton moviendose y reemplazarlo
  por una animacion inspirada en una pelota con velocidad, rebote y repintado.
