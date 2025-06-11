'use client'

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';
import ThemeToggle from '../components/themeToggle';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            const {data: {user}, error: userError} = await supabase.auth.getUser();

            if (userError) {
                setError('Error fetching user: ' + userError.message);
                setLoading(false);
                return;
            }

            if (user) {
                setEmail(user.email ||'');

                const {data:profile, error:profileError} = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();
                    if (profileError && profileError.code !== 'PGRST116') {
                        setError('Error fetching profile: ' + profileError.message);
                    } else if (profile) {
                        setUsername(profile.username || '');
                    } else {
                        setUsername(user.user_metadata?.username || '');
                    }
            }
            setLoading(false);
        };

        fetchUserProfile();

        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserProfile();
            } else {
                setUsername('');
                setEmail('');
            }
        });
        
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const {data: {user}, error: userError} = await supabase.auth.getUser();

        if (userError || !user) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        try {
            const {error: updateError} = await supabase
            .from('profiles')
            .upsert({id: user.id, username: username, email: user.email}, {onConflict: 'id'});
            
            if (updateError) {
                throw updateError;
            }

            setMessage('Profile updated successfully!');
        } catch (updateError) {
            setError('Error updating profile: ' + updateError.message);
        } finally {
            setLoading(false);
        }
    }
};