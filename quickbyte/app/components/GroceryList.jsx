'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GroceryList() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const router = useRouter();


  const addItem = () => {
    if (input.trim()) {
      setItems([...items, input.trim()]);
      setInput('');
    }
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const backtoDashboard = () => {
    router.push('/dashboard');
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2> Grocery List</h2>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          value={input}
          placeholder="e.g. eggs, milk"
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            marginRight: '8px',
          }}
        />
        <button
          onClick={addItem}
          style={{
            backgroundColor: '#1e1e1e',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              backgroundColor: '#f1f1f1',
              padding: '8px',
              marginBottom: '6px',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {item}
            <button
              onClick={() => removeItem(i)}
              style={{
                backgroundColor: '#ff5c5c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>          
          </li>
        ))}
      </ul>

        <button
              onClick={() => backtoDashboard()}
              style={{
                border: '2px solid rgba(158, 158, 158, 0.486)',
                backgroundColor: 'var(--background)',
                color: 'white',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
        </button>
    </div>
  );
}
