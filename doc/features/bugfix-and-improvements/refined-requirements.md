# Requerimientos Refinados: bugfix-and-improvements

## Contexto

La calculadora de mortero MK252 para ARMA 3 es una aplicación React 18 con arquitectura `useReducer` que permite a un operador de mortero calcular elevación (mils), azimuth (mils) y tiempo de vuelo para un objetivo dado. El flujo principal es: el usuario introduce parámetros → pulsa "Calcular" → el reducer procesa la misión → los resultados se muestran en pantalla y se añaden a una tabla de historial de misiones.

**Estado actual crítico:** El resultado de elevación nunca se muestra en pantalla (BUG-01) y el tiempo de vuelo calculado es completamente incorrecto para Charge0 (BUG-02). La feature añade además el cálculo simultáneo de las 3 cargas con recomendación automática.

### Dominio balístico
- **3 cargas disponibles:** Ch0, Ch1, Ch2
- **Azimuth:** `rumbo × 17.777778` (conversión grados → milésimas NATO)
- **Elevación corregida:** `base.elevation ± (|alturaObjetivo - alturaPropia| / 100) × base.elevPer100m`
  - Si objetivo está más alto: `base.elevation - correccion`
  - Si objetivo está más bajo: `base.elevation + correccion`
- **Tiempo de vuelo:** `base.timeOfFlight` (valor directo de la tabla, NO calculado)
- **Rangos efectivos por carga (mínimo y máximo de sus tablas):**
  - Ch0: 50m–450m (tabla Charge0)
  - Ch1: 150m–1950m (tabla Charge1)
  - Ch2: 300m–4050m (tabla Charge2)
- **Carga recomendada:** la carga en rango efectivo con el **menor `timeOfFlight`** para la distancia dada. Si hay empate de tiempo mínimo, se prefiere la carga de menor número (Ch0 < Ch1 < Ch2). Las cargas fuera de su rango efectivo no compiten.

---

## Decisiones tomadas

1. **timeOfFlight directo de tabla:** El campo `timeOfFlightPer100m` en Charge0 tiene valores absurdos (14.3) heredados de las tablas originales del juego. Se usa `base.timeOfFlight` directamente en todos los casos.

2. **Cálculo de las 3 cargas simultáneamente:** Al calcular, el reducer calculará los 3 resultados (Ch0, Ch1, Ch2) para la distancia ingresada, independientemente de la carga seleccionada por el usuario. El campo `municion` del formulario queda **eliminado** como selector del tipo de resultado; ahora actúa solo como preferencia de recomendación visual, pero el cálculo siempre es triple.

3. **Estado ampliado en el reducer:** El estado añade `resultadosActuales: { ch0, ch1, ch2 }` donde cada entrada contiene `{ elevacion, azimuth, tiempo, recomendada: bool }`. El campo `resultadoActual` (elevación de la carga seleccionada) y `azimuthActual` se conservan para compatibilidad, pero `tiempoActual` se añade al estado.

4. **getOptimalCharge reemplazada por getRecommendedCharge(distance, chargeTables):** La función busca la carga con el menor `timeOfFlight` entre las que tienen la distancia dentro de su rango efectivo. Si hay empate, gana la carga de menor número. Los rangos erróneos del código actual (400/1500 en `getChargeForDistance`, 500/2000 en `getOptimalCharge`) quedan obsoletos y se eliminan.

5. **getChargeForDistance eliminada (código muerto):** No se llama en ningún lugar. Se elimina en el hito de cleanup. Sus tests actuales se eliminan junto con la función.

6. **getOptimalCharge eliminada:** Sus índices están invertidos, sus rangos son incorrectos y no se llama en ningún flujo real. Se reemplaza completamente por `getRecommendedCharge`.

7. **Validación de inputs:** Implementada como función pura `validateMissionInput(item)` que retorna `{ valid: bool, errors: string[] }`. No bloquea el dispatch pero el reducer retorna `state` sin modificar si hay errores de validación.

8. **Campo `municion` en el formulario se pre-selecciona automáticamente:** El selector de munición se actualiza dinámicamente para mostrar la carga recomendada cada vez que se ejecuta un cálculo. El cálculo siempre genera las 3 cargas simultáneamente; el selector refleja la recomendación calculada, pero el usuario puede cambiarlo antes de recalcular.

9. **`npm test` como comando estándar:** Se reemplaza jest@27 por jest@29 y se añade `@babel/preset-react`. El script `"test": "jest"` en package.json permanece igual.

10. **Columna "Tiempo" en tabla de historial:** Se añade al `<TableRow>` mostrando el `item.tiempo` con 2 decimales y sufijo "s".

11. **Rama de trabajo:** `feature/bugfix-and-improvements` creada desde `main` (no existe rama `stage` en este repositorio).

---

## Casos de uso

### UC-01: Configurar Jest para ejecución local
**Actor:** Desarrollador  
**Precondición:** `npm test` falla con "jest: command not found"  
**Flujo principal:**
1. Se actualiza `jest` a ^29.x en devDependencies
2. Se añade `@babel/preset-react` a devDependencies
3. Se actualiza `babel.config.js` con preset-react
4. Se ejecuta `npm test` y los 16 tests existentes pasan en verde
**Postcondición:** `npm test` funciona sin npx; todos los tests existentes pasan

### UC-02: Calcular misión y ver el resultado de elevación en pantalla
**Actor:** Operador de mortero  
**Precondición:** App cargada; formulario con datos válidos  
**Flujo principal:**
1. Usuario introduce: alturaPropia, denominación, distancia, altura objetivo, rumbo
2. Usuario pulsa "Calcular"
3. El reducer calcula elevación, azimuth y tiempo con la carga seleccionada
4. `useEffect` en InputForm lee `state.resultadoActual` (corrección de BUG-01)
5. La UI muestra "Elevación (mils):", "Azimuth (mils):", "Tiempo de vuelo (s):"
**Flujos alternativos:**
- edge: distancia fuera de rango de la carga seleccionada → se muestra la carga recomendada y se indica que la seleccionada no aplica
**Postcondición:** Resultado visible en pantalla con etiquetas

### UC-03: Calcular tiempo de vuelo correcto
**Actor:** Operador de mortero  
**Precondición:** Misión calculada con cualquier carga  
**Flujo principal:**
1. Reducer llama `calculateMission(item, index, chargeTable, municionTypes)`
2. `tiempo` se asigna como `base.timeOfFlight` (no `timeOfFlightPer100m × distancia`)
3. Para Charge0 a 300m → `tiempo = 1.5s` (tabla row range:300)
**Flujos alternativos:**
- unhappy: distancia menor al mínimo de la tabla → se usa el primer entry de la tabla
**Postcondición:** `resultado.tiempo` es el valor directo de la tabla balística

### UC-04: Ver las 3 elevaciones posibles al calcular con carga recomendada por tiempo mínimo
**Actor:** Operador de mortero  
**Precondición:** Formulario con datos válidos, distancia dentro de al menos un rango de carga  
**Flujo principal:**
1. Usuario pulsa "Calcular"
2. El reducer calcula las 3 misiones simultáneamente (Ch0, Ch1, Ch2)
3. Se determina la carga recomendada: la que tiene menor `timeOfFlight` entre las cargas en rango; en caso de empate, la de mayor número
4. La UI muestra la **carga recomendada en sección principal destacada** con elevación, azimuth y tiempo
5. Las **otras cargas en rango** (válidas pero no recomendadas) se muestran en sección secundaria
6. Las **cargas fuera de rango** se muestran como "FUERA DE RANGO" sin datos de elevación
7. El selector de munición del formulario se actualiza automáticamente con la carga recomendada
**Flujos alternativos:**
- edge: distancia 300m → Ch0 en rango (t=1.5s), Ch1 en rango (t=0.7s), Ch2 en rango (t=0.5s) → **Ch2 recomendada** (menor tiempo)
- edge: distancia 100m → Ch0 en rango (t=1.3s), Ch1 fuera de rango (mín 150m), Ch2 fuera de rango (mín 300m) → **Ch0 recomendada** (única en rango)
- edge: distancia 2000m → Ch0 fuera de rango (máx 450m), Ch1 fuera de rango (máx 1950m), Ch2 en rango (t=0.8s) → **Ch2 recomendada** (única en rango)
**Postcondición:** Carga recomendada destacada; otras en rango en sección secundaria; fuera de rango ocultas con etiqueta; selector actualizado

### UC-05: Validar inputs del formulario
**Actor:** Operador de mortero  
**Precondición:** Formulario visible  
**Flujo principal:**
1. Usuario introduce distancia válida (≥50m) y rumbo válido (0–6400 mils)
2. Altura puede ser cualquier entero (incluido negativo)
3. El dispatch se ejecuta normalmente
**Flujos alternativos:**
- unhappy: distancia < 50m → reducer retorna state sin cambios; no se añade misión
- unhappy: distancia > 4050m → reducer retorna state sin cambios (fuera de todos los rangos)
- unhappy: rumbo < 0 o rumbo > 6400 → reducer retorna state sin cambios
- edge: altura negativa → válida (terreno bajo nivel del mar en el juego)
- edge: alturaPropia negativa → válida

### UC-06: Ver historial de misiones con columna Tiempo
**Actor:** Operador de mortero  
**Precondición:** Al menos una misión calculada  
**Flujo principal:**
1. Cada fila del historial muestra: alturaPropia, denominación, munición, distancia, altura, rumbo, elevación, azimuth, **tiempo (s)**
2. El tiempo se muestra con 2 decimales + sufijo "s" (ej: "1.50s")
3. Cada `<TableRow>` tiene prop `key={item.key}` en el `<Table>` (corrección BUG-03)
**Postcondición:** Sin warnings de React; columna Tiempo visible

### UC-07: Recalcular una misión del historial
**Actor:** Operador de mortero  
**Precondición:** Al menos una misión en la tabla de historial  
**Flujo principal:**
1. Usuario modifica parámetros en una fila del historial
2. Pulsa "Recalcular"
3. La fila se actualiza con los nuevos valores de elevación, azimuth y tiempo
**Postcondición:** Misión actualizada en historial con datos correctos

### UC-08: Eliminar console.log/error de producción
**Actor:** Sistema  
**Precondición:** `main.reducer.js` con 3 sentencias console  
**Flujo principal:** Los 3 console.log/error (líneas 70, 83, 95) son eliminados  
**Postcondición:** Sin output en consola del browser durante uso normal

---

## Condiciones de aceptación

- **CA-01:** `npm test` ejecuta los tests sin error (jest instalado localmente, sin npx)
- **CA-02:** Los tests pasan con jest@29 y `@babel/preset-react` configurado
- **CA-03:** `tiempo` en el resultado de `calculateMission` es igual a `base.timeOfFlight`, no a `timeOfFlightPer100m × (distancia/100)`
- **CA-04:** Para Charge0 a 300m: `tiempo === 1.5` (valor de la tabla)
- **CA-05:** `useEffect` en `InputForm.js` lee `state.resultadoActual` (no `state.resultado`)
- **CA-06:** El resultado de elevación es visible en pantalla tras calcular
- **CA-07:** Los resultados de UI tienen etiquetas: "Elevación (mils):", "Azimuth (mils):", "Tiempo de vuelo (s):"
- **CA-08:** Los 3 `console.log`/`console.error` están eliminados del reducer
- **CA-09:** `<TableRow>` recibe prop `key` desde `<Table>` sin warnings de React
- **CA-10:** La tabla de historial incluye columna "Tiempo" con formato `"X.XXs"`
- **CA-11:** El reducer calcula las 3 cargas simultáneamente y las almacena en `state.resultadosActuales`
- **CA-12:** La carga recomendada es la que tiene el menor `timeOfFlight` entre las cargas dentro de su rango efectivo; en empate se prefiere la de mayor número de carga
- **CA-12a:** Ejemplo verificable: distancia 300m → recomendada es Ch2 (t=0.5s < Ch1 t=0.7s < Ch0 t=1.5s)
- **CA-12b:** Ejemplo verificable: distancia 100m → recomendada es Ch0 (única en rango; Ch1 mín 150m, Ch2 mín 300m)
- **CA-12c:** Ejemplo verificable: distancia 2000m → recomendada es Ch2 (única en rango; Ch0 máx 450m, Ch1 máx 1950m)
- **CA-13:** La UI destaca visualmente la carga recomendada en sección principal (CSS class `recomendada`)
- **CA-13a:** Las cargas en rango no recomendadas se muestran en sección secundaria con sus datos de elevación y tiempo
- **CA-13b:** Las cargas fuera de rango muestran "FUERA DE RANGO" sin datos de elevación
- **CA-13c:** El selector de munición del formulario se pre-selecciona automáticamente con la carga recomendada tras calcular
- **CA-14:** Las funciones huérfanas `getChargeForDistance` y `getOptimalCharge` exportadas son eliminadas o refactorizadas dentro de la lógica de `calculateAllCharges`
- **CA-15:** El README dice "mk252" (no "mk256")
- **CA-16:** Distancia < 50m o > 4050m no añade misión al estado; rumbo < 0 o > 6400 tampoco
- **CA-17:** Cobertura del 100% del código nuevo añadido en esta feature

---

## Preguntas y respuestas del usuario

| Pregunta | Respuesta | Impacto |
|---|---|---|
| ¿Qué ocurre visualmente con Ch0 cuando la distancia es 200m (Charge1 mínimo es 150m, Charge2 mínimo es 300m)? | Inferido del dominio: mostrar "FUERA DE RANGO" para cargas donde la distancia está fuera de tabla | UC-04 flujo alternativo |
| ¿El selector `municion` del formulario desaparece? | No. Se mantiene pero se pre-selecciona automáticamente con la carga recomendada tras calcular | Decisión 8 — [REVISADO] |
| ¿Rumbo en grados o milésimas? | La feature.md indica 0-6400 mils con conversión interna; el formulario actual ya usa rumbo y lo multiplica × 17.777778 | UC-05 validación |
| ¿Distancia máxima absoluta? | 4050m (límite de Charge2, la más larga) | CA-16 |
| ¿Criterio de carga recomendada? | **[REVISADO]** No es por rangos fijos sino por menor `timeOfFlight` entre cargas en rango efectivo. Empate: mayor número de carga gana | CA-12, DA-4 del plan |

---

## Dependencias

- `src/lib/main.reducer.js` — afectado por BUG-02, BUG-04, CLEANUP-01/02, FEATURE-01
- `src/organisms/InputForm/InputForm.js` — afectado por BUG-01, IMPROVE-03, FEATURE-01 (UI 3 cargas)
- `src/molecules/Table/Table.js` — afectado por BUG-03, hito columna Tiempo
- `src/molecules/Table/TableRow.js` — afectado por columna Tiempo
- `package.json` + `babel.config.js` — afectados por IMPROVE-01 (Jest)
- `README.md` — afectado por CLEANUP-03
