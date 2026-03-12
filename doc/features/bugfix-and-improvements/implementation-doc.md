# Documentación Técnica: bugfix-and-improvements

## Hito 1: Fix configuración Jest
**Fecha:** 2026-03-12  
**Commit:** `fa52e8e`

### Entidades
| Nombre | Tipo | Acción | Archivo | Descripción |
|--------|------|--------|---------|-------------|
| `package.json` | módulo | modificada | `package.json` | Actualiza jest@27→@29, babel-jest@29, @babel/preset-react@7, jest-environment-jsdom@29; mueve @testing-library a devDependencies |
| `babel.config.js` | módulo | modificada | `babel.config.js` | Añade @babel/preset-react con runtime 'automatic' para transpilar JSX |
| `jest.config.js` | módulo | modificada | `jest.config.js` | testEnvironment jsdom, moduleNameMapper para CSS, elimina mapeo manual de mision.entity |
| `styleMock.js` | módulo | creada | `__mocks__/styleMock.js` | Mock vacío para imports CSS/LESS/SCSS en tests |

### Diagrama de Clases
```mermaid
classDiagram
  class JestConfig {
    +testEnvironment: jsdom
    +transform: babel-jest
    +moduleNameMapper: CSS→styleMock
    +roots: src/
  }
  class BabelConfig {
    +preset-env: node current
    +preset-react: runtime automatic
  }
  JestConfig --> BabelConfig : uses
```

### Diagrama de Secuencia
```mermaid
sequenceDiagram
  participant Dev as Developer
  participant npm as npm test
  participant Jest as Jest@29
  participant Babel as babel-jest@29
  Dev->>npm: npm test
  npm->>Jest: ejecutar suite
  Jest->>Babel: transformar JSX/JS
  Babel-->>Jest: módulos transpilados
  Jest-->>Dev: 16/16 PASS
```

## Hito 2: Fix BUG-02 — timeOfFlight correcto
**Fecha:** 2026-03-12  
**Commit:** `0eb5548`

### Entidades
| Nombre | Tipo | Acción | Archivo | Descripción |
|--------|------|--------|---------|-------------|
| `calculateMission` | función | modificada | `src/lib/main.reducer.js` | Corrige tiempo de vuelo: usa `base.timeOfFlight` en lugar de `base.timeOfFlightPer100m * (distancia/100)` |

### Diagrama de Secuencia
```mermaid
sequenceDiagram
  participant T as Test
  participant CM as calculateMission
  participant FBC as findBaseCharge
  participant CT as ChargeTable
  T->>CM: calculateMission(item, idx, chargeTable, types)
  CM->>FBC: findBaseCharge(chargeTable, item.distancia)
  FBC-->>CM: base = {timeOfFlight: 1.5, ...}
  CM-->>T: {tiempo: 1.5} (antes: 1.5*3=4.5 INCORRECTO)
```

## Hito 3: Fix BUG-01 — state.resultadoActual en InputForm + tiempoActual
**Fecha:** 2026-03-12  
**Commit:** `a722ff3`

### Entidades
| Nombre | Tipo | Acción | Archivo | Descripción |
|--------|------|--------|---------|-------------|
| `initialState.tiempoActual` | tipo/DTO | modificada | `src/lib/main.reducer.js` | Añade campo `tiempoActual: 0` al estado inicial del reducer |
| `mainReducer CALCULATE_ITEM` | función | modificada | `src/lib/main.reducer.js` | Añade `tiempoActual: result.tiempo` al return del case |
| `InputForm` | componente | modificada | `src/organisms/InputForm/InputForm.js` | Corrige `state.resultado→state.resultadoActual` en useEffect; añade `[tiempo, setTiempo]` |

### Diagrama de Secuencia
```mermaid
sequenceDiagram
  participant U as Usuario
  participant IF as InputForm
  participant R as mainReducer
  U->>IF: click Calcular
  IF->>R: dispatch(CALCULATE_ITEM)
  R-->>IF: state.resultadoActual, state.azimuthActual, state.tiempoActual
  IF->>IF: setResultado, setAzimuth, setTiempo
  IF-->>U: muestra valores (antes: resultado nunca visible)
```

## Hito 6: UI panel de 3 cargas, etiquetas de resultado y pre-selección
**Fecha:** 2026-03-12  
**Commit:** `855a21e`

### Entidades
| Nombre | Tipo | Acción | Archivo | Descripción |
|--------|------|--------|---------|-------------|
| `ChargeResultsPanel` | componente | creada | `src/organisms/InputForm/InputForm.js` | Componente puro que recibe `resultadosActuales` y renderiza el panel de 3 cargas con sección recomendada, otras en rango y fuera de rango |
| `InputForm` | componente | modificada | `src/organisms/InputForm/InputForm.js` | Reemplaza `<p>{resultado}</p>` por bloque con etiquetas `resultado-actual`; añade `useEffect` de pre-selección; integra `ChargeResultsPanel` |
| `InputForm.css` | módulo | modificada | `src/organisms/InputForm/InputForm.css` | Añade 5 clases CSS: `.carga-recomendada-principal`, `.badge-recomendada`, `.otras-cargas-en-rango`, `.carga-row.secundaria`, `.carga-row.fuera-de-rango` |
| `InputForm.test.js` | módulo | creada | `src/organisms/InputForm/InputForm.test.js` | 9 tests RTL que mockean `useReducer` de React para controlar el estado del componente |

### Diagrama de Clases
```mermaid
classDiagram
  class InputForm {
    -state: AppState (via useReducer mock)
    -resultado: number
    -azimuth: number
    -tiempo: number
    -municion: string
    +handleClick(event)
    +useEffect syncResultados
    +useEffect preSelectRecomendada
  }
  class ChargeResultsPanel {
    +resultadosActuales: object|null
    +render() JSX|null
  }
  InputForm --> ChargeResultsPanel : renders
  InputForm --> mainReducer : dispatch
```

### Diagrama de Secuencia
```mermaid
sequenceDiagram
  participant U as Usuario
  participant IF as InputForm
  participant R as mainReducer
  participant CRP as ChargeResultsPanel
  U->>IF: click Calcular
  IF->>R: dispatch(CALCULATE_ITEM)
  R-->>IF: state.resultadosActuales = {ch0,ch1,ch2}
  IF->>IF: useEffect → setResultado, setAzimuth, setTiempo
  IF->>IF: useEffect → setMunicion(recomendada)
  IF->>CRP: resultadosActuales={ch0,ch1,ch2}
  CRP-->>U: panel con badge RECOMENDADA + otras en rango + fuera de rango
```
