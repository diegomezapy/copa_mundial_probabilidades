# Manual tecnico

## Objetivo

Construir una app web publica, reproducible y auditable para visualizar datos y
pronosticos bayesianos de la Copa Mundial 2026.

## Componentes

| Componente | Archivo o servicio | Funcion |
| --- | --- | --- |
| Frontend | `index.html`, `assets/` | Interfaz publica GitHub Pages |
| Cache publico | `data/worldcup2026_latest.json` | Datos normalizados y pronosticos |
| Generador | `scripts/update_data.py` | Descarga, normaliza y recalcula |
| Backend | `gas/*.gs` | Sincroniza JSON con Google Sheets y sirve JSONP |
| Planilla | Google Sheets | Auditoria, respaldo y consulta operativa |
| Automatizacion | `.github/workflows/update-data.yml` | Regeneracion cada 6 horas |

## Flujo de datos

1. `scripts/update_data.py` descarga calendario/resultados desde OpenFootball.
2. El script descarga planteles desde la pagina estructurada de squads.
3. Se calculan parametros posteriores Gamma-Poisson por equipo.
4. Se simula el avance de grupos y se genera `worldcup2026_latest.json`.
5. GitHub Pages consume el JSON.
6. GAS puede ejecutar `syncFromGithub()` para copiar el mismo estado a Sheets.

## Validaciones minimas

```powershell
python scripts\update_data.py
python -m py_compile scripts\update_data.py scripts\make_assets.py
python -m http.server 8080
```

Luego verificar en navegador:

- carga de `index.html`;
- conteos de 48 equipos, 1.248 jugadores y 104 partidos;
- filtros de grupo/equipo;
- vista offline despues de primera carga;
- estado del backend GAS si se configura endpoint.

## Seguridad

No se publican tokens ni credenciales en el frontend. La vista publica solo lee
JSON abierto. Las acciones de sincronizacion sobre Sheets deben ejecutarse desde
Apps Script autorizado o con token administrativo guardado en Script Properties.

