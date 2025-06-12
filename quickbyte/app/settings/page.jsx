'use client'

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';
import styles from './settingsPage.module.css';
import ThemeToggle from '../components/themeToggle';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
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
    };

    const handlePasswordReset = async () => {
        setLoading(true);
        setMessage('');
        setError('');

        const {data: {user}, error: userError} = await supabase.auth.getUser();

        if (userError || !user || !user.email) {
            setError('user email not found. Please log in or sign up before trying again.');
            return;
        }

        try {
            const {error: resetError} = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/update-password`
            });
            
            if (resetError) {
                throw resetError;
            }

            setMessage('Password reset email sent! Check your inbox.');
        } catch (resetError) {
            setError('Error sending password reset email: ' + resetError.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.container}>Loading Settings...</div>;
    }

    return (
        <div className={styles.container}>
            <button onClick={() => router.back()} className={styles.backButton}>
                &larr; Back
            </button>
            <h1 className={styles.title}>Settings</h1>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>User Profile</h2>
                <form onSubmit={handleUpdateProfile} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            className={styles.input}
                            disabled
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                    {message && <p className={styles.successMessage}>{message}</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}
                </form>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Account Actions</h2>
                <button
                    onClick={handlePasswordReset}
                    className={`${styles.button} ${styles.dangerButton}`}
                    disabled={loading}
                >
                    Reset Password
                </button>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Display Settings</h2>
                <div className={styles.themeToggleWrapper}>
                    <ThemeToggle />
                </div>
            </section>
        </div>
    );
}