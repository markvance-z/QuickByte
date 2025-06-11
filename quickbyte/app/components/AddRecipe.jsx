'use client';
import { useState } from 'react';
import supabase from '../../lib/supabaseClient';

export default function AddRecipe() {
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    description: '',
    ingredients: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Debug: Log form data
      console.log('Form data before validation:', formData);

      // Validate required fields
      if (!formData.title.trim()) {
        setMessage({ type: 'error', text: 'Title is required' });
        setLoading(false);
        return;
      }

      if (!formData.time || parseInt(formData.time) <= 0) {
        setMessage({ type: 'error', text: 'Valid time is required' });
        setLoading(false);
        return;
      }

      // Prepare the data to insert
      const insertData = {
        title: formData.title.trim(),
        time: parseInt(formData.time),
        description: formData.description.trim() || null,
        ingredients: formData.ingredients.trim() || null
      };

      // Debug: Log what we're trying to insert
      console.log('Data being inserted:', insertData);

      // Insert into database - matches your 'precipes' table structure
      const { data, error } = await supabase
        .from('precipes')
        .insert([insertData])
        .select();

      // Debug: Log the response
      console.log('Supabase response:', { data, error });

      if (error) {
        console.error("Insert error details:", error);
        setMessage({ type: 'error', text: `Database error: ${error.message}` });
      } else if (data && data.length > 0) {
        const newRecipe = data[0];
        console.log("Recipe inserted successfully:", newRecipe);
        setMessage({ 
          type: 'success', 
          text: `Recipe "${newRecipe.title}" added successfully! ID: ${newRecipe.id}` 
        });
        
        // Reset form
        setFormData({
          title: '',
          time: '',
          description: '',
          ingredients: ''
        });
      } else {
        console.log("No data returned, but no error either");
        setMessage({ type: 'error', text: 'No data returned from insert operation' });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setLoading(false);
  };

  return (
    <div style={{ 
      maxWidth: 500, 
      margin: '2rem auto', 
      padding: '1rem', 
      border: '1px solid #ccc', 
      borderRadius: 8 
    }}>
      <h2>Add a Recipe</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title *"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ 
            width: '100%', 
            padding: 8, 
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        />
        
        <input
          name="time"
          type="number"
          min="1"
          placeholder="Time (minutes) *"
          value={formData.time}
          onChange={handleChange}
          required
          style={{ 
            width: '100%', 
            padding: 8, 
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        />
        
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          style={{ 
            width: '100%', 
            padding: 8, 
            marginBottom: 12,
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
        
        <textarea
          name="ingredients"
          placeholder="Ingredients (optional)"
          value={formData.ingredients}
          onChange={handleChange}
          rows={3}
          style={{ 
            width: '100%', 
            padding: 8, 
            marginBottom: 12,
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Recipe'}
        </button>
      </form>

      {message && (
        <p style={{ 
          marginTop: 12, 
          padding: 8,
          borderRadius: 4,
          backgroundColor: message.type === 'error' ? '#ffebee' : '#e8f5e8',
          color: message.type === 'error' ? '#c62828' : '#2e7d32',
          border: `1px solid ${message.type === 'error' ? '#ffcdd2' : '#c8e6c9'}`
        }}>
          {message.text}
        </p>
      )}
    </div>
  );
}