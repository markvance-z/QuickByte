import { useState, useEffect } from 'react';
import supabase from '../../lib/supabaseClient';
import { useRouter } from "next/navigation";

export default function Logout() {
    const router = useRouter();
    const [user, setUser] = useState(null)
    const logoutButton = <button
        className="Btn"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        type="button"
      >
        Logout
      </button>;

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
                const currentUser = session ? session.user : null;
                setUser(currentUser);
        });

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
        return () => { listener.unsubscribe(); }
    }, []);

    if (!user) return null;

    return (
        <div>
            {logoutButton}
        </div>
    )
}