# Status: ui-redesign-indirect-fire

**Proyecto:** arma-mk252-mortar  
**Feature:** ui-redesign-indirect-fire  
**Rama:** `feature/ui-redesign-indirect-fire`  
**Fecha de creación:** 2026-03-13  
**Estado actual:** `GATE_1_PENDING`

---

## Progreso de hitos

| Hito | Nombre | Estado |
|------|--------|--------|
| 1 | Reducer — nuevas acciones + triangulateObserver | ⏳ Pendiente |
| 2 | UI Redesign — CSS global + tokens | ⏳ Pendiente (bloqueante: design-spec.md) |
| 3 | Selector munición deshabilitado | ⏳ Pendiente |
| 4 | Botones borrar fila y tabla | ⏳ Pendiente |
| 5 | Formulario fuego indirecto + badge INDIRECTO | ⏳ Pendiente |

---

## Historial de cambios de estado

| Fecha | Estado anterior | Estado nuevo | Actor | Motivo |
|-------|----------------|--------------|-------|--------|
| 2026-03-13 | — | GATE_1_PENDING | Analyst | Documentos generados, esperando aprobación de GATE 1 |

---

## Artefactos generados

- `doc/features/ui-redesign-indirect-fire/refined-requirements.md` ✅
- `doc/features/ui-redesign-indirect-fire/implementation-plan.md` ✅
- `doc/features/ui-redesign-indirect-fire/status.md` ✅ (este archivo)
- `doc/features/ui-redesign-indirect-fire/design-spec.md` ⏳ (pendiente — ui-inspector)

---

## Notas

- El Hito 2 (UI Redesign) tiene una dependencia externa: `design-spec.md` debe estar disponible antes de que TDD-Dev inicie ese hito
- La rama `feature/ui-redesign-indirect-fire` se crea desde `feature/bugfix-and-improvements` en GATE 1
- Tests base: 68/68 GREEN (de `feature/bugfix-and-improvements`)
