# UI Design Spec — Calculadora Mortero MK252

## Metadata

| Campo | Valor |
|-------|-------|
| Fuente | Imagen de referencia `uistyle.jpg` (dashboard moderno) |
| URL | N/A — modo imagen |
| Fecha | 2026-03-13 |
| Stack destino | React 18, JavaScript puro, CSS puro (sin frameworks CSS externos) |
| Agente | ui-inspector |
| Modo de análisis | Imagen |

---

## Análisis de la imagen de referencia

La imagen muestra un dashboard de tipo "Gboard" con las siguientes características observadas:

- **Sidebar izquierdo** — fondo blanco/gris muy claro (`#f8f9fb` aprox.), iconos de navegación en gris medio con ítem activo resaltado en azul-turquesa, ancho ~60px (modo icon-only)
- **Fondo general** — blanco puro con fondo degradado azul-verde visible en la parte superior izquierda del body (`linear-gradient(135deg, #43e97b 0%, #38f9d7 40%, #4facfe 100%)` aprox. — visible en bordes exteriores de la ventana)
- **Header de métricas** — fila de cards horizontales con fondo blanco, sombra suave, iconos coloridos (azul, verde, naranja) en círculos de color pastel
- **Cards** — `border-radius: 12px`, `box-shadow: 0 4px 20px rgba(0,0,0,0.08)`, fondo blanco
- **Tipografía** — sans-serif limpia tipo Inter/Segoe UI, pesos normal y bold, tamaño cuerpo ~14px
- **Tabla "Product Overview"** — cabecera con texto gris medio, filas alternadas blancas (sin zebra explícita visible), separadores `border-bottom: 1px solid #f0f0f0`
- **Badges de estado** — `Paid` en verde (`#10b981`), `Pending` en naranja (`#f59e0b`), `Failed` en rojo suave — forma pill (`border-radius: 9999px`), padding horizontal generoso
- **Botones** — no visibles explícitamente como CTA, pero el ítem activo del sidebar usa `#4facfe` (azul-turquesa) como color de acento
- **Inputs de búsqueda** — borde gris claro, sin sombra, `border-radius: 6px`, placeholder gris
- **Espaciado** — escala de 4px, padding de cards ~20-24px, gap entre secciones ~24px
- **Colores primarios observados**: azul-turquesa `#4facfe`, verde `#43e97b`/`#00f2fe`, amarillo-verde `#a8e063`

---

## Design Tokens

### Colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | `#4facfe` | Botón calcular, acento activo, focus rings |
| `--color-primary-dark` | `#2196f3` | Hover de botón primario |
| `--color-primary-gradient` | `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)` | Header de la app, acento de marca |
| `--color-secondary` | `#6b7280` | Texto secundario, iconos inactivos, labels |
| `--color-secondary-light` | `#9ca3af` | Placeholders, texto deshabilitado |
| `--color-background` | `#f5f7fa` | Fondo general de página |
| `--color-surface` | `#ffffff` | Fondo de cards, paneles, tabla |
| `--color-surface-hover` | `#f9fafb` | Hover de filas de tabla |
| `--color-border` | `#e5e7eb` | Bordes de inputs, separadores de tabla |
| `--color-border-focus` | `#4facfe` | Borde de input en estado :focus |
| `--color-text` | `#1f2937` | Texto principal |
| `--color-text-muted` | `#6b7280` | Texto secundario, etiquetas de campo |
| `--color-success` | `#10b981` | Badge "RECOMENDADA", borde carga recomendada |
| `--color-success-bg` | `#d1fae5` | Fondo de carga recomendada |
| `--color-warning` | `#f59e0b` | Badge "Pending" / fuego indirecto |
| `--color-warning-bg` | `#fef3c7` | Fondo de badge warning |
| `--color-danger` | `#ef4444` | Botón borrar, "FUERA DE RANGO" |
| `--color-danger-bg` | `#fee2e2` | Fondo de estado error/danger |
| `--color-sidebar-bg` | `#f8f9fb` | Fondo del sidebar (si se implementa nav) |
| `--color-header-gradient` | `linear-gradient(135deg, #43e97b 0%, #4facfe 100%)` | Fondo degradado del app-header |

### Tipografía

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-family-base` | `'Segoe UI', system-ui, -apple-system, sans-serif` | Texto general (aprovecha font stack existente) |
| `--font-size-xs` | `11px` | Captions, sub-labels de badge |
| `--font-size-sm` | `13px` | Texto de tabla, labels de campo |
| `--font-size-base` | `15px` | Texto principal, valores de resultado |
| `--font-size-lg` | `18px` | Subtítulos de sección (Resultados, Historial) |
| `--font-size-xl` | `22px` | Título de la app en header |
| `--font-size-2xl` | `28px` | Métricas grandes (valor de resultado destacado) |
| `--font-weight-normal` | `400` | Texto de cuerpo |
| `--font-weight-medium` | `500` | Labels, cabeceras de tabla |
| `--font-weight-semibold` | `600` | Subtítulos de card, nombre de carga |
| `--font-weight-bold` | `700` | Título del app, valores críticos |
| `--line-height-base` | `1.5` | Texto de cuerpo |
| `--line-height-tight` | `1.25` | Títulos, métricas |

### Espaciado

| Token | Valor | Uso |
|-------|-------|-----|
| `--spacing-1` | `4px` | Gap mínimo entre inline elements, padding badge xs |
| `--spacing-2` | `8px` | Padding de badge, gap entre icono y texto |
| `--spacing-3` | `12px` | Padding de input (vertical), gap entre campos del form |
| `--spacing-4` | `16px` | Padding estándar dentro de cards pequeñas |
| `--spacing-5` | `20px` | Padding interno de cards principales |
| `--spacing-6` | `24px` | Gap entre secciones (form → results → table) |
| `--spacing-8` | `32px` | Padding de secciones principales |
| `--spacing-12` | `48px` | Espaciado de layout máximo |

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | `4px` | Inputs, checkboxes |
| `--radius-md` | `8px` | Botones, badges rectangulares |
| `--radius-lg` | `12px` | Cards, paneles de sección |
| `--radius-xl` | `16px` | Cards de métrica destacada |
| `--radius-full` | `9999px` | Badges pill (RECOMENDADA, PENDING) |

### Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 3px rgba(0, 0, 0, 0.06)` | Inputs en focus suave |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.08)` | Cards, paneles principales |
| `--shadow-lg` | `0 8px 24px rgba(0, 0, 0, 0.12)` | Card de carga recomendada, hover elevado |
| `--shadow-primary` | `0 4px 14px rgba(79, 172, 254, 0.35)` | Botón primario, glow azul-turquesa |

### Breakpoints

| Token | Valor | Contexto |
|-------|-------|----------|
| `--breakpoint-sm` | `640px` | Mobile landscape |
| `--breakpoint-md` | `768px` | Tablet — layout en columna única |
| `--breakpoint-lg` | `1024px` | Desktop — layout completo con sidebar |

---

## Variables CSS — Bloque `:root` completo

```css
/* ============================================================
   CALCULADORA MORTERO MK252 — CSS Custom Properties
   Generado por ui-inspector · 2026-03-13
   ============================================================ */

:root {
  /* ── Colores ─────────────────────────────────────── */
  --color-primary:          #4facfe;
  --color-primary-dark:     #2196f3;
  --color-primary-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

  --color-secondary:        #6b7280;
  --color-secondary-light:  #9ca3af;

  --color-background:       #f5f7fa;
  --color-surface:          #ffffff;
  --color-surface-hover:    #f9fafb;

  --color-border:           #e5e7eb;
  --color-border-focus:     #4facfe;

  --color-text:             #1f2937;
  --color-text-muted:       #6b7280;

  --color-success:          #10b981;
  --color-success-bg:       #d1fae5;
  --color-warning:          #f59e0b;
  --color-warning-bg:       #fef3c7;
  --color-danger:           #ef4444;
  --color-danger-bg:        #fee2e2;

  --color-header-gradient:  linear-gradient(135deg, #43e97b 0%, #4facfe 100%);

  /* ── Tipografía ──────────────────────────────────── */
  --font-family-base:     'Segoe UI', system-ui, -apple-system, sans-serif;

  --font-size-xs:         11px;
  --font-size-sm:         13px;
  --font-size-base:       15px;
  --font-size-lg:         18px;
  --font-size-xl:         22px;
  --font-size-2xl:        28px;

  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  --line-height-base:     1.5;
  --line-height-tight:    1.25;

  /* ── Espaciado ───────────────────────────────────── */
  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  20px;
  --spacing-6:  24px;
  --spacing-8:  32px;
  --spacing-12: 48px;

  /* ── Bordes y Radio ──────────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  --border-width: 1px;
  --border-color: var(--color-border);

  /* ── Sombras ─────────────────────────────────────── */
  --shadow-sm:      0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md:      0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg:      0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-primary: 0 4px 14px rgba(79, 172, 254, 0.35);
}
```

---

## Layout

### Estructura general

```
┌─────────────────────────────────────────────────────────┐
│  .app-header  (gradiente azul-verde, título + subtítulo) │
├─────────────────────────────────────────────────────────┤
│  .app-main                                               │
│  ┌───────────────────┐  ┌──────────────────────────────┐│
│  │  .calc-card       │  │  .results-panel               ││
│  │  (formulario)     │  │  ┌────┐  ┌────┐  ┌────┐      ││
│  │                   │  │  │CH0 │  │CH1 │  │CH2 │      ││
│  └───────────────────┘  │  └────┘  └────┘  └────┘      ││
│                          └──────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐ │
│  │  .indirect-fire-card  (fuego indirecto — feature)   │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  .mission-table  (historial de misiones)            │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Especificaciones de layout

| Propiedad | Valor |
|-----------|-------|
| Tipo | Flexbox vertical (columna principal) + Flexbox horizontal (results-panel) |
| Contenedor máximo | `max-width: 1200px` centrado con `margin: 0 auto` |
| Padding de página | `var(--spacing-6)` (24px) horizontal en desktop |
| Gap entre secciones | `var(--spacing-6)` (24px) |
| Fila form + results | `display: flex; flex-wrap: wrap; gap: var(--spacing-6)` |
| `.calc-card` flex | `flex: 0 0 320px` (fijo) |
| `.results-panel` flex | `flex: 1 1 auto` (expansivo) |

---

## Componentes

### `.app-header`

**Tipo**: Sección de cabecera de página

**HTML**:
```html
<header class="app-header">
  <div class="app-header__content">
    <h1 class="app-header__title">MK252 — Calculadora de Mortero</h1>
    <p class="app-header__subtitle">ARMA 3 · Fuego Indirecto Táctico</p>
  </div>
</header>
```

**CSS**:
```css
.app-header {
  background: var(--color-header-gradient);
  padding: var(--spacing-5) var(--spacing-8);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  margin-bottom: var(--spacing-6);
}

.app-header__title {
  color: #ffffff;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin: 0 0 var(--spacing-1) 0;
  text-shadow: 0 1px 3px rgba(0,0,0,0.15);
  letter-spacing: 0.5px;
}

.app-header__subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

**Tokens aplicados**: `--color-header-gradient`, `--font-size-xl`, `--font-weight-bold`, `--spacing-5`, `--spacing-8`, `--radius-xl`

---

### `.calc-card`

**Tipo**: Card de formulario de cálculo

**HTML**:
```html
<div class="calc-card">
  <div class="calc-card__header">
    <h2 class="calc-card__title">Datos de Misión</h2>
  </div>
  <form class="calc-card__body input-form">
    <!-- campos del formulario -->
  </form>
</div>
```

**CSS**:
```css
.calc-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: var(--border-width) solid var(--color-border);
  overflow: hidden;
  flex: 0 0 320px;
}

.calc-card__header {
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-surface);
}

.calc-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.calc-card__body {
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
```

**Tokens aplicados**: `--color-surface`, `--radius-lg`, `--shadow-md`, `--color-border`, `--font-size-lg`, `--font-weight-semibold`, `--spacing-4`, `--spacing-5`

---

### `.form-input`

**Tipo**: Inputs de texto, número y selects

**Estados**: default, :focus, :disabled, :invalid

**HTML**:
```html
<div class="form-group">
  <label class="form-label" for="distancia">Distancia (m)</label>
  <input class="form-input" type="number" id="distancia" placeholder="0" />
</div>

<div class="form-group">
  <label class="form-label" for="municion">Munición</label>
  <select class="form-input form-select" id="municion">
    <option>Ch0</option>
    <option>Ch1</option>
    <option>Ch2</option>
  </select>
</div>
```

**CSS**:
```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  color: var(--color-text);
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.15);
}

.form-input:disabled {
  background: var(--color-background);
  color: var(--color-secondary-light);
  cursor: not-allowed;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  padding-right: var(--spacing-8);
}
```

**Tokens aplicados**: `--color-border`, `--color-border-focus`, `--radius-sm`, `--font-size-base`, `--font-size-sm`, `--font-weight-medium`, `--spacing-1`, `--spacing-2`, `--spacing-3`

---

### `.btn-primary` · `.btn-secondary` · `.btn-danger`

**Tipo**: Botones de acción

**Estados**: default, :hover, :active, :disabled

**HTML**:
```html
<button class="btn btn-primary">Calcular</button>
<button class="btn btn-secondary">Recalcular</button>
<button class="btn btn-danger">Borrar</button>
```

**CSS**:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-5);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Primario — azul turquesa */
.btn-primary {
  background: var(--color-primary-gradient);
  color: #ffffff;
  box-shadow: var(--shadow-primary);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a8f8 0%, #00d4e0 100%);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.45);
}

/* Secundario — gris */
.btn-secondary {
  background: var(--color-surface);
  color: var(--color-secondary);
  border: var(--border-width) solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background);
  border-color: var(--color-secondary-light);
}

/* Danger — rojo suave */
.btn-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: var(--border-width) solid rgba(239, 68, 68, 0.2);
}

.btn-danger:hover:not(:disabled) {
  background: #fecaca;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}
```

**Tokens aplicados**: `--color-primary-gradient`, `--shadow-primary`, `--color-danger`, `--color-danger-bg`, `--radius-md`, `--font-weight-semibold`, `--spacing-2`, `--spacing-5`

---

### `.results-panel` + `.charge-card`

**Tipo**: Panel horizontal de resultados por carga

**Estados de `.charge-card`**: default (fuera de rango / en rango) · `--recomendada` (destacada en verde)

**HTML**:
```html
<section class="results-panel">
  <h2 class="results-panel__title">Resultados por Carga</h2>
  <div class="results-panel__grid">

    <!-- Carga recomendada -->
    <div class="charge-card charge-card--recomendada">
      <div class="charge-card__header">
        <span class="charge-card__name">CH1</span>
        <span class="badge badge--success">RECOMENDADA</span>
      </div>
      <div class="charge-card__metric">
        <span class="charge-card__label">Elevación</span>
        <span class="charge-card__value">847.50 mils</span>
      </div>
      <div class="charge-card__metric">
        <span class="charge-card__label">Azimuth</span>
        <span class="charge-card__value">3200.00 mils</span>
      </div>
      <div class="charge-card__metric">
        <span class="charge-card__label">Tiempo vuelo</span>
        <span class="charge-card__value">12.40 s</span>
      </div>
    </div>

    <!-- Carga en rango (secundaria) -->
    <div class="charge-card charge-card--en-rango">
      <!-- ... mismo estructura ... -->
    </div>

    <!-- Carga fuera de rango -->
    <div class="charge-card charge-card--fuera-rango">
      <div class="charge-card__header">
        <span class="charge-card__name">CH0</span>
        <span class="badge badge--danger">FUERA DE RANGO</span>
      </div>
    </div>

  </div>
</section>
```

**CSS**:
```css
.results-panel {
  flex: 1 1 auto;
  min-width: 0;
}

.results-panel__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--spacing-4) 0;
}

.results-panel__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

/* Card base */
.charge-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-4);
  transition: box-shadow 0.2s ease, transform 0.1s ease;
}

.charge-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Carga RECOMENDADA */
.charge-card--recomendada {
  border-color: var(--color-success);
  border-width: 2px;
  box-shadow: var(--shadow-lg);
  background: linear-gradient(160deg, #ffffff 60%, var(--color-success-bg) 100%);
}

/* Carga FUERA DE RANGO */
.charge-card--fuera-rango {
  opacity: 0.55;
  background: var(--color-background);
}

.charge-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
}

.charge-card__name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.charge-card--recomendada .charge-card__name {
  color: var(--color-success);
}

.charge-card__metric {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--spacing-1) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}

.charge-card__metric:last-child {
  border-bottom: none;
}

.charge-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.charge-card__value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.charge-card--recomendada .charge-card__value {
  color: var(--color-success);
}
```

**Tokens aplicados**: `--color-success`, `--color-success-bg`, `--shadow-lg`, `--radius-lg`, `--font-size-lg`, `--font-weight-bold`, `--spacing-1`, `--spacing-3`, `--spacing-4`

---

### `.badge`

**Tipo**: Etiqueta de estado (pill)

**Variantes**: `badge--success`, `badge--warning`, `badge--danger`, `badge--info`

**HTML**:
```html
<span class="badge badge--success">RECOMENDADA</span>
<span class="badge badge--warning">FUEGO INDIRECTO</span>
<span class="badge badge--danger">FUERA DE RANGO</span>
```

**CSS**:
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
}

.badge--success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.badge--info {
  background: rgba(79, 172, 254, 0.15);
  color: var(--color-primary-dark);
}
```

**Tokens aplicados**: `--radius-full`, `--font-size-xs`, `--font-weight-bold`, `--color-success-bg`, `--color-warning-bg`, `--color-danger-bg`, `--spacing-2`

---

### `.mission-table`

**Tipo**: Tabla de historial de misiones

**HTML**:
```html
<section class="mission-table-section">
  <div class="mission-table-section__header">
    <h2 class="mission-table-section__title">Historial de Misiones</h2>
  </div>
  <div class="mission-table-wrapper">
    <table class="mission-table">
      <thead>
        <tr>
          <th></th>
          <th>Altura Propia</th>
          <th>Denominación</th>
          <th>Munición</th>
          <th>Distancia</th>
          <th>Altura</th>
          <th>Rumbo</th>
          <th>Elevación</th>
          <th>Azimuth</th>
          <th>Tiempo (s)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <!-- TableRow items -->
      </tbody>
    </table>
  </div>
</section>
```

**CSS**:
```css
.mission-table-section {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: var(--border-width) solid var(--color-border);
  overflow: hidden;
}

.mission-table-section__header {
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: var(--border-width) solid var(--color-border);
}

.mission-table-section__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.mission-table-wrapper {
  overflow-x: auto;
}

.mission-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.mission-table thead tr {
  background: var(--color-background);
}

.mission-table th {
  padding: var(--spacing-3) var(--spacing-4);
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}

.mission-table td {
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  font-variant-numeric: tabular-nums;
  vertical-align: middle;
}

.mission-table tbody tr:hover {
  background: var(--color-surface-hover);
}

.mission-table tbody tr:last-child td {
  border-bottom: none;
}

/* Columna de acciones */
.mission-table td:first-child,
.mission-table th:first-child {
  width: 40px;
  text-align: center;
}

/* Valor numérico destacado */
.mission-table .cell--numeric {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

/* Fila con carga recomendada */
.mission-table tr.row--recomendada td {
  background: rgba(16, 185, 129, 0.04);
}
```

**Tokens aplicados**: `--color-surface`, `--color-background`, `--shadow-md`, `--radius-lg`, `--font-size-sm`, `--font-size-xs`, `--font-weight-medium`, `--spacing-3`, `--spacing-4`, `--spacing-5`

---

### `.indirect-fire-card`

**Tipo**: Card de fuego indirecto (feature nueva)

**HTML**:
```html
<section class="indirect-fire-card">
  <div class="indirect-fire-card__header">
    <h2 class="indirect-fire-card__title">Fuego Indirecto</h2>
    <span class="badge badge--warning">MODO AVANZADO</span>
  </div>
  <div class="indirect-fire-card__body">
    <!-- campos adicionales de fuego indirecto -->
  </div>
</section>
```

**CSS**:
```css
.indirect-fire-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: var(--border-width) solid var(--color-border);
  border-left: 4px solid var(--color-warning);
  overflow: hidden;
}

.indirect-fire-card__header {
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, var(--color-warning-bg) 0%, var(--color-surface) 60%);
}

.indirect-fire-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.indirect-fire-card__body {
  padding: var(--spacing-5);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}
```

**Tokens aplicados**: `--color-warning`, `--color-warning-bg`, `--radius-lg`, `--shadow-md`, `--spacing-4`, `--spacing-5`

---

## Notas de implementación

### 1. Aplicación de CSS Custom Properties

Agregar el bloque `:root` en `src/index.css` (antes del selector `body`). No crear un archivo separado para evitar problemas de orden de importación en React.

```css
/* src/index.css — añadir al inicio del archivo */
:root {
  /* ... (copiar bloque completo de la sección Variables CSS) ... */
}
```

### 2. Migración de clases actuales → clases nuevas

| Clase actual | Clase nueva | Archivo |
|---|---|---|
| `.App` | `.App` + añadir `background: var(--color-background)` | `App.css` |
| `.input-form` | Mantener como `.calc-card__body input-form` | `InputForm.css` |
| `.resultados-cargas` | `.results-panel` | `InputForm.css` |
| `.carga-recomendada-principal` | `.charge-card.charge-card--recomendada` | `InputForm.css` |
| `.badge-recomendada` | `.badge.badge--success` | `InputForm.css` |
| `.carga-row.secundaria` | `.charge-card.charge-card--en-rango` | `InputForm.css` |
| `.carga-row.fuera-de-rango` | `.charge-card.charge-card--fuera-rango` | `InputForm.css` |
| `.table` | `.mission-table` | `Table.css` |
| `.numberbox` | `.form-group` con `.form-input` type="number" | `NumberBox.css` |

### 3. Sin dependencias externas

Todo el sistema de diseño usa:
- CSS Custom Properties nativas (soporte en todos los navegadores modernos)
- `display: flex` y `display: grid` para layout
- `transition` para animaciones suaves
- NO se requiere `normalize.css`, `reset.css` ni ningún otro archivo externo

### 4. Fuente tipográfica

Se usa el font stack del sistema operativo (`'Segoe UI', system-ui, -apple-system, sans-serif`) que ya está parcialmente definido en `src/index.css`. No se requiere importar Google Fonts, manteniendo cero dependencias de red.

### 5. Paleta adaptada al contexto táctico-militar

La referencia visual es un dashboard comercial vistoso. La paleta fue **ajustada** para el contexto de ARMA 3:
- Se redujo la saturación del verde (`#43e97b` → solo en header y badge recomendada)
- El fondo es `#f5f7fa` (gris frío) en lugar de blanco puro, evitando contraste excesivo
- Las cards usan `border: 1px solid var(--color-border)` (no solo sombra) para legibilidad en pantallas brillantes
- Los valores numéricos usan `font-variant-numeric: tabular-nums` para alinear columnas perfectamente

### 6. Elementos no determinados (`unknown`)

| Elemento | Razón |
|----------|-------|
| Icono del header (logo) | No aplica — se usa texto `MK252` como marca |
| Fuente exacta del dashboard | La imagen usa probablemente `Nunito` o `Poppins`, pero se usa `Segoe UI` por compatibilidad sin CDN |
| Animación del área de gráfico | No aplica en este contexto (no hay gráficos en la calculadora) |

### 7. Responsive

En mobile (`< 768px`):
- `.results-panel__grid` cambia a `grid-template-columns: 1fr` (columna única)
- `.calc-card` deja de tener `flex: 0 0 320px` y pasa a `width: 100%`
- `.mission-table-wrapper` tiene `overflow-x: auto` para scroll horizontal

```css
@media (max-width: 768px) {
  .results-panel__grid {
    grid-template-columns: 1fr;
  }
  .calc-card {
    flex: 0 0 100%;
    width: 100%;
  }
  .app-header {
    border-radius: 0;
    padding: var(--spacing-4) var(--spacing-4);
  }
}
```

---

## Checklist de implementación para ui-builder

- [ ] Agregar bloque `:root` con todos los tokens en `src/index.css`
- [ ] Refactorizar `App.css` — layout general con flexbox vertical
- [ ] Refactorizar `InputForm.css` — `.calc-card` + `.results-panel` + `.charge-card`
- [ ] Refactorizar `Table.css` → `.mission-table` con estilos modernos
- [ ] Actualizar `NumberBox.css` → `.form-group` + `.form-input`
- [ ] Actualizar `SelectBox.css` → `.form-select` + chevron SVG
- [ ] Actualizar `TextBox.css` → `.form-group` + `.form-input`
- [ ] Añadir `.app-header` en `App.js` o `index.js`
- [ ] Añadir `.badge` y variantes en archivo de estilos global
- [ ] Preparar `.indirect-fire-card` para la feature nueva
- [ ] Añadir media query de responsive en `index.css`
