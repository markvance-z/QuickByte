// Test to see if text("Please select a recipe") renders on the viewRecipe.  
import React from 'react';
import {render, screen } from '@testing-library/react';
import ViewRecipe from '../app/components/viewRecipe';

test('renders view recipe', () => {
    render(<ViewRecipe/>);
    expect(screen.getByText(/Please select a recipe./i)).toBeInTheDocument();
});