'use client'
import React, {useState, useEffect} from "react";
import supabase from "../../lib/supabaseClient";
import styles from './profilePicture.module.css';

const DEFAULT_AVATAR_URL = '/default-avatar.jpg'
export default function ProfilePicture() {
    const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR_URL);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            
            try {
                const {data: {user}, error: userError} = await supabase.auth.getUser();
                
                if (userError) {
                    console.error("Error fetching user session:", userError);
                    setUser(null);
                    setAvatarUrl(DEFAULT_AVATAR_URL);
                    setIsLoading(false);
                    return;
                }

                if (user) {
                    setUser(user);
                    const {data: profile, error: profileError} = await supabase
                        .from('profiles')
                        .select('avatar_url')
                        .eq('id', user.id)
                        .single();
                    
                    if (profileError && profileError.code !== 'PGRST116') {
                        console.error("Error fetching user profile:", profileError);
                        setAvatarUrl(DEFAULT_AVATAR_URL);
                    } else if (profile && profile.avatar_url) {
                        setAvatarUrl(`${profile.avatar_url}?t=${Date.now()}`);
                    } else {
                        setAvatarUrl(DEFAULT_AVATAR_URL);
                    }
                } else {
                    setUser(null);
                    setAvatarUrl(null);
                }
            } catch (error) {
                console.error("Error in fetchUserProfile",  error);
                setAvatarUrl(DEFAULT_AVATAR_URL);
            } finally {
            setIsLoading(false);
            }
        };

        fetchUserProfile();

        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session ? session.user : null;
            setUser(currentUser);

            if (currentUser) {
                fetchUserProfile();
            } else {
                setAvatarUrl(null);
            }
        });

        return () => {
            if (subscription)
            subscription.unsubscribe();
        };
    }, []);

    if (isLoading) {
        return <div className={styles.profilePictureContainer}>Loading...</div>
    }
    if (!user) {
        return null;
    }

    return (
        <div className={styles.profilePictureContainer}>
            {avatarUrl && avatarUrl !== DEFAULT_AVATAR_URL ? (
                <img 
                    src={avatarUrl}
                    width={50}
                    height={50}
                    alt="Profile"
                    className={styles.ProfilePicture}
                    onError={(e) => {
                        console.error("Failed to load avatar image:", avatarUrl);
                        setAvatarUrl(DEFAULT_AVATAR_URL);
                    }}
                />
            ) : avatarUrl === DEFAULT_AVATAR_URL ? (
                <img
                    src={DEFAULT_AVATAR_URL}
                    width={50}
                    height={50}
                    alt="Default Profile"
                    className={styles.ProfilePicture}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                    }}
                />
            ) : null}
        </div>
    );
}