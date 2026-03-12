import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Table from './Table';

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
});
