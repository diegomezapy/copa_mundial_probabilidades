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

