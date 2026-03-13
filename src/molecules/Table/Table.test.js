import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Table from './Table';
import { clearTable } from '../../lib/main.actions';

// Mock de TableRow para aislar Table del árbol de sub-componentes
jest.mock('./TableRow', () => ({
  TableRow: ({ item }) => <tr><td>{item.key}</td></tr>,
}));

describe('Table', () => {
  it('renders Tiempo (s) header column', () => {
    const state = { misiones: [] };
    const noop = () => {};
    render(<Table state={state} dispatcher={noop} />);
    expect(screen.getByText('Tiempo (s)')).toBeInTheDocument();
  });

  it('renders Borrar todo button', () => {
    const dispatcher = jest.fn();
    const state = { misiones: [] };
    render(<Table state={state} dispatcher={dispatcher} />);
    expect(screen.getByText(/borrar todo/i)).toBeInTheDocument();
  });

  it('dispatches clearTable on Borrar todo click', () => {
    const dispatcher = jest.fn();
    const state = { misiones: [] };
    render(<Table state={state} dispatcher={dispatcher} />);
    fireEvent.click(screen.getByText(/borrar todo/i));
    expect(dispatcher).toHaveBeenCalledWith(clearTable());
  });
});
