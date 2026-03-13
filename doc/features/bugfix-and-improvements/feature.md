# Feature: Bugfix y Mejoras — Calculadora Mortero MK252

## Descripción
Corrección de bugs críticos, limpieza de código muerto, mejoras de calidad y la
feature de recomendación automática de carga óptima para la calculadora de mortero
MK252 de ARMA 3.

## Contexto del dominio
- El mortero MK252 en ARMA 3 requiere: elevación (mils), azimuth (mils) y tiempo de vuelo
- Hay 3 cargas disponibles: Ch0 (corta distancia), Ch1 (media), Ch2 (larga)
- El azimuth se convierte de grados a milésimas NATO: grados × 17.777778
- La elevación se corrige según la diferencia de altura entre el arma y el objetivo

## Bugs críticos a corregir

### BUG-01: useEffect lee campo inexistente
- Archivo: `src/organisms/InputForm/InputForm.js` línea 42
- `state.resultado` no existe; el campo real es `state.resultadoActual`
- El resultado nunca se muestra en la UI

### BUG-02: Tiempo de vuelo calculado incorrectamente
- Archivo: `src/lib/main.reducer.js` línea 51
- `timeOfFlightPer100m * (distancia / 100)` produce valores absurdos en Charge0
  (ej: 14.3 × 3 = 42.9 segundos a 300m)
- El tiempo de vuelo debe tomarse directamente de `base.timeOfFlight`

### BUG-03: TableRow sin key prop
- Archivo: `src/molecules/Table/Table.js` línea 25
- Warning de React: cada elemento de lista necesita prop `key`

### BUG-04: console.log/error en producción
- Archivo: `src/lib/main.reducer.js` líneas 70, 83, 95
- Deben eliminarse del código de producción

## Limpieza de código muerto

### CLEANUP-01: getChargeForDistance nunca se usa
- Función exportada y testeada pero no invocada en ningún lugar

### CLEANUP-02: getOptimalCharge con índices invertidos y sin uso
- Índices inconsistentes con `chargeTables` array del reducer
- No se llama en ningún lugar del flujo real

### CLEANUP-03: README con nombre incorrecto
- Dice "mk256" en el título, debe ser "mk252"

## Mejoras de calidad

### IMPROVE-01: Configuración de Jest
- `jest@27.5.1` en devDependencies no se instala correctamente
- `npm test` falla con "jest: command not found"
- Solución: actualizar `jest` a v29, añadir `@babel/preset-react` para soporte JSX

### IMPROVE-02: Validación de inputs
- Distancia: mínimo 50m, máximo según la carga seleccionada
- Rumbo: 0–6400 milésimas (o 0–360 grados con conversión interna)
- Altura: permitir negativos (terreno bajo nivel del mar en el juego)

### IMPROVE-03: Etiquetas de resultado en UI
- Los resultados se muestran como `<p>{resultado}</p>` sin contexto
- Deben tener etiquetas: "Elevación (mils):", "Azimuth (mils):", "Tiempo de vuelo (s):"

## Feature nueva

### FEATURE-01: Recomendación automática de carga óptima
- Al calcular, mostrar en la tabla de resultados las 3 cargas calculadas
- Marcar visualmente cuál es la recomendada según la distancia
- Lógica: Ch0 para ≤450m, Ch1 para ≤1950m, Ch2 para ≤4050m

## Criterios de aceptación

1. `npm test` ejecuta los tests sin error (jest local funcional)
2. El resultado de elevación se muestra correctamente en UI
3. El tiempo de vuelo es el valor directo de la tabla (`timeOfFlight`)
4. La tabla muestra columna "Tiempo" con el ETA de impacto
5. Los `console.log` de producción son eliminados
6. La UI muestra etiquetas claras para Elevación, Azimuth y Tiempo
7. Al calcular se muestran las 3 elevaciones posibles (Ch0, Ch1, Ch2)
8. Se indica visualmente cuál carga es la recomendada
9. Los tests cubren todos los bugs corregidos y la nueva feature
10. Sin warnings de React en consola (key props)
