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
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    

    //listen for auth changes. Update the saved list when auth state changes
    useEffect(() => {
        const {data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session ? session.user : null;
            setUser(currentUser);
            loadSaved(session ? session.user : null);
        });

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);            
            loadSaved(user);
            setLoadingAuth(false);
        });

        return () => {
            listener.unsubscribe();
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
        const timeout = setTimeout(() => {
        //invalid users can't search
        if (!user || !user.id) return;         

        if (query.trim()) {
            searchRecipes(query);
        } else {
            setAllRecipes([]);
        }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
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
                    (saved_tags || []).map(({ tag_id, tags}) => [
                        tag_id,
                        { id: tag_id, name: tags?.tag_name }
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
                (user_saved || []).map((recipe) => ({
                    ...recipe,
                    category: recipe.recipes?.category ?? 'Uncategorized'
                }))
            );
        } catch (err) {
            console.error('loadSaved error: ', err);
            setSaved([]);
        }
    };     
    

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
            const unsavedAsUncat = data
                .filter((r) => !savedIds.has(r.id))
                .map((r) => ({
                    recipe_id: r.id,
                    recipes: r,
                    category: 'Uncategorized',
                }));

            setAllRecipes([...saved, ...unsavedAsUncat]);
        } catch (err) {
            console.error('Search error: ', err);
        }
    };

    const queryLower = query.toLowerCase().trim();

    //function to count rows in each filtered list
    const counts = (query.trim() ? allRecipes : saved).reduce((acc, recipe) => {
        const title = recipe.recipes?.title?.toLowerCase?.() || '';
        if (!title.includes(queryLower)) {
            return acc;
        }
        const category = recipe.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, { favorite: 0, Uncategorized: 0 });  

    //Opens and closes the modal and displays selected recipe details
    const openRecipeModal = (recipe) => {
        setSelectedRecipe(recipe.recipes);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedRecipe(null);
        setShowModal(false);
    }

    //get more categories dynamically other than fav and uncat
    const dynamicCats = Array.from(
        new Set(saved.map(recipe => recipe.category))
    ).filter(cat => cat !== 'favorite' && cat !== 'Uncategorized');

    //array for all categories
    const allCats = ['favorite', ...dynamicCats, 'Uncategorized'];

    //toggle which cats are open
    const toggleCat = cat => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));
    const toggleTag = tag => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id): [...prev, tag.id]);       

    /*potential search bar bug fix for unauthenticated users. Unauthenticated users can use search like authenticated users.

    if(loadingAuth || !user || !user.id) {
        return <div>Please log in or sign up to view recipes :)</div>
        
    }*/

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

                {/*Recipe categories*/}
                <div>                   
                    {allCats.map(cat => {
                        const filteredRecipes = (query.trim() ? allRecipes : saved)
                            .filter(recipe => recipe.category === cat)
                            .filter(recipe => recipe.recipes?.title?.toLowerCase?.().includes(queryLower));
                        
                        return (
                            <div key={cat}>
                                <button onClick={() => toggleCat(cat)}>
                                    {openCats[cat] ? '▽' : '▷'} {cat} ({counts[cat] || 0})
                                </button>
                                {openCats[cat] && (
                                    <ul>
                                        {filteredRecipes.map((recipe, index) => (
                                            <li key={recipe.recipe_id || `temp-${index}`}
                                                 onClick={() => openRecipeModal(recipe)}
                                                 style={{ cursor: 'pointer' }}>
                                                {recipe?.recipes?.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
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