# Plan de Implementación: ui-redesign-indirect-fire

**Proyecto:** arma-mk252-mortar  
**Rama:** `feature/ui-redesign-indirect-fire` (base: `feature/bugfix-and-improvements`)  
**Fecha:** 2026-03-13  
**Tests base:** 68 (todos deben seguir en verde al finalizar cada hito)

---

## Decisiones Arquitecturales

| # | Decisión | Alternativa descartada | Razón |
|---|----------|----------------------|-------|
| 1 | `RECALCULATE_ITEM` reemplaza la misión en `misiones[pos]` buscando por `item.key` (map sobre el array) | Añadir nueva misión (comportamiento actual — bug) | El usuario espera que la fila se actualice in-place; el array no debe crecer al recalcular |
| 2 | `DELETE_ITEM` usa `filter` sobre `misiones[]` por `key`; no decrementa `index` | Usar `splice` o resetear el array | `filter` es la operación inmutable estándar en useReducer; el `index` es un contador monotónico para unicidad de keys |
| 3 | `CLEAR_TABLE` resetea `misiones: []` y `resultadosActuales: null` simultáneamente | Solo resetear `misiones` | Si se borra toda la tabla, el panel de resultados del último cálculo debe desaparecer también |
| 4 | `triangulateObserver(params)` es función pura exportada en `main.reducer.js` | Archivo separado `indirect-fire.js` | Coherente con el patrón existente: todas las funciones puras del dominio balístico viven en `main.reducer.js` |
| 5 | Campo `tipoFuego: 'directo' \| 'indirecto'` añadido a la entidad `Mision` con default `'directo'` | Flag booleano `esIndirecto` | Más expresivo; permite extensibilidad futura (ej. `'observacion-aerea'`) |
| 6 | El selector de munición del formulario principal se controla con `disabled={!state.resultadosActuales}` | Nuevo campo de estado `selectorHabilitado` | Reutiliza señal existente sin añadir estado redundante |
| 7 | El formulario indirecto NO tiene campos propios de alturaPropia/altura — hereda del formulario principal | Duplicar campos de altura | Evita inconsistencias: la configuración del arma ya está en el formulario principal |
| 8 | El Hito 2 (UI Redesign) depende de `design-spec.md` de `ui-inspector`; si no está disponible, TDD-Dev bloquea | Proceder con CSS provisional | El rediseño debe ser coherente con el spec oficial para evitar retrabajos |
| 9 | `RECALCULATE_ITEM` NO actualiza `resultadosActuales` ni `resultadoActual` del estado raíz | Actualizar panel principal al recalcular fila | Evita confusión: el panel principal refleja solo el último cálculo del formulario, no de filas históricas |

---

## Hito 1: Reducer — nuevas acciones y lógica de fuego indirecto

**Dependencia:** ninguna (solo sobre estado actual de `feature/bugfix-and-improvements`)

**Archivos:**
- `src/lib/main.actions.js` (modificar)
- `src/lib/main.reducer.js` (modificar)
- `src/data/mision.entity.js` (modificar)
- `src/lib/main.reducer.test.js` (modificar — añadir tests)

**Componentes:**

### `main.actions.js`
```
RECALCULATE_ITEM: string — constante de acción
DELETE_ITEM: string — constante de acción
CLEAR_TABLE: string — constante de acción
recalculateItem(item): Action — creator; payload = item (debe incluir item.key)
deleteItem(key): Action — creator; payload = { key }
clearTable(): Action — creator; sin payload
```
- Exportar junto a las existentes (`GET_ALL_ITEMS`, `CALCULATE_ITEM`, `getAllItems`, `calculateItem`)

### `mision.entity.js`
```
Mision.DEFAULT_VALUES.tipoFuego: 'directo' — nuevo campo en defaults
constructor: asigna this.tipoFuego = config.tipoFuego (string, sin parseo numérico)
```

### `main.reducer.js` — nueva función pura
```
triangulateObserver({ d_mo, rumbo_mo, d_oo, rumbo_relativo_oo }): { distancia: number, rumbo: number }
```
- Convierte `rumbo_mo` a radianes: `rumbo_mo * Math.PI / 3200`
- Calcula posición del observador relativa al mortero:
  - `ox = d_mo * Math.sin(rumbo_mo_rad)` (componente Este)
  - `oy = d_mo * Math.cos(rumbo_mo_rad)` (componente Norte)
- Calcula `rumbo_absoluto_oo = (rumbo_mo + rumbo_relativo_oo) % 6400`
- Convierte `rumbo_absoluto_oo` a radianes
- Calcula posición del objetivo relativa al mortero:
  - `tx = ox + d_oo * Math.sin(rumbo_abs_rad)`
  - `ty = oy + d_oo * Math.cos(rumbo_abs_rad)`
- `distancia = Math.round(Math.sqrt(tx² + ty²))`
- `rumbo_rad = Math.atan2(tx, ty)` → si negativo sumar `2 * Math.PI`
- `rumbo = Math.round((rumbo_rad * 3200 / Math.PI) % 6400)`; si resultado < 0 sumar 6400
- Retorna `{ distancia, rumbo }`

### `main.reducer.js` — nuevo case `RECALCULATE_ITEM`
```
case RECALCULATE_ITEM:
  - Ejecutar validateMissionInput(action.payload) → si inválido, return state
  - Buscar municionIndex = municionTypes.indexOf(action.payload.municion)
  - Si municionIndex === -1, return state
  - Crear item = new Mision(action.payload); item.azimuth = item.rumbo * AZIMUTH_MULTIPLIER
  - result = calculateMission(item, municionIndex, chargeTables[municionIndex], municionTypes)
  - Preservar tipoFuego original de la misión encontrada
  - Reemplazar en misiones: state.misiones.map(m => m.key === item.key ? { ...result, tipoFuego: originalTipoFuego } : m)
  - return { ...state, misiones: newMisiones }
  - NO modificar resultadoActual, azimuthActual, tiempoActual, resultadosActuales
```

### `main.reducer.js` — nuevo case `DELETE_ITEM`
```
case DELETE_ITEM:
  - newMisiones = state.misiones.filter(m => m.key !== action.payload.key)
  - return { ...state, misiones: newMisiones }
```

### `main.reducer.js` — nuevo case `CLEAR_TABLE`
```
case CLEAR_TABLE:
  - return { ...state, misiones: [], resultadosActuales: null }
```

**Tests esperados (añadir a `main.reducer.test.js`):**

*triangulateObserver:*
- `should calculate correct distance and heading for orthogonal observer-target (d_mo:400, rumbo_mo:1600, d_oo:300, rumbo_relativo_oo:800) → distancia≈500m, rumbo≈2170mils`
- `should return distancia=0 when observer and target are in same position (d_mo:100, rumbo_mo:0, d_oo:100, rumbo_relativo_oo:3200)`
- `should wrap rumbo_absoluto_oo modulo 6400 when sum exceeds 6400`
- `should return rumbo 0 when target is due North of mortar`
- `should return rumbo 1600 when target is due East of mortar`
- `should handle rumbo_relativo_oo = 0 (observer and target on same bearing from mortar)`

*RECALCULATE_ITEM:*
- `should update existing mission in place without growing misiones array`
- `should preserve tipoFuego of original mission when recalculating`
- `should not modify state when recalculate payload is invalid`
- `should not modify state when key does not exist in misiones`
- `should not modify resultadosActuales when recalculating a row`
- `should update mission at correct position when multiple missions exist`

*DELETE_ITEM:*
- `should remove mission with matching key from misiones`
- `should not modify state when key does not exist`
- `should not decrement index when deleting a mission`
- `should remove only the targeted mission when multiple missions exist`

*CLEAR_TABLE:*
- `should reset misiones to empty array`
- `should set resultadosActuales to null`
- `should not modify other state fields (index, resultadoActual, etc.)`
- `should be idempotent when table is already empty`

*mision.entity.js:*
- `should have tipoFuego default value of 'directo'`
- `should preserve tipoFuego when passed in constructor data`

**Criterio de completado:** todos los tests pasan (`npm test` en verde), cobertura 100% de las líneas nuevas en `main.reducer.js`, `main.actions.js` y `mision.entity.js`

**Estado:** COMPLETADO  
**Commit:** `3c82c48` — feat: añadir RECALCULATE_ITEM, DELETE_ITEM, CLEAR_TABLE y triangulateObserver  
**Fecha:** 2026-03-13

---

## Hito 2: UI Redesign — CSS global y componentes estilizados

**Dependencia:** Hito 1 completado + `design-spec.md` disponible (generado por `ui-inspector`)

> ⚠️ **BLOQUEANTE EXTERNO:** Si `doc/features/ui-redesign-indirect-fire/design-spec.md` no existe al iniciar este hito, TDD-Dev debe notificar al Orchestrator y suspender el hito hasta que esté disponible.

**Archivos:**
- `src/index.css` (modificar — variables CSS globales / design tokens)
- `src/App.css` (modificar — layout raíz)
- `src/organisms/InputForm/InputForm.css` (modificar — panel principal y cards)
- `src/molecules/Table/Table.css` (modificar — tabla limpia con sombras)
- `src/App.js` (posible modificar — estructura semántica si necesario)

**Componentes / Tokens CSS:**

Los tokens exactos provienen de `design-spec.md`. La estructura mínima esperada en `index.css`:
```css
:root {
  --color-primary: <azul del spec>;
  --color-accent: <verde del spec>;
  --color-surface: <fondo card del spec>;
  --color-surface-secondary: <fondo secundario>;
  --color-text-primary: <texto principal>;
  --color-text-muted: <texto secundario>;
  --color-border: <borde>;
  --color-danger: <rojo para borrar>;
  --shadow-card: <sombra del spec>;
  --radius-card: <border-radius>;
  --spacing-sm: <espacio pequeño>;
  --spacing-md: <espacio medio>;
  --spacing-lg: <espacio grande>;
}
```

**Tests esperados (RTL/DOM — `InputForm.test.js` o similar):**
- `should render the main container with app layout class`
- `should apply card styling class to the form panel`
- `should apply table styling class to the history table`

> Nota: Los tests de CSS son de estructura DOM (clases presentes), no tests visuales. No se requiere screenshot testing.

**Criterio de completado:** `npm test` en verde (los 68 + tests del Hito 1 + tests del Hito 2 todos pasan); la app se ve con el nuevo estilo al ejecutar `npm start`

---

## Hito 3: Selector de munición deshabilitado + control pre-selección

**Dependencia:** Hito 1 completado (Hito 2 puede estar en paralelo — no hay dependencia de CSS)

**Archivos:**
- `src/organisms/InputForm/InputForm.js` (modificar)
- `src/organisms/InputForm/InputForm.test.js` (nuevo o modificar)

**Componentes:**

### `InputForm.js` — control del selector
```
<SelectBox
  name="municion"
  label="Municion"
  placeholder="Tipo de municion"
  options={optionsMunicion}
  value={municion}
  onChange={setMunicion}
  disabled={!state.resultadosActuales}   ← NUEVO
/>
```

La lógica de pre-selección ya existe en el `useEffect` sobre `state.resultadosActuales`. Verificar que funciona correctamente:
```javascript
useEffect(() => {
  if (!state.resultadosActuales) return;
  const recomendada = Object.keys(state.resultadosActuales)
    .find(charge => state.resultadosActuales[charge].recomendada);
  if (recomendada) setMunicion(recomendada);
}, [state.resultadosActuales]);
```

### `SelectBox.js` — verificar que acepta prop `disabled`
- Si `SelectBox` no acepta `disabled`, modificarlo para que lo propague al `<select>` nativo
- Ruta probable: `src/molecules/SelectBox/SelectBox.js`

**Tests esperados:**
- `should render municion selector as disabled when resultadosActuales is null`
- `should render municion selector as enabled when resultadosActuales is not null`
- `should pre-select recommended charge when resultadosActuales changes`
- `should show 'ch0' as default when no calculation has been done` (verificar valor inicial)

**Criterio de completado:** `npm test` en verde; el selector visualmente deshabilitado antes del primer cálculo

---

## Hito 4: Botones borrar fila y borrar tabla

**Dependencia:** Hito 1 completado (acciones ya disponibles)

**Archivos:**
- `src/molecules/Table/TableRow.js` (modificar)
- `src/molecules/Table/Table.js` (modificar)
- `src/molecules/Table/Table.test.js` (nuevo o modificar)

**Componentes:**

### `TableRow.js` — cambio de comportamiento del botón Recalcular + botón Borrar
```javascript
// Botón Recalcular: cambiar dispatch de calculateItem → recalculateItem
import { recalculateItem, deleteItem } from "../../lib/main.actions";

const handleRecalculate = (event) => {
  event.preventDefault();
  const itemChanged = { key: item.key, alturaPropia, denominacion, municion, distancia, altura, rumbo };
  dispatcher(recalculateItem(itemChanged));
}

const handleDelete = (event) => {
  event.preventDefault();
  dispatcher(deleteItem(item.key));
}
```

JSX de la fila:
```jsx
<td>
  <button onClick={handleRecalculate}>Recalcular</button>
  <button onClick={handleDelete} className="btn-danger">Borrar</button>
</td>
```

### `Table.js` — botón "Borrar todo"
```javascript
import { clearTable } from "../../lib/main.actions";

// En el componente Table, recibe dispatcher como prop (ya existe)
const handleClearAll = () => dispatcher(clearTable());

// En el JSX, añadir en thead o tfoot:
<tfoot>
  <tr>
    <td colSpan={10}>
      <button onClick={handleClearAll} className="btn-danger-outline">Borrar todo</button>
    </td>
  </tr>
</tfoot>
```

**Tests esperados:**
- `TableRow: should dispatch recalculateItem (not calculateItem) when Recalcular button is clicked`
- `TableRow: should dispatch deleteItem with correct key when Borrar button is clicked`
- `Table: should render Borrar todo button`
- `Table: should dispatch clearTable when Borrar todo is clicked`
- `Table: should render Borrar button in each row`

**Criterio de completado:** `npm test` en verde; el botón Recalcular ya no añade nuevas filas; el botón Borrar elimina la fila; "Borrar todo" vacía la tabla

**Estado:** COMPLETADO  
**Commit:** `065b043` — feat: add delete row and clear table buttons (Hito 4)  
**Fecha:** 2026-03-13

---

## Hito 5: Formulario fuego indirecto + triangulación + badge INDIRECTO

**Dependencia:** Hito 1 completado (triangulateObserver disponible), Hito 3 completado (formulario principal estabilizado)

**Archivos:**
- `src/organisms/InputForm/InputForm.js` (modificar — añadir formulario indirecto)
- `src/organisms/InputForm/IndirectFireForm.js` (nuevo — formulario extraído como componente)
- `src/organisms/InputForm/InputForm.css` (modificar — estilos del formulario indirecto)
- `src/molecules/Table/TableRow.js` (modificar — badge INDIRECTO)
- `src/molecules/Table/Table.js` (modificar — columna tipo en cabecera)
- `src/organisms/InputForm/IndirectFireForm.test.js` (nuevo)

**Componentes:**

### `IndirectFireForm.js` — nuevo componente
```javascript
IndirectFireForm({ onCalculate }): JSX
// Props:
//   onCalculate({ d_mo, rumbo_mo, d_oo, rumbo_relativo_oo, denominacion, alturaPropia, altura }): void
// Estado local:
//   [d_mo, setDMo] = useState(0)
//   [rumbo_mo, setRumboMo] = useState(0)
//   [d_oo, setDOo] = useState(0)
//   [rumbo_relativo_oo, setRumboRelativoOo] = useState(0)
// Validación local antes de llamar onCalculate:
//   d_mo > 0, d_oo > 0, rumbo_mo 0–6400, rumbo_relativo_oo 0–6400
//   Si inválido: mostrar mensaje de error en el propio formulario, no llamar onCalculate
```

### `InputForm.js` — integración del formulario indirecto
```javascript
// Nuevo handler:
const handleIndirectCalculate = ({ d_mo, rumbo_mo, d_oo, rumbo_relativo_oo }) => {
  const { distancia: distTriangulada, rumbo: rumboTriangulado } =
    triangulateObserver({ d_mo, rumbo_mo, d_oo, rumbo_relativo_oo });
  
  // Rellenar campos del formulario principal (para visualización)
  setDistancia(distTriangulada);
  setRumbo(rumboTriangulado);
  
  // Disparar cálculo con tipoFuego = 'indirecto'
  const item = {
    alturaPropia,
    denominacion,
    municion,            // usa la munición actualmente seleccionada
    distancia: distTriangulada,
    altura,
    rumbo: rumboTriangulado,
    tipoFuego: 'indirecto',
  };
  dispatch(calculateItem(item));
};
```

> Nota: `calculateItem` existente se reutiliza. El campo `tipoFuego: 'indirecto'` en el payload hace que `new Mision(action.payload)` lo recoja gracias al cambio en el Hito 1 de `mision.entity.js`.

### `TableRow.js` — badge INDIRECTO
```jsx
// En el JSX de la fila, añadir columna o cell de tipo:
<td>
  {item.tipoFuego === 'indirecto' && (
    <span className="badge-indirecto">INDIRECTO</span>
  )}
</td>
```

### `Table.js` — columna Tipo en cabecera
```jsx
<th>Tipo</th>  // nueva columna en thead
```

### CSS — `.badge-indirecto`
```css
.badge-indirecto {
  background-color: var(--color-accent);  /* azul-verde del spec */
  color: white;
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}
```

**Tests esperados:**

*IndirectFireForm:*
- `should render all four input fields`
- `should render Calcular Fuego Indirecto button`
- `should call onCalculate with correct params when form is submitted with valid data`
- `should not call onCalculate when d_mo is 0`
- `should not call onCalculate when d_oo is 0`
- `should show error message when distances are invalid`

*InputForm (integración del flujo indirecto):*
- `should dispatch calculateItem with tipoFuego indirecto when indirect form is submitted`
- `should set distancia and rumbo fields from triangulation result`

*TableRow (badge):*
- `should render INDIRECTO badge when item.tipoFuego is indirecto`
- `should not render INDIRECTO badge when item.tipoFuego is directo`
- `should not render INDIRECTO badge when item.tipoFuego is undefined`

*Table (columna):*
- `should render Tipo column header`

**Criterio de completado:** `npm test` en verde; la app permite calcular fuego indirecto completo; el badge aparece en la tabla; la triangulación del ejemplo CA-08 produce resultados correctos

---

## Resumen de hitos

| Hito | Nombre | Tests nuevos estimados | Dependencias |
|------|--------|----------------------|--------------|
| 1 | Reducer — nuevas acciones + triangulateObserver | ~22 | ninguna |
| 2 | UI Redesign — CSS global + tokens | ~3 | Hito 1 + design-spec.md |
| 3 | Selector munición deshabilitado | ~4 | Hito 1 |
| 4 | Botones borrar fila y tabla | ~5 | Hito 1 |
| 5 | Formulario fuego indirecto + badge | ~12 | Hito 1, Hito 3 |

**Total tests nuevos estimados:** ~46  
**Total tests tras completar todos los hitos:** ~114 (68 base + 46 nuevos)
