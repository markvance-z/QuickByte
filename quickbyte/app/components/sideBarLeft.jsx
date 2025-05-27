'use client';

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';

export default function SideBarLeft() {
    
    //Cat, short for categories
    const [openCats, setOpenCats] = useState(false);
    const [saved, setSaved] = useState([]);

    //listen for auth changes
    useEffect(() => {
        const {data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            loadSaved(session ? session.user : null);
        });

        loadSaved(supabase.auth.user);
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    async function loadSaved(user) {
        if (!user) {
            setSaved([]);
            return;
        }

        try {
            const { data: user_saved } = await supabase
                .from("user_saved")
                .select('*,recipes(*)')
                .eq('user_id', user.id);
            setSaved(
                user_saved.map((recipe) => ({
                    ...recipe,
                    category: recipe.category ?? 'Uncategorized'
                }))
            );
        } catch (err) {
            console.error('loadSaved error: ', err);
            setSaved([]);
        }
    }


    //function to count rows in each filtered list
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

    //array for all categories
    const allCats = ['favorite', ...dynamicCats, 'Uncategorized'];

    //toggle which cats are open
    const toggleCat = cat => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));

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