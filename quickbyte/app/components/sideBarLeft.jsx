'use client';

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';

export default function SideBarLeft() {
    
    //Cat, short for categories
    const [openCats, setOpenCats] = useState(false);
    const [saved, setSaved] = useState([]);
    const [query, setQuery] = useState("");
    const [tags, setTags] = useState([]);
    const [openFilter, setOpenFilter] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showModal, setShowModal] = useState(false);

    //listen for auth changes. Update the saved list when auth state changes
    useEffect(() => {
        const {data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            loadSaved(session ? session.user : null);
        });

        loadSaved(supabase.auth.user);
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

    //function to count rows in each filtered list
    const counts = saved.reduce((acc, recipe) => {
        const title = recipe.recipes.title.toLowerCase();
        if(!title.includes(query.toLowerCase())) return acc;
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
    const toggleTag = tag => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id): [...prev, tag.id]);

    //Opens and closes the modal and displays selected recipe details
    const openRecipeModal = (recipe) => {
        setSelectedRecipe(recipe.recipes);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedRecipe(null);
        setShowModal(false);
    }

    return (
    <>
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
                {allCats.map(cat => (
                    <div key={cat}>
                        <button onClick={() => toggleCat(cat)}>
                            {openCats[cat] ? '▽' : '▷'} {cat} ({counts[cat]})
                        </button>
                        {openCats[cat] && (
                            <ul>
                                {saved
                                    .filter(recipe => recipe.category === cat)
                                    .filter(recipe => recipe.recipes.title.toLowerCase().includes(query.toLowerCase()))
                                    .map(recipe => (
                                        <li 
                                            key={recipe.recipe_id}
                                            onClick={() => openRecipeModal(recipe)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {recipe.recipes.title}
                                        </li>
                                    ))
                                }
                            </ul>
                        )}
                        </div>
                ))}
            </div>
        </div>
            {/* Modal for displaying recipe details */}
            {showModal && selectedRecipe && (
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
                        <span style={{
                            cursor: 'pointer',
                            float: 'right',
                            fontSize: '20px',
                        }} onClick={closeModal}>&times;</span>
                        <h1><strong>{selectedRecipe.title}</strong></h1>

                        <h2><strong>Description</strong></h2>
                        <p>{selectedRecipe.description}</p>

                        <h2><strong>Ingredients</strong></h2>
                        <p>{selectedRecipe.ingredients_name}</p>

                        <h2><strong>Steps</strong></h2>
                        <p>{selectedRecipe.steps}</p>

                        <h2>Time</h2>
                        <p>
                            {selectedRecipe.total_minutes < 60
                                ? `${selectedRecipe.total_minutes} minutes`
                                : `${Math.floor(selectedRecipe.total_minutes / 60)} hour${Math.floor(selectedRecipe.total_minutes / 60) > 1 ? 's' : ''} ${selectedRecipe.total_minutes % 60 ? selectedRecipe.total_minutes % 60 + ' minutes' : ''}`
                            }
                        </p>

                        <h3><p>{selectedRecipe.yield}</p></h3>

                        {/*Kaggle dataset shows nutrional information poorly. A link to a nutrional calculator API 
                        may be necessary for users to see accurate nutrional information.*/}
                        <h4>{selectedRecipe.nutrition}</h4>
                    </div>
                </div>
            )}
        </>
    );
}