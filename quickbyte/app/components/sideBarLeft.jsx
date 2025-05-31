'use client';

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';

export default function SideBarLeft() {
    
    //Cat, short for categories
    const [openCats, setOpenCats] = useState({});
    const [saved, setSaved] = useState([]);
    const [query, setQuery] = useState("");
    const [tags, setTags] = useState([]);
    const [openFilter, setOpenFilter] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);
    const [user, setUser] = useState(null);


    //listen for auth changes. Update the saved list when auth state changes
    useEffect(() => {
        const {data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session ? session.user : null;
            setUser(currentUser);
            loadSaved(session ? session.user : null);
        });

        supabase.auth.getUser().then(({ data: { user } }) => {
            loadSaved(user);
        });
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    //get tags from supabase when user saved is populated
    useEffect(() => {
        if (saved.length > 0) {
            loadTags();
        }
    }, [saved]);

    //get all recipes from supabase
    useEffect(() => {
        //invalid users can't search
        if (!user || !user.id) return;
        if (query.trim()) {
            searchRecipes(query);
        } else {
            setAllRecipes([]);
        }
    }, [query]);

    async function loadTags() {
        const recipeIds = saved.map(r => r.recipe_id);
        try {
            const {data: saved_tags, error} = await supabase
                .from('recipe_tags')
                .select('tag_id, tags(tag_name)')
                .in('recipe_id', recipeIds);
            
            const uniqueTags = Array.from(
                new Map(
                    saved_tags.map(({ tag_id, tags}) => [
                        tag_id,
                        { id: tag_id, name: tags.tag_name }
                    ])
                ).values()
            );

            setTags(uniqueTags);

        } catch (err) {
            console.error('load tags error: ', err);
        }
    };
    
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
    };

    //guards db
    if(!user || !user.id) { 
        return <div>Please log in or sign up to see recipes.</div>;
    }

    async function searchRecipes(q) {
        //another safeguard if search bar is exposed to unauthenticated users
        if (!user || !user.id) {
            console.error('User not authenticated');
            return;
        }
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .textSearch('search_text', q, { type: 'plain' })
                .limit(50)
                
            if( error) {
                console.error('Search error: ', error.message || error.details || error);
                return;
            }

            //Filter saved recipes based on search query
            if (!data) {
                setAllRecipes([...saved]);
                return;
            }
            const savedIds = new Set(saved.map((s) => s.recipe_id))
            const unsavedasUncat = data
                .filter((r) => !savedIds.has(r.id))
                .map((r) => ({
                    recipe_id: r.id,
                    recipes: r,
                    category: 'Uncategorized',
                }));

            setAllRecipes([...saved, ...unsavedasUncat]);
        } catch (err) {
            console.error('Search error: ', err);
        }
    };

    //function to count rows in each filtered list
    const counts = (query.trim() ? allRecipes : saved).reduce((acc, recipe) => {
        const title = recipe.recipes.title.toLowerCase();
        if (!title.includes(query.toLowerCase())) return acc;
        acc[recipe.category] = (acc[recipe.category] || 0) + 1;
        return acc;
    }, { favorite: 0, Uncategorized: 0 });  

    //get more categories dynamically other than fav and uncat
    const dynamicCats = Array.from(
        new Set(saved.map(recipe => recipe.category))
    ).filter(cat => cat !== 'favorite' && cat !== 'Uncategorized');

    //array for all categories
    const allCats = ['favorite', ...dynamicCats, 'Uncategorized'];

    //toggle which cats are open
    const toggleCat = cat => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));
    const toggleTag = tag => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id): [...prev, tag.id]);

    return (
        <div>
            <div> 
                <input type="text" placeholder="Search..." onChange={e => setQuery(e.target.value)} />
                <button onClick={() => setOpenFilter(!openFilter)}>+</button>
            </div>
            {openFilter && (
                <div>
                    <ul>
                        {tags.map(tag => (
                            <li key={tag.id}>
                                <label>
                                    <input 
                                        type="checkbox"
                                        value={tag.id}
                                        checked={selectedTags.includes(tag.id)} 
                                        onChange={() => toggleTag(tag)}
                                    />
                                {tag.name}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div>
                {allCats.map(cat => {
                    const filteredRecipes = (query.trim() ? allRecipes : saved)
                        .filter(recipe => recipe.category === cat)
                        .filter(recipe => recipe.recipes.title.toLowerCase().includes(query.toLowerCase()));
                    
                    return (
                        <div key={cat}>
                            <button onClick={() => toggleCat(cat)}>
                                {openCats[cat] ? '▽' : '▷'} {cat} ({counts[cat] || 0})
                            </button>
                            {openCats[cat] && (
                                <ul>
                                    {filteredRecipes.map((recipe, index) => (
                                        <li key={recipe.recipe_id || `temp-${index}`}>
                                            {recipe.recipes.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}