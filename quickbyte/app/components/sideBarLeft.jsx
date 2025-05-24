'use client';

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';

export default function SideBarLeft() {
    //Cat, short for categories
    const [openCats, setOpenCats] = useState(false);
    const [saved, setSaved] = useState([]);

    useEffect(() => {
        async function loadSaved() {
            const { data: user_saved } = await supabase.from("user_saved").select('*,recipes(*)');
            const formatted = user_saved.map(recipe => ({
                ...recipe,
                category: recipe.category ?? 'Uncategorized'
            }));
            setSaved(formatted);
        }
        loadSaved();
    }, []);

    const counts = saved.reduce((acc, recipe) => {
        acc[recipe.category] = (acc[recipe.category] || 0) + 1;
        return acc;
    }, {});
    
    counts.favorite = counts.favorite || 0;
    counts.Uncategorized = counts.Uncategorized || 0;

    //get more categories dynamically other than fav and uncat
    const dynamicCats = Array.from(
        new Set(saved.map(recipe => recipe.category))
    ).filter(cat => cat !== 'favorite' && cat !== 'Uncategorized');

    const allCats = ['favorite', ...dynamicCats, 'Uncategorized'];

    const toggleCat = cat => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));

    /*const renderSaved = () => {
        if (open) {return (
            <ul>
                {saved.map(recipe => (
                    <li key={recipe.recipe_id}>{recipe.recipes.title}</li>
                ))}
            </ul>
        );} else return null;
        
    };*/

    return (
        <div>
            {allCats.map(cat => (
                <div key={cat}>
                    <button onClick={() => toggleCat(cat)}>
                        {openCats[cat] ? '▽' : '▷'} {cat} ({counts[cat]})
                    </button>
                    {openCats[cat] && (
                        <ul>
                            {saved
                                .filter(recipe => recipe.category === cat)
                                .map(recipe => (
                                    <li key={recipe.recipe_id}>{recipe.recipes.title}</li>
                                ))
                            }
                        </ul>
                    )}
                    </div>
            ))}
        </div>
    );
}