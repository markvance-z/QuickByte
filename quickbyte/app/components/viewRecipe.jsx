'use client';

import React from "react";

// Reference DVs (FDA guidelines)
const REFERENCE_VALUES = {
  totalFat: 78,   // grams
  sugars: 25,     // grams
  sodium: 2300,   // milligrams
  protein: 50,    // grams
  satFat: 20,     // grams
  carbs: 275      // grams
};

// Convert nutrition array into actual values
function convertNutrition(nutritionArray) {
    if (typeof nutritionArray === "string") {
    try {
      nutritionArray = JSON.parse(nutritionArray);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(nutritionArray) || nutritionArray.length < 7) return null;

  const [
    calories,
    fatPercent,
    sugarPercent,
    sodiumPercent,
    proteinPercent,
    satFatPercent,
    carbsPercent
  ] = nutritionArray.map(Number);

  return {
    calories: calories || 0,
    totalFat: (fatPercent / 100) * REFERENCE_VALUES.totalFat,       // g
    sugars: (sugarPercent / 100) * REFERENCE_VALUES.sugars,         // g
    sodium: (sodiumPercent / 100) * REFERENCE_VALUES.sodium,        // mg
    protein: (proteinPercent / 100) * REFERENCE_VALUES.protein,     // g
    saturatedFat: (satFatPercent / 100) * REFERENCE_VALUES.satFat,  // g
    carbohydrates: (carbsPercent / 100) * REFERENCE_VALUES.carbs    // g
  };
}

export default function ViewRecipe({ selectedRecipe, onClose }) {
  if (!selectedRecipe) return null;

  const nutrition = convertNutrition(selectedRecipe.nutrition);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <span
          style={{ cursor: 'pointer', float: 'right', fontSize: '20px' }}
          onClick={onClose}
        >
          &times;
        </span>

        <h1><strong>{selectedRecipe.title}</strong></h1>

        <h2><strong>Description</strong></h2>
        <p>{selectedRecipe.description}</p>

        <h2><strong>Ingredients</strong></h2>
        <p>{selectedRecipe.ingredients_name}</p>

        <h2><strong>Steps</strong></h2>
        <p>{selectedRecipe.steps}</p>

        <h2><strong>Time</strong></h2>
        <p>
          {selectedRecipe.total_minutes < 60
            ? `${selectedRecipe.total_minutes} minutes`
            : `${Math.floor(selectedRecipe.total_minutes / 60)} hour${Math.floor(selectedRecipe.total_minutes / 60) > 1 ? 's' : ''} ${selectedRecipe.total_minutes % 60 ? selectedRecipe.total_minutes % 60 + ' minutes' : ''}`
          }
        </p>

        <h3><p>{selectedRecipe.yield}</p></h3>

        {nutrition && (
          <>
            <h2><strong>Nutritional Info (per serving)</strong></h2>
            <ul>
              <li><strong>Calories:</strong> {nutrition.calories} kcal</li>
              <li><strong>Total Fat:</strong> {nutrition.totalFat.toFixed(2)} g</li>
              <li><strong>Sugars:</strong> {nutrition.sugars.toFixed(2)} g</li>
              <li><strong>Sodium:</strong> {nutrition.sodium.toFixed(2)} mg</li>
              <li><strong>Protein:</strong> {nutrition.protein.toFixed(2)} g</li>
              <li><strong>Saturated Fat:</strong> {nutrition.saturatedFat.toFixed(2)} g</li>
              <li><strong>Carbohydrates:</strong> {nutrition.carbohydrates.toFixed(2)} g</li>
            </ul>
          </>
        )}

        <div style={{marginTop: '1.5rem', fontSize: '1.0rem', color: 'gold', fontStyle: 'italic'}}>
          <p>Note: Nutritional values are estimates based on standard serving sizes and may vary based on specific ingredients used.</p>
          <br />
          <span style={{display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', color: 'goldenrod', fontStyle: 'normal'}}>
             Reference DVs: 78g fat, 25g sugar, 2300mg sodium, 50g protein, 20g sat fat, 275g carbs.
          </span>
        </div>
      </div>
    </div>
  );
}
