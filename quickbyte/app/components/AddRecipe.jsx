'use client';

import { useState } from 'react';
import supabase from '../../lib/supabaseClient';

export default function AddRecipe() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    total_minutes: '',
    nutrition: '',
    ingredients_name: '',
    steps: '',
    tag_name: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('recipes')
      .insert([{
        title: formData.title,
        author: formData.author,
        description: formData.description,
        total_minutes: parseInt(formData.total_minutes) || null,
        nutrition: formData.nutrition,
        ingredients_name: formData.ingredients_name,
        steps: formData.steps,
        tag_name: formData.tag_name,
        created_at: new Date().toISOString()  // Optional
      }]);

    if (error) {
      setError(error.message);
    } else {
      alert('Recipe added successfully!');
      setFormData({
        title: '',
        author: '',
        description: '',
        total_minutes: '',
        nutrition: '',
        ingredients_name: '',
        steps: '',
        tag_name: ''
      });
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Add a New Recipe</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
        <input name="author" placeholder="Author" value={formData.author} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        <input name="total_minutes" placeholder="Total Minutes" type="number" value={formData.total_minutes} onChange={handleChange} />
        <input name="nutrition" placeholder="Nutrition Info" value={formData.nutrition} onChange={handleChange} />
        <textarea name="ingredients_name" placeholder="Ingredients" value={formData.ingredients_name} onChange={handleChange} />
        <textarea name="steps" placeholder="Steps" value={formData.steps} onChange={handleChange} />
        <input name="tag_name" placeholder="Tag Name" value={formData.tag_name} onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Recipe'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
