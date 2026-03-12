# Plan de Implementación: bugfix-and-improvements

**Rama:** `feature/bugfix-and-improvements` (desde `main`)  
**Stack:** React 18, JavaScript (sin TypeScript), Jest 29, babel-jest  
**Arquitectura:** useReducer + funciones puras exportadas

---

## Decisiones Arquitecturales

| # | Decisión | Alternativa descartada | Razón |
|---|----------|----------------------|-------|
| 1 | Usar `base.timeOfFlight` directamente de la tabla | Calcular `timeOfFlightPer100m × (distancia/100)` | Los valores de `timeOfFlightPer100m` en Charge0 (14.3) son absurdos como multiplicador; `timeOfFlight` es el valor real del tiempo de vuelo |
| 2 | Calcular las 3 cargas simultáneamente en el reducer con `calculateAllCharges` | Calcular solo la carga seleccionada y añadir un selector de "mostrar todas" | El usuario necesita comparar las 3 opciones en cada cálculo; el coste computacional es trivial |
| 3 | `calculateAllCharges` es una función pura exportada que retorna `{ ch0, ch1, ch2 }` | Inline la lógica en el reducer | Permite testear la función independientemente; mantiene el reducer limpio |
| 4 | `getOptimalCharge` se reemplaza por `getRecommendedCharge(distance, chargeTables)` que busca el menor `timeOfFlight` entre las cargas en rango efectivo (empate: mayor número de carga) | Criterio por rangos fijos (Ch0 ≤450m, Ch1 ≤1950m, Ch2 ≤4050m) | Las cargas tienen tiempos de vuelo distintos a la misma distancia (ej: 300m → Ch0=1.5s, Ch1=0.7s, Ch2=0.5s); el menor tiempo de vuelo reduce la exposición del proyectil y es la métrica tácticamente relevante | **[REVISADO — cambio de requerimiento]** |
| 5 | `getChargeForDistance` se elimina (código muerto con rangos erróneos 400/1500) | Actualizar sus rangos y mantenerla | No se llama en ningún lugar; sus rangos erróneos ya quedaron corregidos en `getRecommendedCharge` |
| 6 | `validateMissionInput(item)` como función pura en el reducer | Validación en el componente InputForm | Mantiene la lógica de negocio en el reducer; el componente solo es presentación |
| 7 | Añadir `tiempoActual` y `resultadosActuales` al estado del reducer | Calcular en el componente a partir de `misiones` | El estado es la fuente de verdad; el componente solo lee |
| 8 | Jest 29 + `@babel/preset-react` instalados como devDependencies locales | Mantener jest@27 / usar npx | `npm test` debe funcionar con binario local; jest@27 tiene incompatibilidades con las versiones actuales de node |

---

## Hito 1: Fix configuración Jest

**Estado:** COMPLETADO  
**Commit:** `fa52e8e` — chore: actualizar jest@29 y babel-jest@29 para npm test local  
**Fecha:** 2026-03-12  

**Dependencia:** ninguna  
**Descripción:** Actualizar jest a v29, añadir @babel/preset-react, verificar que `npm test` lanza los 16 tests existentes en verde.

**Archivos:**
- `package.json` (modificar)
- `babel.config.js` (modificar)

**Componentes:**

_package.json — cambios en devDependencies:_
```
"jest": "^29.7.0"
"@babel/preset-react": "^7.0.0"
"babel-jest": "^29.7.0"
```

_babel.config.js — añadir preset-react:_
```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
```

_jest.config.js — añadir transformIgnorePatterns para módulos ESM si fuera necesario_ (verificar tras instalar).

**Tests esperados:**
- Los 16 tests existentes en `main.reducer.test.js` y `mision.entity.test.js` pasan con `npm test`
- No se añaden tests nuevos en este hito; el criterio es "0 fallos en suite existente"

**Criterio de completado:** `npm test` sale con código 0; todos los tests existentes en verde; sin "jest: command not found"

---

## Hito 2: Fix BUG-02 — timeOfFlight correcto

**Estado:** COMPLETADO  
**Commit:** `0eb5548` — fix: corregir cálculo de tiempo de vuelo usando timeOfFlight directo de tabla  
**Fecha:** 2026-03-12  

**Dependencia:** Hito 1  
**Descripción:** Corregir `calculateMission` para usar `base.timeOfFlight` en lugar de la fórmula incorrecta. Añadir tests que cubran el bug corregido.

**Archivos:**
- `src/lib/main.reducer.js` (modificar)
- `src/lib/main.reducer.test.js` (modificar)

**Componentes:**

`calculateMission(item, municionIndex, chargeTable, municionTypes)` — modificar línea del `tiempo`:
```js
// ANTES (incorrecto):
tiempo: base.timeOfFlightPer100m * (item.distancia / 100),
// DESPUÉS (correcto):
tiempo: base.timeOfFlight,
```

**Tests esperados:**
- `should return timeOfFlight directly from table when calculating mission` — Charge0 a 300m → `tiempo === 1.5`
- `should return timeOfFlight directly from table for Charge1 at 1000m` — `tiempo === 0.7`
- `should return timeOfFlight directly from table for Charge2 at 2000m` — `tiempo === 0.8`
- El test existente `calculateMission calculates mission correctly with elevation difference` — **actualizar** el mock para incluir `timeOfFlight` y corregir la expectativa de `tiempo` de `0.5` (que era `timeOfFlightPer100m * (100/100)`) a `timeOfFlight` del mock

**Criterio de completado:** `npm test` verde; `resultado.tiempo` es el valor directo de tabla para las 3 cargas

---

## Hito 3: Fix BUG-01 — state.resultadoActual en InputForm + tiempoActual en estado

**Estado:** COMPLETADO  
**Commit:** `a722ff3` — fix: corregir state.resultadoActual en InputForm y añadir tiempoActual al estado  
**Fecha:** 2026-03-12  

**Dependencia:** Hito 2  
**Descripción:** Corregir el `useEffect` de InputForm para leer `state.resultadoActual` (no `state.resultado`). Añadir `tiempoActual` al estado inicial del reducer y al `useEffect`.

**Archivos:**
- `src/organisms/InputForm/InputForm.js` (modificar)
- `src/lib/main.reducer.js` (modificar — añadir `tiempoActual` al estado)
- `src/lib/main.reducer.test.js` (modificar — testear tiempoActual)

**Componentes:**

`initialState` en `main.reducer.js` — añadir campo:
```js
export const initialState = {
    misiones: [],
    index: 1,
    alturaPropiaActual: 0,
    resultadoActual: 0,
    azimuthActual: 0,
    tiempoActual: 0,   // NUEVO
};
```

`mainReducer` case `CALCULATE_ITEM` — añadir `tiempoActual` al retorno:
```js
return {
    ...state,
    resultadoActual: result.resultado,
    azimuthActual: result.azimuth,
    tiempoActual: result.tiempo,    // NUEVO
    misiones: [...state.misiones, result],
    index: state.index + 1,
};
```

`InputForm.js` — corregir `useEffect`:
```js
// ANTES (buggy):
useEffect(() => {
    setResultado(state.resultado);       // campo inexistente
    setAzimuth(state.azimuthActual);
}, [state.resultado, state.azimuthActual]);

// DESPUÉS (correcto):
useEffect(() => {
    setResultado(state.resultadoActual); // campo real
    setAzimuth(state.azimuthActual);
    setTiempo(state.tiempoActual);       // NUEVO
}, [state.resultadoActual, state.azimuthActual, state.tiempoActual]);
```

`InputForm.js` — añadir estado local `tiempo` y mostrarlo:
```js
const [tiempo, setTiempo] = useState(0);
```

**Tests esperados (reducer):**
- `should set tiempoActual in state after CALCULATE_ITEM` — tras dispatch con Ch0 a 300m → `state.tiempoActual === 1.5`
- `should initialize tiempoActual to 0 in initialState`

**Criterio de completado:** `npm test` verde; el resultado de elevación es visible en pantalla en tiempo real tras calcular; `tiempoActual` se actualiza en estado

---

## Hito 4: Fix BUG-03 + BUG-04 + CLEANUP-03

**Dependencia:** Hito 3  
**Descripción:** Añadir `key` prop a `<TableRow>` en Table.js, eliminar 3 console.log/error del reducer, y corregir "mk256" → "mk252" en README.

**Archivos:**
- `src/molecules/Table/Table.js` (modificar — añadir key)
- `src/lib/main.reducer.js` (modificar — eliminar consoles)
- `README.md` (modificar — mk256 → mk252)

**Componentes:**

`Table.js` — añadir `key` al map:
```jsx
// ANTES (buggy):
{state.misiones.map((item) => (
  <TableRow item={item} dispatcher={dispatcher} />
))}

// DESPUÉS (correcto):
{state.misiones.map((item) => (
  <TableRow key={item.key} item={item} dispatcher={dispatcher} />
))}
```

`main.reducer.js` — eliminar las 3 sentencias:
- Línea 70: `console.log("CALCULATE_ITEM action received:", action.payload);`
- Línea 83: `console.error("Invalid munition type selected:", item.municion);`
- Línea 95: `console.log("Calculated result:", result);`

`README.md` — cambiar título y referencias:
```
# Calculadora de fuego Mortero mk256 ARMA3
→
# Calculadora de fuego Mortero mk252 ARMA3
```

**Tests esperados:**
- `should not call console.log when CALCULATE_ITEM is dispatched` — spy sobre console.log, verificar que no se llama
- `should not call console.error for valid municion types` — spy sobre console.error

**Criterio de completado:** `npm test` verde; 0 console.log/error en reducer; sin warning de React por key prop; README corregido

---

## Hito 5: Lógica de cálculo triple + getRecommendedCharge + validación + cleanup huérfanas

**Dependencia:** Hito 4  
**Descripción:** Implementar `calculateAllCharges`, `getRecommendedCharge` (con criterio de tiempo mínimo) y `validateMissionInput`. Eliminar `getChargeForDistance` y `getOptimalCharge`. Integrar todo en el reducer.  
**[REVISADO — cambio de requerimiento: criterio de recomendación por timeOfFlight mínimo, no por rangos fijos]**

**Archivos:**
- `src/lib/main.reducer.js` (modificar — función nueva, eliminar huérfanas, integrar en reducer)
- `src/lib/main.reducer.test.js` (modificar — tests nuevos, eliminar tests de funciones huérfanas)

**Componentes:**

`getRecommendedCharge(distance, chargeTables)` — función pura exportada:
```js
/**
 * Retorna el nombre de la carga recomendada para la distancia dada.
 * Criterio: menor timeOfFlight entre las cargas dentro de su rango efectivo.
 * Empate: se prefiere la carga de mayor número (ch2 > ch1 > ch0).
 *
 * @param {number} distance
 * @param {Array[]} chargeTables - [Charge0, Charge1, Charge2]
 * @returns {'ch0' | 'ch1' | 'ch2'}
 */
export const getRecommendedCharge = (distance, chargeTables) => {
    const chargeNames = ['ch0', 'ch1', 'ch2'];
    const chargeRanges = [
        { min: 50,  max: 450  },
        { min: 150, max: 1950 },
        { min: 300, max: 4050 },
    ];

    let bestCharge = null;
    let bestTime = Infinity;

    // Iterar en orden inverso para que el empate favorezca la carga mayor
    for (let i = chargeNames.length - 1; i >= 0; i--) {
        const { min, max } = chargeRanges[i];
        if (distance < min || distance > max) continue;

        const base = findBaseCharge(chargeTables[i], distance);
        if (base.timeOfFlight < bestTime) {
            bestTime = base.timeOfFlight;
            bestCharge = chargeNames[i];
        }
    }

    return bestCharge;
};
```

> **Nota de implementación:** Se itera en orden inverso (Ch2→Ch1→Ch0) para que cuando dos cargas tengan el mismo `timeOfFlight`, el primero en asignarse sea Ch2 y solo se reemplace si una carga posterior tiene tiempo estrictamente menor. Esto satisface la regla de empate sin lógica adicional.

`validateMissionInput(item)` — función pura exportada (sin cambios respecto al plan anterior):
```js
/**
 * Valida los parámetros de una misión.
 * @param {object} item
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateMissionInput = (item) => {
    const errors = [];
    const distancia = parseInt(item.distancia, 10);
    const rumbo = parseInt(item.rumbo, 10);
    if (isNaN(distancia) || distancia < 50 || distancia > 4050) {
        errors.push('Distancia fuera de rango (50–4050m)');
    }
    if (isNaN(rumbo) || rumbo < 0 || rumbo > 6400) {
        errors.push('Rumbo fuera de rango (0–6400 mils)');
    }
    return { valid: errors.length === 0, errors };
};
```

`calculateAllCharges(item)` — función pura exportada. Ahora llama a `getRecommendedCharge` con `chargeTables`:
```js
/**
 * Calcula elevación, azimuth y tiempo para las 3 cargas.
 * @param {object} item - Mision con alturaPropia, distancia, altura, rumbo
 * @returns {{ ch0: ResultadoCarga, ch1: ResultadoCarga, ch2: ResultadoCarga }}
 * ResultadoCarga = { elevacion, azimuth, tiempo, recomendada: bool, fuera_de_rango: bool }
 */
export const calculateAllCharges = (item) => {
    const municionTypes = ['ch0', 'ch1', 'ch2'];
    const chargeTables = [Charge0, Charge1, Charge2];
    const chargeRanges = [
        { min: 50,  max: 450  },
        { min: 150, max: 1950 },
        { min: 300, max: 4050 },
    ];

    const recommended = getRecommendedCharge(item.distancia, chargeTables);
    const results = {};

    municionTypes.forEach((charge, idx) => {
        const { min, max } = chargeRanges[idx];
        const fueraDeRango = item.distancia < min || item.distancia > max;
        const mission = calculateMission(item, idx, chargeTables[idx], municionTypes);
        results[charge] = {
            elevacion: mission.resultado,
            azimuth:   mission.azimuth,
            tiempo:    mission.tiempo,
            recomendada:   charge === recommended,
            fuera_de_rango: fueraDeRango,
        };
    });

    return results;
};
```

`mainReducer` case `CALCULATE_ITEM` — integrar validación y cálculo triple (sin cambios en la estructura respecto al plan anterior):
```js
case CALCULATE_ITEM: {
    const validation = validateMissionInput(action.payload);
    if (!validation.valid) return state;

    const item = new Mision(action.payload);
    item.key = state.index;
    item.azimuth = item.rumbo * AZIMUTH_MULTIPLIER;

    const municionTypes = ['ch0', 'ch1', 'ch2'];
    const chargeTables  = [Charge0, Charge1, Charge2];
    const selectedChargeIndex = municionTypes.indexOf(item.municion);
    if (selectedChargeIndex === -1) return state;

    const result = calculateMission(item, selectedChargeIndex, chargeTables[selectedChargeIndex], municionTypes);
    const resultadosActuales = calculateAllCharges(item);

    return {
        ...state,
        resultadoActual:    result.resultado,
        azimuthActual:      result.azimuth,
        tiempoActual:       result.tiempo,
        resultadosActuales,
        misiones: [...state.misiones, result],
        index: state.index + 1,
    };
}
```

`initialState` — añadir `resultadosActuales`:
```js
resultadosActuales: null,
```

**Eliminar de `main.reducer.js`:**
- `getChargeForDistance` (función completa)
- `getOptimalCharge` (función completa)

**Tests esperados:**

_getRecommendedCharge (criterio timeOfFlight mínimo):_
- `getRecommendedCharge should return ch2 for distance 300 (ch2 t=0.5 < ch1 t=0.7 < ch0 t=1.5)`
- `getRecommendedCharge should return ch0 for distance 100 (only ch0 in range)`
- `getRecommendedCharge should return ch2 for distance 2000 (only ch2 in range)`
- `getRecommendedCharge should return ch1 for distance 200 (ch0 t=1.4 vs ch1 t=0.7, ch2 out of range)`
- `getRecommendedCharge should prefer higher charge number on timeOfFlight tie`
- `getRecommendedCharge should return ch2 at boundary distance 450 (ch0 max, ch1 and ch2 in range)`
- `getRecommendedCharge should return ch2 at boundary distance 1950 (ch1 max, ch2 still in range)`

_validateMissionInput:_
- `validateMissionInput should return valid for distance 300 and rumbo 1600`
- `validateMissionInput should return invalid for distance 49` (< 50)
- `validateMissionInput should return invalid for distance 4051` (> 4050)
- `validateMissionInput should return invalid for rumbo -1`
- `validateMissionInput should return invalid for rumbo 6401`
- `validateMissionInput should return valid for negative altura` (altura negativa es válida)

_calculateAllCharges:_
- `calculateAllCharges should return 3 results for distance 300`
- `calculateAllCharges should mark ch2 as recomendada for distance 300` (menor tiempo)
- `calculateAllCharges should mark ch0 as recomendada for distance 100` (única en rango)
- `calculateAllCharges should mark ch2 as recomendada for distance 2000` (única en rango)
- `calculateAllCharges should mark ch0 fuera_de_rango=false for distance 300`
- `calculateAllCharges should mark ch2 fuera_de_rango=true for distance 200` (Ch2 mín 300m)
- `calculateAllCharges should mark ch1 fuera_de_rango=true for distance 100` (Ch1 mín 150m)

_mainReducer:_
- `mainReducer should not modify state when distance is out of range (< 50)`
- `mainReducer should not modify state when rumbo is out of range`
- `mainReducer should set resultadosActuales after CALCULATE_ITEM`
- `mainReducer should set recomendada=true on ch2 in resultadosActuales for distance 300`

_Eliminar:_
- Los 3 tests de `getOptimalCharge` (función eliminada)
- Los 3 tests de `getChargeForDistance` (función eliminada)

**Criterio de completado:** `npm test` verde; `getChargeForDistance` y `getOptimalCharge` no existen en el código; `getRecommendedCharge` usa timeOfFlight mínimo; 100% cobertura de las funciones nuevas

---

## Hito 6: UI — etiquetas de resultado + panel de 3 cargas + pre-selección selector

**Estado:** COMPLETADO  
**Commit:** `855a21e` — feat: UI panel de 3 cargas, etiquetas de resultado y pre-selección de carga recomendada  
**Fecha:** 2026-03-12  

**Dependencia:** Hito 5  
**Descripción:** Actualizar `InputForm.js` para mostrar resultados con etiquetas claras, añadir el panel de 3 cargas con la recomendada destacada en sección principal, las otras en rango en sección secundaria, las fuera de rango ocultas con etiqueta, y pre-seleccionar el selector de munición con la carga recomendada.  
**[REVISADO — cambio de requerimiento: estructura UI en dos secciones + pre-selección selector]**

**Archivos:**
- `src/organisms/InputForm/InputForm.js` (modificar)
- `src/organisms/InputForm/InputForm.css` (modificar — añadir clases CSS)

**Componentes:**

`InputForm` — reemplazar `<p>{resultado}</p>` y `<p>{azimuth}</p>` por JSX con etiquetas:
```jsx
<div className="resultado-actual">
  <p><strong>Elevación (mils):</strong> {resultado.toFixed(2)}</p>
  <p><strong>Azimuth (mils):</strong> {azimuth.toFixed(2)}</p>
  <p><strong>Tiempo de vuelo (s):</strong> {tiempo.toFixed(2)}</p>
</div>
```

`InputForm` — añadir `useEffect` para pre-seleccionar el selector de munición con la recomendada:
```js
useEffect(() => {
    if (!state.resultadosActuales) return;
    const recomendada = Object.keys(state.resultadosActuales)
        .find(charge => state.resultadosActuales[charge].recomendada);
    if (recomendada) setMunicion(recomendada);
}, [state.resultadosActuales]);
```

`InputForm` — añadir panel de 3 cargas (solo visible si `state.resultadosActuales !== null`).
La UI se divide en tres zonas bien diferenciadas:

```jsx
{state.resultadosActuales && (() => {
    const cargas = ['ch0', 'ch1', 'ch2'];
    const recomendada  = cargas.find(c => state.resultadosActuales[c].recomendada);
    const enRangoOtras = cargas.filter(c =>
        !state.resultadosActuales[c].recomendada &&
        !state.resultadosActuales[c].fuera_de_rango
    );
    const fueraDeRango = cargas.filter(c => state.resultadosActuales[c].fuera_de_rango);

    return (
        <div className="resultados-cargas">
            <h3>Resultados por carga</h3>

            {/* Sección principal — carga recomendada */}
            {recomendada && (
                <div className="carga-recomendada-principal">
                    <span className="badge-recomendada">RECOMENDADA</span>
                    <span>{recomendada.toUpperCase()}</span>
                    <span>Elev: {state.resultadosActuales[recomendada].elevacion.toFixed(2)} mils</span>
                    <span>Tiempo: {state.resultadosActuales[recomendada].tiempo.toFixed(2)}s</span>
                </div>
            )}

            {/* Sección secundaria — otras cargas en rango */}
            {enRangoOtras.length > 0 && (
                <div className="otras-cargas-en-rango">
                    <h4>Otras opciones en rango</h4>
                    {enRangoOtras.map(charge => (
                        <div key={charge} className="carga-row secundaria">
                            <span>{charge.toUpperCase()}</span>
                            <span>Elev: {state.resultadosActuales[charge].elevacion.toFixed(2)} mils</span>
                            <span>Tiempo: {state.resultadosActuales[charge].tiempo.toFixed(2)}s</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Cargas fuera de rango */}
            {fueraDeRango.map(charge => (
                <div key={charge} className="carga-row fuera-de-rango">
                    <span>{charge.toUpperCase()}</span>
                    <span>FUERA DE RANGO</span>
                </div>
            ))}
        </div>
    );
})()}
```

`InputForm.css` — añadir:
```css
.carga-recomendada-principal {
  background-color: #d4edda;
  font-weight: bold;
  border-left: 4px solid #28a745;
  padding: 8px;
  margin-bottom: 8px;
}
.badge-recomendada {
  color: #28a745;
  margin-right: 8px;
  font-size: 0.8em;
  text-transform: uppercase;
}
.otras-cargas-en-rango {
  margin-top: 8px;
}
.carga-row.secundaria {
  padding: 4px 8px;
  border-left: 2px solid #aaa;
  margin-bottom: 4px;
  font-size: 0.9em;
}
.carga-row.fuera-de-rango {
  color: #999;
  padding: 4px 8px;
  font-style: italic;
}
```

**Tests esperados:**
> Nota: Los tests de componentes React requieren `@testing-library/react`. El paquete ya está en dependencies del proyecto (`@testing-library/react: ^13.4.0`); con jest@29 y `@babel/preset-react` configurado en Hito 1, debe funcionar directamente.

- `InputForm renders Elevación (mils): label in resultado-actual section`
- `InputForm renders Azimuth (mils): label in resultado-actual section`
- `InputForm renders Tiempo de vuelo (s): label in resultado-actual section`
- `InputForm does not render resultados-cargas panel when resultadosActuales is null`
- `InputForm renders carga-recomendada-principal section when resultadosActuales is set`
- `InputForm renders RECOMENDADA badge on the recommended charge`
- `InputForm renders otras-cargas-en-rango section for non-recommended in-range charges`
- `InputForm renders FUERA DE RANGO for out-of-range charges`
- `InputForm pre-selects municion selector with the recommended charge after calculation`

**Criterio de completado:** `npm test` verde; etiquetas visibles en UI; carga recomendada en sección principal; otras en rango en sección secundaria; fuera de rango con etiqueta; selector de munición pre-seleccionado con la recomendada

---

## Hito 7: Columna "Tiempo" en tabla de historial

**Dependencia:** Hito 6  
**Descripción:** Añadir columna `<th>Tiempo</th>` en la cabecera de `Table.js` y celda `<td>{item.tiempo.toFixed(2)}s</td>` en `TableRow.js`.

**Archivos:**
- `src/molecules/Table/Table.js` (modificar)
- `src/molecules/Table/TableRow.js` (modificar)

**Componentes:**

`Table.js` — añadir en `<thead>`:
```jsx
<th>Tiempo (s)</th>
```

`TableRow.js` — añadir en el return:
```jsx
<td>{item.tiempo.toFixed(2)}s</td>
```

El campo `tiempo` ya existe en la entidad `Mision` (campo inicializado a 0). Con el fix de BUG-02 (Hito 2), `item.tiempo` ahora tiene el valor correcto desde `base.timeOfFlight`.

**Tests esperados:**
- `TableRow renders tiempo column with correct format` — `item.tiempo = 1.5` → celda contiene "1.50s"
- `TableRow renders tiempo with 2 decimal places` — `item.tiempo = 0.7` → "0.70s"
- `Table renders Tiempo (s) header column`

**Criterio de completado:** `npm test` verde; la tabla del historial muestra columna Tiempo con formato correcto en todas las misiones

---

## Resumen de tests por hito

| Hito | Tests nuevos | Tests modificados | Tests eliminados |
|------|-------------|-------------------|-----------------|
| 1 — Fix Jest | 0 (solo verificar 16 existentes) | 0 | 0 |
| 2 — Fix timeOfFlight | 3 nuevos | 1 (mock actualizado) | 0 |
| 3 — Fix BUG-01 + tiempoActual | 2 nuevos | 1 (CALCULATE_ITEM) | 0 |
| 4 — BUG-03/04/CLEANUP-03 | 2 nuevos | 0 | 0 |
| 5 — Lógica triple + cleanup **[REVISADO]** | ~24 nuevos | 1 (CALCULATE_ITEM) | 6 (huérfanas) |
| 6 — UI 3 cargas **[REVISADO]** | ~9 nuevos | 0 | 0 |
| 7 — Columna Tiempo | 3 nuevos | 0 | 0 |
| **Total** | **~43 nuevos** | **3 modificados** | **6 eliminados** |

---

## Orden de dependencias

```
Hito 1 (Jest)
  └─► Hito 2 (timeOfFlight)
        └─► Hito 3 (BUG-01 + tiempoActual)
              └─► Hito 4 (BUG-03/04/CLEANUP-03)
                    └─► Hito 5 (lógica triple)
                          └─► Hito 6 (UI 3 cargas)
                                └─► Hito 7 (columna Tiempo)
```

Cada hito debe terminar con `npm test` en verde antes de iniciar el siguiente.
