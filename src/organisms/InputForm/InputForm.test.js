import React from 'react';
import { render, screen } from '@testing-library/react';
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

  test('renders Elevación (mils): label in resultado-actual section', () => {
    expect(screen.getByText(/Elevación \(mils\):/)).toBeInTheDocument();
  });

  test('renders Azimuth (mils): label in resultado-actual section', () => {
    expect(screen.getByText(/Azimuth \(mils\):/)).toBeInTheDocument();
  });

  test('renders Tiempo de vuelo (s): label in resultado-actual section', () => {
    expect(screen.getByText(/Tiempo de vuelo \(s\):/)).toBeInTheDocument();
  });
});

describe('InputForm — resultados-cargas panel', () => {
  test('does not render resultados-cargas panel when resultadosActuales is null', () => {
    renderWithState({
      ...stateWithResultados,
      resultadosActuales: null,
    });
    expect(document.querySelector('.resultados-cargas')).toBeNull();
  });

  test('renders resultados-cargas panel when resultadosActuales is set', () => {
    renderWithState({ ...stateWithResultados });
    expect(document.querySelector('.resultados-cargas')).toBeInTheDocument();
  });

  test('renders RECOMENDADA badge on the recommended charge', () => {
    renderWithState({ ...stateWithResultados });
    expect(screen.getByText('RECOMENDADA')).toBeInTheDocument();
  });

  test('renders otras-cargas-en-rango section for non-recommended in-range charges', () => {
    renderWithState({ ...stateWithResultados });
    expect(screen.getByText('Otras opciones en rango')).toBeInTheDocument();
    expect(document.querySelector('.otras-cargas-en-rango')).toBeInTheDocument();
  });

  test('renders FUERA DE RANGO label for out-of-range charges', () => {
    renderWithState({ ...stateWithResultados });
    expect(screen.getByText('FUERA DE RANGO')).toBeInTheDocument();
    expect(document.querySelector('.carga-row.fuera-de-rango')).toBeInTheDocument();
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
