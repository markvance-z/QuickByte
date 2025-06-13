//Test for the functionality of the "toggle theme" button. It checks both light and dark mode. 
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../app/components/themeToggle';
import { ThemeProvider } from 'next-themes';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

function renderWithTheme(ui) {
  return render(<ThemeProvider attribute="class">{ui}</ThemeProvider>);
}

describe('ThemeToggle', () => {
  it('toggles theme mode on button click', async () => {
    renderWithTheme(<ThemeToggle />);
    const toggleButton = await screen.findByRole('switch');    
    const initialClass = document.documentElement.className;
    await userEvent.click(toggleButton);   
    const toggledClass = document.documentElement.className;
    expect(toggledClass).not.toBe(initialClass);  
    await userEvent.click(toggleButton);
    const toggledBackClass = document.documentElement.className;
    expect(toggledBackClass).toBe(initialClass);
  });
});
