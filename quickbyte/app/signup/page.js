'use client';

import { useEffect, useState } from "react";
import supabase from '../../lib/supabaseClient';

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
            username: username
            },
        },
        });
    
        if (error) {
        setError(error.message);
        } else {
        // Redirect to the home page or dashboard
        window.location.href = "/";
        }
    
        setLoading(false);
        };
    
        return (
            <form onSubmit={handleSignUp}>
                <input 
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        );
    }