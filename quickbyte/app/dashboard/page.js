'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from '../../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome to your dashboard, {username}!</h1>
      <p>This is a protected route.</p>
    </div>
  );
}
