import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── Mock useReducer to control InputForm state ───────────────────────────────
const mockDispatch = jest.fn();

let mockState = {
  misiones: [],
  index: 1,
  alturaPropiaActual: 0,
  resultadoActual: 0,
  azimuthActual: 0,
  tiempoActual: 0,
  resultadosActuales: null,
};

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useReducer: (_reducer, _initial) => [mockState, mockDispatch],
  };
});

import InputForm from './InputForm';

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderWithState(state) {
  mockState = state;
  return render(<InputForm />);
}

// ─── Shared fixture ───────────────────────────────────────────────────────────
const stateWithResultados = {
  misiones: [],
  index: 2,
  alturaPropiaActual: 0,
  resultadoActual: 800.5,
  azimuthActual: 1066.667,
  tiempoActual: 13.5,
  resultadosActuales: {
    ch0: { elevacion: 800.5, azimuth: 1066.667, tiempo: 13.5, recomendada: true,  fuera_de_rango: false },
    ch1: { elevacion: 750.0, azimuth: 1066.667, tiempo: 28.4, recomendada: false, fuera_de_rango: false },
    ch2: { elevacion: 720.0, azimuth: 1066.667, tiempo: 40.7, recomendada: false, fuera_de_rango: true  },
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('InputForm — resultado-actual section', () => {
  beforeEach(() => {
    renderWithState({ ...stateWithResultados });
  });

  test('renders Elevación label in resultado-actual section', () => {
    const panel = document.querySelector('.resultado-actual');
    expect(panel).toBeInTheDocument();
    expect(panel.textContent).toMatch(/Elevación/);
  });

  test('renders Azimuth label in resultado-actual section', () => {
    const panel = document.querySelector('.resultado-actual');
    expect(panel).toBeInTheDocument();
    expect(panel.textContent).toMatch(/Azimuth/);
  });

  test('renders Tiempo vuelo label in resultado-actual section', () => {
    expect(screen.getByText(/Tiempo vuelo/)).toBeInTheDocument();
  });
});

describe('InputForm — resultados-cargas panel', () => {
  test('does not render results-panel when resultadosActuales is null', () => {
    renderWithState({
      ...stateWithResultados,
      resultadosActuales: null,
    });
    expect(document.querySelector('.results-panel')).toBeNull();
  });

  test('renders results-panel when resultadosActuales is set', () => {
    renderWithState({ ...stateWithResultados });
    expect(document.querySelector('.results-panel')).toBeInTheDocument();
  });

  test('renders RECOMENDADA badge on the recommended charge', () => {
    renderWithState({ ...stateWithResultados });
    expect(screen.getByText('RECOMENDADA')).toBeInTheDocument();
  });

  test('renders in-range non-recommended charge cards', () => {
    renderWithState({ ...stateWithResultados });
    expect(document.querySelector('.charge-card:not(.charge-card--recommended)')).toBeInTheDocument();
  });

  test('renders FUERA DE RANGO label for out-of-range charges', () => {
    renderWithState({ ...stateWithResultados });
    expect(screen.getByText('FUERA DE RANGO')).toBeInTheDocument();
    expect(document.querySelector('.charge-card--out-of-range')).toBeInTheDocument();
  });
});

describe('InputForm — pre-selection of recommended charge', () => {
  test('pre-selects municion selector with the recommended charge after calculation', () => {
    const stateWithCh2Rec = {
      ...stateWithResultados,
      resultadosActuales: {
        ch0: { elevacion: 720.0, azimuth: 0, tiempo: 40.7, recomendada: false, fuera_de_rango: true  },
        ch1: { elevacion: 750.0, azimuth: 0, tiempo: 28.4, recomendada: false, fuera_de_rango: true  },
        ch2: { elevacion: 800.5, azimuth: 0, tiempo: 13.5, recomendada: true,  fuera_de_rango: false },
      },
    };
    renderWithState(stateWithCh2Rec);
    // The select is the only combobox in the municion section of the form
    const selects = screen.getAllByRole('combobox');
    const municionSelect = selects[0];
    expect(municionSelect.value.toLowerCase()).toBe('ch2');
  });
});

describe('InputForm — municion selector disabled state', () => {
  test('municion selector is disabled when resultadosActuales is null', () => {
    renderWithState({
      ...stateWithResultados,
      resultadosActuales: null,
    });
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toBeDisabled();
  });

  test('municion selector is enabled when resultadosActuales is not null', () => {
    renderWithState({ ...stateWithResultados });
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).not.toBeDisabled();
  });

  test('municion selector shows ch0 as default before any calculation', () => {
    renderWithState({
      ...stateWithResultados,
      resultadosActuales: null,
    });
    const selects = screen.getAllByRole('combobox');
    expect(selects[0].value.toLowerCase()).toBe('ch0');
  });
});

describe('InputForm — Rumbo label in degrees', () => {
  // BUG 2: el label del campo Rumbo debe mostrar grados (°), no mils
  test('rumbo label shows degrees symbol (°)', () => {
    renderWithState({ ...stateWithResultados, resultadosActuales: null });
    const labels = screen.getAllByText(/Rumbo \(°\)/i);
    expect(labels.length).toBeGreaterThanOrEqual(1);
    // Al menos uno debe ser un label del formulario
    const formLabel = labels.find(el => el.tagName.toLowerCase() === 'label');
    expect(formLabel).toBeInTheDocument();
  });
});

describe('InputForm — municion selector keeps selection after recalculation (BUG 1)', () => {
  test('municion selector keeps user selection after recalculation', () => {
    // Primer render: ch0 es recomendada → el selector debe pre-seleccionar ch0
    const { rerender } = renderWithState({ ...stateWithResultados });
    const selects = screen.getAllByRole('combobox');
    const municionSelect = selects[0];
    // Verificar que ch0 fue pre-seleccionada
    expect(municionSelect.value.toLowerCase()).toBe('ch0');

    // Usuario cambia a ch1 manualmente
    fireEvent.change(municionSelect, { target: { value: 'ch1' } });
    expect(municionSelect.value.toLowerCase()).toBe('ch1');

    // Nuevo cálculo: resultadosActuales cambia pero ch0 sigue siendo recomendada
    const newResultados = {
      ch0: { elevacion: 810.0, azimuth: 1100.0, tiempo: 13.0, recomendada: true,  fuera_de_rango: false },
      ch1: { elevacion: 760.0, azimuth: 1100.0, tiempo: 28.0, recomendada: false, fuera_de_rango: false },
      ch2: { elevacion: 730.0, azimuth: 1100.0, tiempo: 40.0, recomendada: false, fuera_de_rango: true  },
    };
    mockState = { ...stateWithResultados, resultadosActuales: newResultados, index: 3 };
    rerender(<InputForm />);

    // El selector debe mantener la selección manual del usuario (ch1), no volver a ch0
    const selectsAfter = screen.getAllByRole('combobox');
    expect(selectsAfter[0].value.toLowerCase()).toBe('ch1');
  });
});
