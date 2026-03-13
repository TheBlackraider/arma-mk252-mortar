# Documentación Técnica: ui-redesign-indirect-fire

## Hito 1: Reducer — nuevas acciones y lógica de fuego indirecto
**Fecha:** 2026-03-13  
**Commit:** `3c82c48`

### Entidades

| Nombre | Tipo | Acción | Archivo | Descripción |
|--------|------|--------|---------|-------------|
| `RECALCULATE_ITEM` | módulo | modificada | `src/lib/main.actions.js` | Constante de acción para recalcular una misión existente en el historial por su `key` |
| `DELETE_ITEM` | módulo | modificada | `src/lib/main.actions.js` | Constante de acción para eliminar una misión del historial por su `key` |
| `CLEAR_TABLE` | módulo | modificada | `src/lib/main.actions.js` | Constante de acción para vaciar el historial completo de misiones |
| `recalculateItem(item)` | función | modificada | `src/lib/main.actions.js` | Action creator; payload = item (debe incluir `item.key`) |
| `deleteItem(key)` | función | modificada | `src/lib/main.actions.js` | Action creator; payload = `{ key }` |
| `clearTable()` | función | modificada | `src/lib/main.actions.js` | Action creator sin payload |
| `Mision.DEFAULT_VALUES.tipoFuego` | tipo/DTO | modificada | `src/data/mision.entity.js` | Nuevo campo con default `'directo'`; admite `'directo'` \| `'indirecto'` |
| `Mision.tipoFuego` | tipo/DTO | modificada | `src/data/mision.entity.js` | Propiedad de instancia asignada desde `config.tipoFuego` sin parseo numérico |
| `triangulateObserver` | función | creada | `src/lib/main.reducer.js` | Función pura que triangula posición del objetivo dados distancia/rumbo mortero↔observador y observador↔objetivo, retorna `{ distancia, rumbo }` en metros y mils NATO |
| `RECALCULATE_ITEM` case en `mainReducer` | módulo | modificada | `src/lib/main.reducer.js` | Actualiza la misión con el `key` dado en `misiones[]` sin añadir filas; preserva `tipoFuego` original |
| `DELETE_ITEM` case en `mainReducer` | módulo | modificada | `src/lib/main.reducer.js` | Filtra `misiones[]` eliminando la entrada con el `key` dado; no modifica `index` |
| `CLEAR_TABLE` case en `mainReducer` | módulo | modificada | `src/lib/main.reducer.js` | Resetea `misiones: []` y `resultadosActuales: null` simultáneamente |

### Diagrama de Clases

```mermaid
classDiagram
    class Mision {
        +key: number
        +alturaPropia: number
        +azimuth: number
        +denominacion: string
        +municion: string
        +distancia: number
        +altura: number
        +resultado: number
        +rumbo: number
        +tiempo: number
        +tipoFuego: string
        +parseNumericValue(value, floor) number
    }

    class mainActions {
        <<module>>
        +GET_ALL_ITEMS: string
        +CALCULATE_ITEM: string
        +RECALCULATE_ITEM: string
        +DELETE_ITEM: string
        +CLEAR_TABLE: string
        +getAllItems() Action
        +calculateItem(item) Action
        +recalculateItem(item) Action
        +deleteItem(key) Action
        +clearTable() Action
    }

    class mainReducer {
        <<module>>
        +initialState: State
        +triangulateObserver(params) Result
        +findBaseCharge(table, dist) Entry
        +validateMissionInput(item) Validation
        +calculateMission(item, idx, table, types) Mission
        +getRecommendedCharge(dist, tables) string
        +calculateAllCharges(item) ChargeResults
        +mainReducer(state, action) State
    }

    mainReducer --> Mision : crea instancias
    mainReducer --> mainActions : importa constantes
```

### Diagrama de Secuencia — RECALCULATE_ITEM

```mermaid
sequenceDiagram
    participant UI
    participant Reducer as mainReducer
    participant Mision
    participant CalcFn as calculateMission

    UI->>Reducer: dispatch(recalculateItem(payload))
    Reducer->>Reducer: validateMissionInput(payload)
    alt inválido
        Reducer-->>UI: return state (sin cambios)
    end
    Reducer->>Mision: new Mision(payload)
    Mision-->>Reducer: item (con tipoFuego del payload)
    Reducer->>Reducer: misiones.find(m => m.key === item.key)
    alt key no existe
        Reducer-->>UI: return state (sin cambios)
    end
    Reducer->>CalcFn: calculateMission(item, chargeIndex, table, types)
    CalcFn-->>Reducer: result
    Reducer->>Reducer: { ...result, key: item.key, tipoFuego: original.tipoFuego }
    Reducer->>Reducer: misiones.map(m => m.key === item.key ? updatedResult : m)
    Reducer-->>UI: { ...state, misiones: newMisiones }
```

### Diagrama de Secuencia — triangulateObserver

```mermaid
sequenceDiagram
    participant Caller
    participant tri as triangulateObserver

    Caller->>tri: { d_mo, rumbo_mo, d_oo, rumbo_relativo_oo }
    tri->>tri: rumbo_mo_rad = rumbo_mo * π/3200
    tri->>tri: ox = d_mo * sin(rumbo_mo_rad)
    tri->>tri: oy = d_mo * cos(rumbo_mo_rad)
    tri->>tri: rumbo_abs = (rumbo_mo + rumbo_relativo_oo) % 6400
    tri->>tri: tx = ox + d_oo * sin(rumbo_abs_rad)
    tri->>tri: ty = oy + d_oo * cos(rumbo_abs_rad)
    tri->>tri: distancia = round(sqrt(tx²+ty²))
    tri->>tri: rumbo_rad = atan2(tx, ty); if < 0 += 2π
    tri->>tri: rumbo = round((rumbo_rad * 3200/π) % 6400)
    tri-->>Caller: { distancia, rumbo }
```

---

## Hito 4: Botones borrar fila y borrar tabla
**Fecha:** 2026-03-13  
**Commit:** `065b043`

### Entidades

| Nombre | Tipo | Acción | Archivo | Descripción |
|--------|------|--------|---------|-------------|
| `TableRow` | componente | modificada | `src/molecules/Table/TableRow.js` | Botón "Recalcular" ahora despacha `recalculateItem` (no `calculateItem`); añadido botón "Borrar" que despacha `deleteItem(item.key)` |
| `Table` | componente | modificada | `src/molecules/Table/Table.js` | Añadido `<tfoot>` con botón "Borrar todo" que despacha `clearTable()` |
| `TableRow.test.js` | otro | modificada | `src/molecules/Table/TableRow.test.js` | Añadidos tests para `recalculateItem` en click de Recalcular y `deleteItem` en click de Borrar |
| `Table.test.js` | otro | modificada | `src/molecules/Table/Table.test.js` | Añadidos tests para render del botón "Borrar todo" y despacho de `clearTable` |

### Diagrama de Clases

```mermaid
classDiagram
    class TableRow {
        <<componente>>
        +item: object
        +dispatcher: function
        -handleRecalcular(event) void
        -handleBorrar(event) void
    }

    class Table {
        <<componente>>
        +state: object
        +dispatcher: function
    }

    class mainActions {
        <<module>>
        +recalculateItem(item) Action
        +deleteItem(key) Action
        +clearTable() Action
    }

    TableRow --> mainActions : recalculateItem, deleteItem
    Table --> mainActions : clearTable
```

### Diagrama de Secuencia — Borrar fila

```mermaid
sequenceDiagram
    participant Usuario
    participant TableRow
    participant Reducer as mainReducer

    Usuario->>TableRow: click "Borrar"
    TableRow->>TableRow: handleBorrar(event)
    TableRow->>Reducer: dispatcher(deleteItem(item.key))
    Reducer->>Reducer: misiones.filter(m => m.key !== key)
    Reducer-->>TableRow: { ...state, misiones: [sin la fila] }
```

### Diagrama de Secuencia — Borrar todo

```mermaid
sequenceDiagram
    participant Usuario
    participant Table
    participant Reducer as mainReducer

    Usuario->>Table: click "Borrar todo"
    Table->>Reducer: dispatcher(clearTable())
    Reducer->>Reducer: misiones = [], resultadosActuales = null
    Reducer-->>Table: { ...state, misiones: [], resultadosActuales: null }
```
