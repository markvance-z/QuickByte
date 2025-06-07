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

      const userId = session.user.id;



      // Try to get the profile
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


  const getRecipes = async (query) => {
    console.log("searching for: ", query);
    const { data, error } = await supabase
      .from("recipes")
      .select()
      .textSearch("title", query)
      .limit(10);

      if (error) {
        console.log("error searching: ", error);
        return null;
      }

      setAllRecipes(data);
  };

  const resetSearch = () => {
    setAllRecipes([]);
    setQuery("");
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
  <>
    <div>
      <h1>Welcome to your dashboard, {username}!</h1>
    </div>   

    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes"
        className="border rounded px-2 py-1"
      />        

      <button
        onClick={() => {getRecipes(query)}}
        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Search
      </button>
      <button
        onClick={() => {resetSearch()}}
        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Reset
      </button>
    </div>

    {allRecipes.length > 0 && (
      <div>
        <h3>Search Results</h3>
        <ul>
          {allRecipes
            .map(recipe => (
              <li
                key={recipe.recipe_id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  console.log("Recipe clicked:", recipe);
                  setSelectedRecipe(recipe);
                }}
              >
                {recipe.title}
              </li>
            ))}
        </ul>
      </div>
    )}

    {selectedRecipe && (
      <div className="mt-4 p-4 border rounded bg-gray-100">
       
        <p>
          <strong>{selectedRecipe.title} ingredients:</strong> {selectedRecipe.ingedients}
        </p>
        <button
          onClick={() => setSelectedRecipe(null)}
          className="mt-2 text-sm text-blue-500 underline"
        >
          Close
        </button>
      </div>
    )}
  </>
);
}
