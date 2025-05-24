'use client';

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';
 

export default function SideBarLeft() {
    const [open, setOpen] = useState(false);
    const [saved, setSaved] = useState([]);

    useEffect(() => {
        async function loadSaved() {
            const { data: user_saved } = await supabase.from("user_saved").select('*,recipes(*)');
            setSaved(user_saved);
        }
        loadSaved();
    }, []);

    const renderSaved = () => {
        if (open) {return (
            <ul>
                {saved.map(s => (
                    <li key={s.recipe_id}>{s.recipes.title}</li>
                ))}
            </ul>
        );} else return null;
        
    };

    return (
        <div>
            <button onClick={() => setOpen(o => !o)}>
                {open ? '▽' : '▷'} Uncategorized
            </button>
            {renderSaved()}
        </div>
    );
}