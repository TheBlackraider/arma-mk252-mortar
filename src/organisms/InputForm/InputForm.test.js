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

describe('InputForm — no ammo selector in main form', () => {
  test('does not render any combobox/select in the main form section', () => {
    renderWithState({ ...stateWithResultados, resultadosActuales: null });
    // After removing the ammo SelectBox, there should be no combobox in the main form
    const form = screen.getByTestId('input-form');
    const selects = form.querySelectorAll('select');
    expect(selects.length).toBe(0);
  });

  test('Calcular button dispatches calculateItem without municion field', () => {
    renderWithState({ ...stateWithResultados });
    fireEvent.click(screen.getByText('Calcular'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.not.objectContaining({ municion: expect.anything() })
      })
    );
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

describe('InputForm — recommended charge used automatically (no manual selector)', () => {
  test('reducer CALCULATE_ITEM uses recommended charge for distance 300 (ch0)', () => {
    // This test verifies via the reducer directly that recommended charge is used
    // The form no longer has a municion selector — the reducer decides
    const { mainReducer: reducer, initialState: initState } = require('../../lib/main.reducer');
    const { CALCULATE_ITEM } = require('../../lib/main.actions');
    const result = reducer(initState, {
      type: CALCULATE_ITEM,
      payload: { distancia: 300, altura: 0, alturaPropia: 0, rumbo: 0 }
    });
    expect(result.misiones[0].municion).toBe('ch0');
  });
});
