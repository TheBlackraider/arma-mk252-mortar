import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndirectFireForm from './IndirectFireForm';

describe('IndirectFireForm', () => {
  // Test 1: Renderiza los 4 campos numéricos
  it('renders 4 input fields', () => {
    render(<IndirectFireForm onCalculate={() => {}} />);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(4);
  });

  // Test 2: Renderiza el botón de submit
  it('renders submit button', () => {
    render(<IndirectFireForm onCalculate={() => {}} />);
    expect(screen.getByText(/calcular indirecto/i)).toBeInTheDocument();
  });

  // Test 3: Al hacer submit llama onCalculate con distancia y rumbo correctos
  // Caso: d_mo=500, rumbo_mo=0, d_oo=300, rumbo_relativo_oo=0
  // Norte-Norte: tx=0+0=0, ty=500+300=800 → distancia=800, rumbo=0
  it('calls onCalculate with triangulated result on submit', () => {
    const onCalculate = jest.fn();
    render(<IndirectFireForm onCalculate={onCalculate} />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '500' } }); // d_mo
    fireEvent.change(inputs[1], { target: { value: '0' } });   // rumbo_mo
    fireEvent.change(inputs[2], { target: { value: '300' } }); // d_oo
    fireEvent.change(inputs[3], { target: { value: '0' } });   // rumbo_relativo_oo
    fireEvent.click(screen.getByText(/calcular indirecto/i));
    expect(onCalculate).toHaveBeenCalledWith(
      expect.objectContaining({ distancia: 800, rumbo: 0, tipoFuego: 'indirecto' })
    );
  });

  // Test 4: tipoFuego siempre es 'indirecto' en el callback
  it('always passes tipoFuego indirecto', () => {
    const onCalculate = jest.fn();
    render(<IndirectFireForm onCalculate={onCalculate} />);
    fireEvent.click(screen.getByText(/calcular indirecto/i));
    expect(onCalculate).toHaveBeenCalledWith(
      expect.objectContaining({ tipoFuego: 'indirecto' })
    );
  });
});
