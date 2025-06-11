'use client';

import { useState, useEffect } from 'react';
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

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setUserId(data.session.user.id);
      } else {
        setError('You must be logged in to add a recipe.');
      }
    };

    getUser();
  }, []);

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
      .insert([
        {
          ...formData,
          total_minutes: parseInt(formData.total_minutes) || null,
          created_at: new Date().toISOString(),
          user_id: userId
        }
      ]);

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

  const inputStyle = {
    padding: '10px',
    fontSize: '1rem',
    border: '1px solid #555',
    borderRadius: '8px',
    width: '100%',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    boxSizing: 'border-box'
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #333',
        borderRadius: '12px',
        backgroundColor: '#111',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
      }}
    >
      <h2 style={{ textAlign: 'center', color: '#fff', marginBottom: '1.5rem' }}>
        Add a New Recipe
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '60%'
        }}
      >
        <input style={inputStyle} name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
        <input style={inputStyle} name="author" placeholder="Author" value={formData.author} onChange={handleChange} />
        <textarea style={inputStyle} name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3} />
        <input style={inputStyle} name="total_minutes" placeholder="Total Minutes" type="number" value={formData.total_minutes} onChange={handleChange} />
        <input style={inputStyle} name="nutrition" placeholder="Nutrition Info" value={formData.nutrition} onChange={handleChange} />
        <textarea style={inputStyle} name="ingredients_name" placeholder="Ingredients" value={formData.ingredients_name} onChange={handleChange} rows={3} />
        <textarea style={inputStyle} name="steps" placeholder="Steps" value={formData.steps} onChange={handleChange} rows={4} />
        <input style={inputStyle} name="tag_name" placeholder="Tag Name" value={formData.tag_name} onChange={handleChange} />

        <button
          type="submit"
          disabled={loading || !userId}
          style={{
            padding: '10px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4CAF50',
            color: '#fff',
            cursor: loading || !userId ? 'not-allowed' : 'pointer',
            opacity: loading || !userId ? 0.6 : 1
          }}
        >
          {loading ? 'Adding...' : 'Add Recipe'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>}
    </div>
  );
}


