import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TableRow } from './TableRow';
import { recalculateItem, deleteItem } from '../../lib/main.actions';

// Mock de sub-componentes para aislar TableRow
jest.mock('../../molecules/NumberBox/NumberBox', () =>
  ({ name, value }) => <input data-testid={`numberbox-${name}`} defaultValue={value} />
);
jest.mock('../../molecules/SelectBox/SelectBox', () =>
  ({ name, value }) => <select data-testid={`selectbox-${name}`} defaultValue={value}><option value={value}>{value}</option></select>
);

const buildItem = (overrides = {}) => ({
  key: 'test-1',
  alturaPropia: 100,
  denominacion: 'OBJ1',
  municion: 'Ch0',
  distancia: 300,
  altura: 50,
  rumbo: 45,
  resultado: 1234.56,
  azimuth: 270.0,
  tiempo: 1.5,
  ...overrides,
});

const noop = () => {};

describe('TableRow', () => {
  it('renders tiempo column with correct format', () => {
    const item = buildItem({ tiempo: 1.5 });
    render(<table><tbody><TableRow item={item} dispatcher={noop} /></tbody></table>);
    expect(screen.getByText('1.50s')).toBeInTheDocument();
  });

  it('renders tiempo with 2 decimal places', () => {
    const item = buildItem({ tiempo: 0.7 });
    render(<table><tbody><TableRow item={item} dispatcher={noop} /></tbody></table>);
    expect(screen.getByText('0.70s')).toBeInTheDocument();
  });

  it('dispatches recalculateItem on Recalcular click', () => {
    const dispatcher = jest.fn();
    const item = buildItem();
    render(<table><tbody><TableRow item={item} dispatcher={dispatcher} /></tbody></table>);
    fireEvent.click(screen.getByText(/recalcular/i));
    expect(dispatcher).toHaveBeenCalledWith(recalculateItem(expect.objectContaining({ key: item.key })));
  });

  it('dispatches deleteItem on Borrar click', () => {
    const dispatcher = jest.fn();
    const item = buildItem();
    render(<table><tbody><TableRow item={item} dispatcher={dispatcher} /></tbody></table>);
    fireEvent.click(screen.getByText(/borrar/i));
    expect(dispatcher).toHaveBeenCalledWith(deleteItem(item.key));
  });
});
