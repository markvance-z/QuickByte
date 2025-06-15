'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from '../../lib/supabaseClient';
import Link from "next/link";
import React from "react";

export default function Dashboard() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [allRecipes, setAllRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [session, setSession] = useState(null);
  const [randomRecipe, setRandomRecipe] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    description: '',
    ingredients: ''
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);

  // Fetch session and user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push("/login");
        return;
      }

      setSession(session);

      const userId = session.user.id;

      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setError("Failed to fetch profile: " + profileError.message);
        setLoading(false);
        return;
      }

      if (!profile) {
        const usernameFromMetadata = session.user.user_metadata?.username || "NewUser";

        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ id: userId, username: usernameFromMetadata, email: session.user.email }]);

        if (insertError) {
          setError("Failed to create profile: " + insertError.message);
          setLoading(false);
          return;
        }

        setUsername(usernameFromMetadata);
      } else {
        setUsername(profile.username);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  // Recipe search - FIXED: Changed from 'precipe' to 'precipes'
  const getRecipes = async (query) => {
    const { data, error } = await supabase
      .from("precipes") // Fixed table name
      .select()
      .textSearch("title", query)
      .limit(10);

    if (error) {
      console.log("Error searching:", error);
      return;
    }

    setAllRecipes(data);
  };

  const resetSearch = () => {
    setAllRecipes([]);
    setQuery("");
  };

  
  const getRandomRecipe = async () => {
  const { data, error } = await supabase
    .from('precipes')  
    .select('*');

  if (error) {
    console.error("Failed to generate random recipe: ", error);
    return;
  }

  if (data.length === 0) {
    console.warn("No recipes found.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * data.length);
  setRandomRecipe(data[randomIndex]);
  setSelectedRecipe(null); 
};
  
  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    // Debug logging
    console.log('Form data being submitted:', formData);

    // Prepare data for insertion
    const insertData = {
      title: formData.title.trim(),
      time: parseInt(formData.time) || null,
      description: formData.description.trim() || null,
      ingredients: formData.ingredients.trim() || null
      // Removed created_at - let Supabase handle it automatically
    };

    console.log('Data being inserted:', insertData);

    // FIXED: Changed table name and added .select()
    const { data, error } = await supabase
      .from('precipes') // Fixed table name
      .insert([insertData])
      .select(); // Added .select() to return inserted data

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Insert error:', error);
      setFormError(error.message);
    } else if (data && data.length > 0) {
      const newRecipe = data[0];
      console.log('Recipe inserted successfully:', newRecipe);
      setFormSuccess(`Recipe "${newRecipe.title}" added successfully!`);
      setFormData({
        title: '',
        time: '',
        description: '',
        ingredients: ''
      });
      setShowAddForm(false);

      // Refresh recipe list after adding new one
      if (query) {
        getRecipes(query);
      }
    } else {
      setFormError('No data returned from insert operation');
    }

    setFormLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Welcome to your dashboard, {username}!</h1>

      {/* Add Recipe Toggle Button */}
      <button
        onClick={() => {
          setShowAddForm(prev => !prev);
          setFormSuccess(null); // clear success message on toggle
          setFormError(null); // clear error message on toggle
        }}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        {showAddForm ? "Hide Form" : "Add Recipe"}
      </button>

      {/* Success message outside form so it persists */}
      {formSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {formSuccess}
        </div>
      )}

      {/* Add Recipe Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="mb-6 space-y-2 max-w-xl border p-4 rounded bg-gray-50">
          <input
            name="title"
            placeholder="Title *"
            value={formData.title}
            onChange={handleFormChange}
            required
            className="w-full border px-2 py-1 rounded"
          />
          <input
            name="time"
            type="number"
            placeholder="Time (minutes) *"
            value={formData.time}
            onChange={handleFormChange}
            required
            min="1"
            className="w-full border px-2 py-1 rounded"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleFormChange}
            className="w-full border px-2 py-1 rounded"
            rows="3"
          />
          <textarea
            name="ingredients"
            placeholder="Ingredients (optional)"
            value={formData.ingredients}
            onChange={handleFormChange}
            className="w-full border px-2 py-1 rounded"
            rows="3"
          />
          <button
            type="submit"
            disabled={formLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {formLoading ? "Adding..." : "Save Recipe"}
          </button>

          {formError && (
            <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {formError}
            </div>
          )}
        </form>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes"
          className="border rounded px-2 py-1"
        />
        <button
          onClick={() => getRecipes(query)}
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Search
        </button>
        <button
          onClick={resetSearch}
          className="ml-2 px-3 py-1 bg-gray-500 text-white rounded"
        >
          Reset
        </button>

        <button
          onClick={getRandomRecipe}
          className="ml-2 px-3 py-1 bg-green-600 text-white rounded"
        >
          Random Recipe
        </button>
            
      </div>

      {/* Search Results */}
      {allRecipes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Search Results</h3>
          <ul>
            {allRecipes.map(recipe => (
              <li
                key={recipe.id} // Fixed: changed from recipe.ID to recipe.id
                className="cursor-pointer underline text-blue-700 mb-1"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {recipe.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recipe Details */}
      {selectedRecipe && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <p><strong>{selectedRecipe.title}</strong></p>
          <p><strong>Time:</strong> {selectedRecipe.time} minutes</p>
          <p><strong>Description:</strong> {selectedRecipe.description}</p>
          <p><strong>Ingredients:</strong> {selectedRecipe.ingredients}</p>
          <button
            onClick={() => setSelectedRecipe(null)}
            className="mt-2 text-sm text-blue-500 underline"
          >
            Close
          </button>
        </div>
      )}

      {randomRecipe && (
    <div className="mt-4 p-4 border rounded bg-green-100">
      <h4 className="font-semibold">{randomRecipe.title}</h4>
      <p><strong>Time:</strong> {randomRecipe.time} minutes</p>
      <p><strong>Description:</strong> {randomRecipe.description || "No description available."}</p>
      <p><strong>Ingredients:</strong> {randomRecipe.ingredients || "Not listed."}</p>
      <button
        onClick={() => setRandomRecipe(null)}
        className="mt-2 text-sm text-green-700 underline"
      >
          Close
          </button>
        </div>
      )}
    </div>
  );
}



