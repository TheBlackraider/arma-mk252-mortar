# Requerimientos Refinados: ui-redesign-indirect-fire

## Contexto

**Proyecto:** arma-mk252-mortar — Calculadora de fuego mortero MK252 para ARMA 3  
**Stack:** React 18, JavaScript puro, Jest 29, useReducer  
**Rama base:** `feature/bugfix-and-improvements` (PR #1)  
**Nueva rama:** `feature/ui-redesign-indirect-fire`  
**Fecha de análisis:** 2026-03-13

La feature anterior (`bugfix-and-improvements`) completó el motor de cálculo balístico con:
- `calculateAllCharges` / `getRecommendedCharge` / `validateMissionInput` / `findBaseCharge` (interpolación lineal)
- Estado: `{ misiones[], index, alturaPropiaActual, resultadoActual, azimuthActual, tiempoActual, resultadosActuales }`
- 68 tests, cobertura 100% en `main.reducer.js`

Esta feature añade: rediseño visual (dashboard moderno), corrección del bug de Recalcular, operaciones CRUD sobre misiones, y un nuevo flujo de fuego indirecto por observador con triangulación geométrica en mils NATO.

---

## Decisiones tomadas

| # | Decisión | Razón |
|---|----------|-------|
| D-01 | `RECALCULATE_ITEM` modifica `misiones[key]` en su posición (buscar por `item.key`) sin incrementar `index` | Corrige el bug actual donde Recalcular añadía una misión nueva al array |
| D-02 | `DELETE_ITEM` filtra `misiones` eliminando el item cuyo `key` coincide con `action.payload.key` | Operación de eliminación puntual sin afectar el resto del historial |
| D-03 | `CLEAR_TABLE` resetea `misiones: []` y también `resultadosActuales: null` para reflejar estado limpio | Limpieza total del historial y del panel de resultados |
| D-04 | `triangulateObserver(params)` es una función pura exportada en `main.reducer.js` | Consistente con el patrón del proyecto: funciones puras exportadas y testeadas unitariamente |
| D-05 | El campo `tipoFuego: 'directo' \| 'indirecto'` se añade a la entidad `Mision` con valor por defecto `'directo'` | Permite distinguir en la tabla qué filas provienen de fuego indirecto (badge "INDIRECTO") |
| D-06 | El selector de munición en `InputForm` se controla con `state.resultadosActuales !== null` (ya existe en estado) | No requiere nuevo estado; reusa la señal de "primer cálculo realizado" ya disponible |
| D-07 | Los ángulos del fuego indirecto van en mils NATO (0–6400). Conversión: `mils × π/3200` → rad; `rad × 3200/π mod 6400` → mils | Coherente con el sistema de rumbo ya usado en toda la app |
| D-08 | El formulario de fuego indirecto rellena automáticamente los campos de distancia y rumbo del formulario principal y lanza el cálculo sin intervención adicional del usuario | UX fluida: el observador introduce sus datos y la app calcula directamente |
| D-09 | El CSS sigue los design tokens del `design-spec.md` que generará `ui-inspector` en paralelo. El Hito 2 (UI) depende de que ese archivo esté disponible | Gap conocido y aceptado: si `design-spec.md` no está disponible al llegar al Hito 2, TDD-Dev debe notificar al Orchestrator |
| D-10 | `RECALCULATE_ITEM` NO actualiza `resultadosActuales` ni `resultadoActual` del estado raíz — solo modifica la fila en `misiones[]` | Evita sobreescribir el panel de resultados principal con el recálculo de una fila del historial |

---

## Casos de uso

### UC-01: Calcular misión directa (flujo existente mejorado)
**Actor:** Artillero  
**Precondición:** Formulario principal visible  
**Flujo principal:**
1. El artillero introduce: alturaPropia, denominación, distancia, altura, rumbo
2. El selector de munición está **deshabilitado** (aún no hay cálculo previo: `resultadosActuales === null`)
3. El artillero pulsa "Calcular"
4. El reducer ejecuta `validateMissionInput` → válido
5. El reducer ejecuta `calculateAllCharges` y determina la carga recomendada
6. El selector de munición se **habilita** y se pre-selecciona con la carga recomendada
7. El panel `ChargeResultsPanel` muestra las tres cargas
8. La misión se añade a `misiones[]` con `tipoFuego: 'directo'`
**Flujos alternativos:**
- unhappy: distancia fuera de 50–4050m → `validateMissionInput` retorna inválido → state sin cambios, selector sigue deshabilitado si es la primera vez
- edge: primer cálculo con distancia válida → selector pasa de deshabilitado a habilitado
**Postcondición:** `state.misiones[]` tiene una entrada nueva; `state.resultadosActuales !== null`

### UC-02: Recalcular misión existente en tabla
**Actor:** Artillero  
**Precondición:** Existen misiones en `state.misiones[]`  
**Flujo principal:**
1. El artillero modifica algún campo de una fila (alturaPropia, munición, distancia, altura, rumbo)
2. El artillero pulsa "Recalcular" en esa fila
3. La app despacha `RECALCULATE_ITEM` con los nuevos valores y el `key` original
4. El reducer localiza la misión por `key` en `misiones[]` y la reemplaza con el nuevo cálculo
5. La fila se actualiza en la misma posición; el `index` no cambia
**Flujos alternativos:**
- unhappy: datos inválidos (distancia fuera de rango) → state sin cambios, fila permanece igual
- edge: key no existe en `misiones[]` → state sin cambios (return state)
**Postcondición:** `state.misiones[pos]` actualizado; número total de misiones sin cambio

### UC-03: Borrar misión individual
**Actor:** Artillero  
**Precondición:** Existen misiones en `state.misiones[]`  
**Flujo principal:**
1. El artillero pulsa "Borrar" en una fila de la tabla
2. La app despacha `DELETE_ITEM` con el `key` de esa fila
3. El reducer filtra `misiones[]` eliminando el item con ese `key`
4. La tabla muestra una fila menos
**Flujos alternativos:**
- edge: key no existe → state sin cambios
**Postcondición:** `state.misiones[]` tiene un elemento menos; `index` sin cambio

### UC-04: Borrar toda la tabla
**Actor:** Artillero  
**Precondición:** Existen misiones en `state.misiones[]`  
**Flujo principal:**
1. El artillero pulsa "Borrar todo" en la cabecera/footer de la tabla
2. La app despacha `CLEAR_TABLE`
3. El reducer resetea `misiones: []` y `resultadosActuales: null`
4. La tabla queda vacía; el panel de resultados desaparece
**Flujos alternativos:**
- edge: tabla ya vacía → state sin cambios (misiones sigue siendo `[]`)
**Postcondición:** `state.misiones === []`, `state.resultadosActuales === null`

### UC-05: Calcular misión de fuego indirecto por observador
**Actor:** Artillero con observador avanzado  
**Precondición:** Formulario principal visible  
**Flujo principal:**
1. El artillero abre/expande la sección "Fuego Indirecto por Observador"
2. Introduce los cuatro parámetros:
   - `d_mo`: distancia mortero→observador (metros, 1–9999)
   - `rumbo_mo`: rumbo mortero→observador (mils, 0–6400)
   - `d_oo`: distancia observador→objetivo (metros, 1–9999)
   - `rumbo_relativo_oo`: rumbo relativo observador→objetivo (mils, 0–6400)
3. Pulsa "Calcular Fuego Indirecto"
4. La app ejecuta `triangulateObserver({ d_mo, rumbo_mo, d_oo, rumbo_relativo_oo })`
5. `triangulateObserver` retorna `{ distancia, rumbo }` (mortero→objetivo)
6. Los campos distancia y rumbo del formulario principal se rellenan automáticamente
7. Se lanza automáticamente el cálculo (equivalente a pulsar "Calcular")
8. La misión se añade a `misiones[]` con `tipoFuego: 'indirecto'`
9. La fila en la tabla muestra el badge "INDIRECTO"
**Flujos alternativos:**
- unhappy: algún parámetro fuera de rango → formulario muestra error, no se lanza el cálculo
- unhappy: la distancia triangulada resultante cae fuera de 50–4050m → `validateMissionInput` rechaza, fila no añadida
- edge: `rumbo_absoluto_oo = rumbo_mo + rumbo_relativo_oo > 6400` → se aplica módulo 6400
- edge: distancia resultante = 0 (observador y objetivo en misma posición) → `validateMissionInput` rechaza (< 50m)
**Postcondición:** `state.misiones[]` tiene nueva entrada con `tipoFuego: 'indirecto'`

### UC-06: Visualizar historial con badge INDIRECTO
**Actor:** Artillero  
**Precondición:** Al menos una misión con `tipoFuego: 'indirecto'` en historial  
**Flujo principal:**
1. La tabla muestra todas las misiones
2. Las filas con `tipoFuego: 'indirecto'` muestran badge visual "INDIRECTO" diferenciado
3. Las filas con `tipoFuego: 'directo'` no muestran badge adicional
**Postcondición:** Sin cambio de estado; solo visual

---

## Condiciones de aceptación

- **CA-01:** El selector de munición en el formulario principal está deshabilitado cuando `state.resultadosActuales === null`
- **CA-02:** El selector se habilita y pre-selecciona la carga recomendada cuando `state.resultadosActuales !== null`
- **CA-03:** `RECALCULATE_ITEM` actualiza la misión existente por `key` en su posición; el array no crece
- **CA-04:** `RECALCULATE_ITEM` con datos inválidos no modifica el estado
- **CA-05:** `RECALCULATE_ITEM` con `key` inexistente no modifica el estado
- **CA-06:** `DELETE_ITEM` elimina exactamente la misión con el `key` dado; el resto permanece
- **CA-07:** `CLEAR_TABLE` produce `state.misiones === []` y `state.resultadosActuales === null`
- **CA-08:** `triangulateObserver({ d_mo: 400, rumbo_mo: 1600, d_oo: 300, rumbo_relativo_oo: 800 })` retorna `distancia ≈ 500m` y `rumbo ≈ 2170 mils` (±5 mils de tolerancia)
- **CA-09:** `triangulateObserver` aplica módulo 6400 al rumbo absoluto del observador→objetivo antes de calcular
- **CA-10:** Las filas con `tipoFuego: 'indirecto'` muestran el badge "INDIRECTO" en la tabla
- **CA-11:** Las filas con `tipoFuego: 'directo'` (o sin campo) no muestran badge
- **CA-12:** La nueva entidad `Mision` tiene campo `tipoFuego` con valor por defecto `'directo'`
- **CA-13:** Las acciones `DELETE_ITEM`, `CLEAR_TABLE`, `RECALCULATE_ITEM` están exportadas en `main.actions.js`
- **CA-14:** Todos los tests existentes (68) siguen en verde tras todos los cambios

---

## Preguntas y respuestas del usuario

| # | Pregunta | Respuesta | Impacto |
|---|----------|-----------|---------|
| Q-01 | ¿El formulario de fuego indirecto también requiere denominación de objetivo? | No especificado → se asume que hereda la denominación del formulario principal | El campo `denominacion` del formulario principal se usa para la misión de fuego indirecto |
| Q-02 | ¿`RECALCULATE_ITEM` actualiza `resultadosActuales` del estado raíz? | No — solo modifica la fila en `misiones[]` (D-10) | Simplifica el reducer; el panel de resultados solo refleja el último cálculo directo |
| Q-03 | ¿Validación de los inputs del formulario indirecto (rangos)? | `d_mo` y `d_oo` deben ser > 0; rumbos 0–6400 mils. La distancia calculada se valida con `validateMissionInput` | Se reutiliza `validateMissionInput` tras la triangulación |
| Q-04 | ¿El CSS del Hito 2 depende de `design-spec.md`? | Sí — `ui-inspector` lo genera en paralelo. Si no está disponible, TDD-Dev bloquea y notifica | Dependencia externa explícita entre Hito 2 y `ui-inspector` |
| Q-05 | ¿`alturaPropia` y `altura` del formulario indirecto provienen del formulario principal? | Sí — se reusan los valores del formulario principal | No hay campos de alturas duplicados en el formulario indirecto |

---

## Dependencias

- **`feature/bugfix-and-improvements`** — rama base; todo el motor balístico ya funcional
- **`ui-inspector` (paralelo)** — genera `design-spec.md` con los design tokens para el Hito 2
- **`main.reducer.js`** — se extiende con 3 nuevos cases y 1 nueva función pura (`triangulateObserver`)
- **`main.actions.js`** — se extiende con 3 nuevas constantes y 3 nuevos action creators
- **`mision.entity.js`** — se extiende con campo `tipoFuego`
- **`Table.js` / `TableRow.js`** — se modifican para botones borrar y badge INDIRECTO
- **`InputForm.js`** — se modifica para selector deshabilitado + formulario fuego indirecto
