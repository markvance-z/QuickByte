'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from '../../lib/supabaseClient';
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [allRecipes, setAllRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [session, setSession] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    total_minutes: '',
    nutrition: '',
    ingredients_name: '',
    steps: '',
    tag_name: ''
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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

  // Recipe search
  const getRecipes = async (query) => {
    const { data, error } = await supabase
      .from("recipes")
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

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          ...formData,
          total_minutes: parseInt(formData.total_minutes) || null,
          created_at: new Date().toISOString(),
          user_id: session.user.id,
        }
      ]);

    if (error) {
      setFormError(error.message);
    } else {
      alert("Recipe added successfully!");
      setFormData({
        title: '',
        author: '',
        description: '',
        total_minutes: '',
        nutrition: '',
        ingredients_name: '',
        steps: '',
        tag_name: ''
      });
      setShowAddForm(false); // hide form after submission
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
        onClick={() => setShowAddForm(prev => !prev)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        {showAddForm ? "Hide" : "Add Recipe"}
      </button>

      {/* Add Recipe Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="mb-6 space-y-2 max-w-xl border p-4 rounded bg-gray-50">
          <input name="title" placeholder="Title" value={formData.title} onChange={handleFormChange} required className="w-full border px-2 py-1" />
          <input name="author" placeholder="Author" value={formData.author} onChange={handleFormChange} className="w-full border px-2 py-1" />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} className="w-full border px-2 py-1" />
          <input name="total_minutes" type="number" placeholder="Total Minutes" value={formData.total_minutes} onChange={handleFormChange} className="w-full border px-2 py-1" />
          <input name="nutrition" placeholder="Nutrition Info" value={formData.nutrition} onChange={handleFormChange} className="w-full border px-2 py-1" />
          <textarea name="ingredients_name" placeholder="Ingredients" value={formData.ingredients_name} onChange={handleFormChange} className="w-full border px-2 py-1" />
          <textarea name="steps" placeholder="Steps" value={formData.steps} onChange={handleFormChange} className="w-full border px-2 py-1" />
          <input name="tag_name" placeholder="Tag Name" value={formData.tag_name} onChange={handleFormChange} className="w-full border px-2 py-1" />
          <button type="submit" disabled={formLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {formLoading ? "Adding..." : "Add Recipe"}
          </button>
          {formError && <p className="text-red-600">Error: {formError}</p>}
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
      </div>

      {/* Search Results */}
      {allRecipes.length > 0 && (
        <div>
          <h3>Search Results</h3>
          <ul>
            {allRecipes.map(recipe => (
              <li
                key={recipe.recipe_id}
                className="cursor-pointer underline text-blue-700"
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
          <p><strong>{selectedRecipe.title} ingredients:</strong> {selectedRecipe.ingredients_name}</p>
          <button
            onClick={() => setSelectedRecipe(null)}
            className="mt-2 text-sm text-blue-500 underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}





