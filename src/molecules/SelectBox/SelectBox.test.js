import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectBox from './SelectBox';

describe('SelectBox — disabled prop', () => {
  it('renders disabled select when disabled prop is true', () => {
    render(<SelectBox label="Test" options={[]} disabled={true} value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders enabled select when disabled prop is false', () => {
    render(<SelectBox label="Test" options={[]} disabled={false} value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('renders enabled select when disabled prop is absent', () => {
    render(<SelectBox label="Test" options={[]} value="" onChange={() => {}} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });
});
