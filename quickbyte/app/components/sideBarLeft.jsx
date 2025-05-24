import React from 'react';
import supabase from '../../lib/supabaseClient';


export default async function SideBarLeft() {
    const { data: user_saved } = await supabase.from("user_saved").select('*,recipes(*)');
    
    const { data: recipes } = await supabase.from("recipes").select();

    return <div>
            <span>▽ Uncategorized</span>
            <ul>
                {user_saved.map((user_save) => (
                    <li key={user_save.recipe_id}>{user_save.recipes.title}</li>
                ))}
            </ul>
        </div>
}