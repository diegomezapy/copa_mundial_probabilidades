# Metodologia bayesiana

## Enfoque

La primera version usa un modelo Gamma-Poisson explicable para fines
academicos. Cada equipo tiene una tasa latente de goles a favor y una tasa
latente de goles concedidos.

## Prior

El prior se deriva de dos fuentes agregadas:

- desempeno historico en mundiales recientes mediante rating tipo Elo;
- experiencia del plantel mediante caps y goles internacionales agregados.

Estas covariables no se presentan como causalidad. Solo ordenan informacion
previa antes de observar los resultados del torneo.

## Likelihood

Los goles observados se tratan como conteos Poisson. Cuando un partido termina,
los goles a favor y en contra actualizan los parametros del equipo.

## Posterior

La media posterior de ataque se calcula como:

```text
(prior_attack_mean * prior_weight + goals_for) / (prior_weight + matches_played)
```

La media posterior de defensa usa la misma estructura con goles concedidos.

## Simulacion

Para estimar avance de grupos se simulan 2.500 torneos de fase de grupos con
los resultados ya observados fijos y los pendientes generados desde las tasas
posteriores.

## Limitaciones

- No se usa feed propietario de eventos en vivo.
- No se modelan minutos, lesiones, alineaciones, clima ni tactica.
- El indice de campeon no simula aun toda la llave eliminatoria.
- Las fuentes abiertas pueden actualizarse con retraso.

## Interpretacion

Usar lenguaje prudente:

- probabilidad estimada;
- senal del modelo;
- incertidumbre;
- supuesto;
- actualizacion posterior.

Evitar presentar el resultado como verdad absoluta.

