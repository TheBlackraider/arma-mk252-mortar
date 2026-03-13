# QA Report: bugfix-and-improvements
**Fecha:** 2026-03-12
**Iteración:** 2 (re-evaluación tras análisis de blockers)

## Resultado: PASSED

## Resumen Ejecutivo
| Categoria | Estado | Detalles |
|---|---|---|
| Tests unitarios | PASSED | 68/68 tests pasaron. |
| Cobertura `main.reducer.js` | PASSED | 100% Stmts / Branch / Funcs / Lines. |
| Cobertura global | PASSED | 92.73% Stmts. |
| Análisis estático | WARNING | 2 funciones exceden 20 líneas (ver detalles). |
| Vulnerabilidades HIGH | INFO | 23 vulns en dependencias transitivas de `react-scripts` (build/dev tools, no runtime). |

---

## Casos de uso cubiertos por tests

| UC | Descripción | Cubierto por | Estado |
|---|---|---|---|
| UC-01 | Configurar Jest | `npm test` exitoso | PASSED |
| UC-02 | Calcular y ver elevación | `InputForm.test.js` | PASSED |
| UC-03 | Calcular tiempo de vuelo correcto | `main.reducer.test.js` | PASSED |
| UC-04 | Ver las 3 cargas y recomendación | `main.reducer.test.js`, `InputForm.test.js` | PASSED |
| UC-05 | Validar inputs del formulario | `main.reducer.test.js` | PASSED |
| UC-06 | Ver historial con columna Tiempo | `Table.test.js`, `TableRow.test.js` | PASSED |
| UC-07 | Recalcular misión del historial | No cubierto (fuera de scope de esta feature) | INFO |
| UC-08 | Eliminar console.log | `main.reducer.test.js` | PASSED |

---

## Aclaraciones sobre blockers de Iteración 1

### BLOCKER 1 resuelto — `timeOfFlight` Charge0 a 300m

**Veredicto del Orchestrator:** No era un bug de código. Explicación:
- El valor `13.5s` en `Charge0.js` es **correcto** y fue verificado contra la imagen de la tabla balística original del MK252 en el Hito 0.
- El `CA-04` del `refined-requirements.md` decía erróneamente `1.5s` — ese valor corresponde a `timeOfFlightPer100m`, no a `timeOfFlight`.
- **Acción tomada:** `CA-04` corregido a `tiempo === 13.5` en `refined-requirements.md`. Código y tests permanecen sin cambios.

### BLOCKER 2 reclasificado → INFO — Vulnerabilidades npm audit

**Veredicto del Orchestrator:** Las 23 vulnerabilidades HIGH son todas en dependencias transitivas de `react-scripts` (herramientas de build/transpilación: babel, jsdom, jest@27 interno de react-scripts). Contexto:
- Aplicación de uso **local** (calculadora de juego ARMA 3)
- Sin servidor web expuesto ni procesamiento de input externo no confiable
- Las vulnerabilidades son en tooling de desarrollo, no en código de producción ejecutado en el browser
- Clasificación: **deuda técnica INFO**, no blocker

---

## WARNINGS (Deuda Técnica)

### W1 — Funciones con más de 20 líneas (KISS)
- `findBaseCharge` — 31 líneas. Complejidad inherente a la interpolación lineal con bordes y 4 campos interpolados. Refactorizar introduciría más complejidad, no menos.
- `mainReducer` case `CALCULATE_ITEM` — 26 líneas. Incluye validación + cálculo + construcción de estado de retorno. Aceptado.
- **Decisión:** Mantener como está. Complejidad justificada por dominio.

### W2 — API de testing deprecada
- `ReactDOMTestUtils.act` genera warnings en consola de tests.
- Origen: `@testing-library/react@13.4.0` con React 18 (incompatibilidad conocida del paquete, no del código del proyecto).
- **Decisión:** INFO. Resoluble actualizando `@testing-library/react` a v14+, fuera de scope.

---

## INFO (Deuda Técnica Registrada)

| # | Descripción | Prioridad sugerida |
|---|---|---|
| I-1 | 23 vulnerabilidades HIGH en deps transitivas de react-scripts | Baja (uso local) |
| I-2 | UC-07 sin cobertura de test (flujo recalcular desde historial) | Media (feature futura) |
| I-3 | `@testing-library/react` v13 — deprecation warnings en tests RTL | Baja |

---

## Análisis estático
- **Console.log/error en producción:** 0 (eliminados en Hito 4)
- **ESLint:** No configurado (INFO — no bloquea)
- **Funciones > 20 líneas:** 2 (ver W1 — aceptadas)
- **Clases > 200 líneas:** 0

---

## Veredicto

**PASSED** — 68/68 tests en verde, cobertura 100% en `main.reducer.js`, todos los casos de uso críticos cubiertos. Los 2 blockers de Iteración 1 han sido resueltos: uno por corrección documental (CA-04), otro por reclasificación justificada por contexto de uso. Deuda técnica registrada en KB para trazabilidad.
