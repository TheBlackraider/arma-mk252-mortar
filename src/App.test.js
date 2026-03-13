import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock InputForm to isolate App component
jest.mock('./organisms/InputForm/InputForm', () => () => <div data-testid="input-form" />);

it('renders app-header', () => {
  render(<App />);
  expect(document.querySelector('.app-header')).toBeInTheDocument();
});

it('renders app-main', () => {
  render(<App />);
  expect(document.querySelector('.app-main')).toBeInTheDocument();
});

it('renders title in header', () => {
  render(<App />);
  expect(document.querySelector('.app-header h1')).toHaveTextContent('MK252');
});
