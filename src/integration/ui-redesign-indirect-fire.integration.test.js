import React from 'react';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mocking the reducer to control the state for tests
jest.mock('../lib/main.reducer', () => {
  const original = jest.requireActual('../lib/main.reducer');
  return {
    ...original,
    initialState: {
      ...original.initialState,
      misiones: [],
      resultadosActuales: null,
    },
  };
});

describe('Integration: UI Redesign and Indirect Fire Feature', () => {
  
  const renderApp = () => render(<App />);

  const performDirectFireCalculation = async (distancia = '1000', denominacion = 'Test Target') => {
    const mainForm = screen.getByTestId('input-form');
    const denominationInput = within(mainForm).getByPlaceholderText(/Denominacion del objetivo/i);
    await userEvent.clear(denominationInput);
    await userEvent.type(denominationInput, denominacion);

    const distanceInput = within(mainForm).getByPlaceholderText(/Distancia/i);
    await userEvent.clear(distanceInput);
    await userEvent.type(distanceInput, distancia);

    await userEvent.click(within(mainForm).getByRole('button', { name: /Calcular/i }));
  };

  describe('UC-2: UI Redesign', () => {
    test('[Happy] Renders the modern layout with header and main content area', () => {
      renderApp();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('[Happy] Header contains the "MK252" brand text', () => {
      renderApp();
      const header = screen.getByRole('banner');
      expect(header).toHaveTextContent('MK252 Mortar Calculator');
    });
  });

  describe('UC-3: Ammunition Selector Disabled Logic', () => {
    test('[Happy] Ammo selector is disabled on initial load', () => {
      renderApp();
      const mainForm = screen.getByTestId('input-form');
      const selects = within(mainForm).getAllByRole('combobox');
      expect(selects[0]).toBeDisabled();
    });

    test('[Happy] Ammo selector is enabled after a valid first calculation', async () => {
      renderApp();
      await act(async () => {
        await performDirectFireCalculation();
      });
      const mainForm = screen.getByTestId('input-form');
      const selects = within(mainForm).getAllByRole('combobox');
      expect(selects[0]).toBeEnabled();
    });

    test('[Edge] Ammo selector remains disabled if the calculation is invalid', async () => {
      renderApp();
      await act(async () => {
        await performDirectFireCalculation('20'); // Invalid distance
      });
      const mainForm = screen.getByTestId('input-form');
      const selects = within(mainForm).getAllByRole('combobox');
      expect(selects[0]).toBeDisabled();
    });
  });

  describe('UC-4: Recalculate Existing Mission', () => {
    test('[Happy/Unhappy] Recalculating a mission updates it in-place and does not add a new row', async () => {
      renderApp();
      await act(async () => {
        await performDirectFireCalculation();
      });
      
      let historyRows = screen.getAllByRole('row');
      const initialCount = historyRows.length;
      expect(initialCount).toBeGreaterThanOrEqual(2); // header + at least 1 mission

      const missionRow = historyRows[1];
      const recalculateButton = missionRow.querySelector('.btn-action--recalc');
      
      await act(async () => {
        await userEvent.click(recalculateButton);
      });

      historyRows = screen.getAllByRole('row');
      expect(historyRows).toHaveLength(initialCount);
    });
  });

  describe('UC-5: Delete Mission(s)', () => {
    test('[Happy] Clicking "Borrar" on a row removes it from the history', async () => {
      renderApp();
      await act(async () => {
        await performDirectFireCalculation('1000', 'Mision 1');
      });
      await act(async () => {
        await performDirectFireCalculation('2000', 'Mision 2');
      });

      let historyRows = screen.getAllByRole('row');
      const initialCount = historyRows.length; // header + 2 missions

      const firstMissionRow = historyRows[1];
      const deleteButton = firstMissionRow.querySelector('.btn-action--delete');
      
      await act(async () => {
        await userEvent.click(deleteButton);
      });

      historyRows = screen.getAllByRole('row');
      expect(historyRows).toHaveLength(initialCount - 1);
    });

    test('[Happy] Clicking "Borrar todo" clears the entire history', async () => {
      renderApp();
      await act(async () => {
        await performDirectFireCalculation('1000', 'Mision 1');
      });
      await act(async () => {
        await performDirectFireCalculation('2000', 'Mision 2');
      });

      const clearAllButton = screen.getByRole('button', { name: /Borrar todo/i });
      await act(async () => {
        await userEvent.click(clearAllButton);
      });

      // After clearing, only the header row remains
      const historyRows = screen.getAllByRole('row');
      expect(historyRows).toHaveLength(1); // only thead row
    });

    test('[Edge] Clicking "Borrar todo" when history is empty does not cause an error', async () => {
        renderApp();
        const clearAllButton = screen.getByRole('button', { name: /Borrar todo/i });
        
        await act(async () => {
          await userEvent.click(clearAllButton);
        });
        
        // No rows except header
        const historyRows = screen.getAllByRole('row');
        expect(historyRows).toHaveLength(1);
    });
  });

  describe('UC-6: Indirect Fire Calculation', () => {
    const fillIndirectForm = async (d_mo = '400', rumbo_mo = '1600', d_oo = '300', rumbo_relativo = '800') => {
      const indirectCard = document.querySelector('.indirect-fire-card');
      const inputs = indirectCard.querySelectorAll('input[type="number"]');
      await userEvent.clear(inputs[0]);
      await userEvent.type(inputs[0], d_mo);
      await userEvent.clear(inputs[1]);
      await userEvent.type(inputs[1], rumbo_mo);
      await userEvent.clear(inputs[2]);
      await userEvent.type(inputs[2], d_oo);
      await userEvent.clear(inputs[3]);
      await userEvent.type(inputs[3], rumbo_relativo);
    };

    test('[Happy] Indirect fire form is present in the DOM', () => {
        renderApp();
        expect(screen.getByText(/Fuego Indirecto por Observador/i)).toBeInTheDocument();
        expect(document.querySelector('.indirect-fire-card')).toBeInTheDocument();
    });

    test('[Happy] A valid indirect fire calculation adds a row with an "INDIRECTO" badge', async () => {
        renderApp();
        await act(async () => {
          await fillIndirectForm();
          await userEvent.click(screen.getByRole('button', { name: /Calcular Indirecto/i }));
        });

        const historyRows = await screen.findAllByRole('row');
        expect(historyRows.length).toBeGreaterThanOrEqual(2); // header + at least 1 mission

        const missionRow = historyRows[1];
        expect(within(missionRow).getByText(/INDIRECTO/i)).toBeInTheDocument();
    });

    test('[Unhappy] Calculation with all-zero values results in an invalid mission, not adding a row', async () => {
        renderApp();
        await act(async () => {
          await fillIndirectForm('0', '0', '0', '0');
          await userEvent.click(screen.getByRole('button', { name: /Calcular Indirecto/i }));
        });
        
        const historyRows = screen.getAllByRole('row');
        expect(historyRows).toHaveLength(1); // only header
    });

    test('[Edge] Bearing of 6400 mils results in an invalid mission and does not add a row', async () => {
        renderApp();
        await act(async () => {
          await fillIndirectForm('500', '6400', '500', '3200');
          await userEvent.click(screen.getByRole('button', { name: /Calcular Indirecto/i }));
        });

        const historyRows = screen.getAllByRole('row');
        expect(historyRows).toHaveLength(1); // only header
    });
  });
});
