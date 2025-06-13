import React from 'react';
import {render, screen } from '@testing-library/react';
import Home from '../app/page';

test('renders home page', () => {
    render(<Home/>);
    expect(screen.getByText(/Welcome to QuickByte!/i)).toBeInTheDocument();
});