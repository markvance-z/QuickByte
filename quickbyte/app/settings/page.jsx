'use client'

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';
import styles from './settingsPage.module.css';
import { useRouter } from 'next/navigation';

const DEFAULT_AVATAR_URL = '/default-avatar.jpg';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR_URL);


    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            const {data: {user}, error: userError} = await supabase.auth.getUser();

            if (userError) {
                setError('Error fetching user: ' + userError.message);
                setAvatarUrl(DEFAULT_AVATAR_URL);
                setLoading(false);
                return;
            }

            if (user) {
                setEmail(user.email || '');

                const {data:profile, error:profileError} = await supabase
                    .from('profiles')
                    .select('username, avatar_url, avatar_filename')
                    .eq('id', user.id)
                    .single();
                    if (profileError && profileError.code !== 'PGRST116') {
                        setError('Error fetching profile: ' + profileError.message);
                        setAvatarUrl(DEFAULT_AVATAR_URL);
                    } else if (profile) {
                        setUsername(profile.username || '');
                        setAvatarUrl(profile.avatar_url || DEFAULT_AVATAR_URL);
                    } else {
                        setUsername(user.user_metadata?.username || '');
                        setAvatarUrl(DEFAULT_AVATAR_URL);
                    }
            } else {
                setUsername('');
                setEmail('');
                setAvatarUrl(DEFAULT_AVATAR_URL);
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
                setAvatarUrl(DEFAULT_AVATAR_URL);
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

        let newAvatarUrl = avatarUrl;
        let newFilename = null;
        if (avatarFile) {
            const {data: currentProfile} = await supabase
            .from('profiles')
            .select('avatar_filename')
            .eq('id', user.id)
            .single();

            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            newFilename = fileName;

            const {error: uploadError} = await supabase.storage
                .from('profile-pictures')
                .upload(fileName, avatarFile, {
                    cacheControl: 'no-store',
                    upsert: false,
            });

            if (uploadError) {
                setError('Error uploading avatar: ' + uploadError.message);
                setLoading(false);
                return;
            }

            const {data: publicUrlData} = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName);

            newAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

            const defaultFilename = DEFAULT_AVATAR_URL.split('/').pop();
            if (currentProfile?.avatar_filename !== defaultFilename) {
                const {error: deleteError} = await supabase.storage
                    .from('profile-pictures')
                .remove([currentProfile.avatar_filename])
            
                if (deleteError) {
                    console.warn('Could not delete old avatar file: ', deleteError.message);
                }
            }
        }

        try {
            const updateData = {
                id: user.id,
                username: username,
                email: user.email,
                avatar_url: newAvatarUrl
            };

            if (newFilename) {
                updateData.avatar_filename = newFilename;
            } else if (!avatarFile && avatarUrl === DEFAULT_AVATAR_URL) {
                updateData.avatar_filename = null;
            }

            const {error: updateError} = await supabase
                .from('profiles')
                .upsert(updateData, {onConflict: 'id'});
            
            if (updateError) {
                throw updateError;
            }

            setMessage('Profile updated successfully!');
            setAvatarUrl(newAvatarUrl);
            setAvatarFile(null);
        } catch (updateError) {
            setError('Error updating profile: ' + updateError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetAvatar = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        
        const {data: {user}, error: userError} = await supabase.auth.getUser();

        if (userError || !user) {
            setError('User not authenticated')
            setLoading(false);
            return;
        }

        try {
            const {data: currentProfile} = await supabase
                .from('profiles')
                .select('avatar_filename')
                .eq('id', user.id)
                .single();
            
            if (currentProfile?.avatar_filename && currentProfile.avatar_filename !== DEFAULT_AVATAR_URL.split('/').pop()) {
                const {error: deleteError} = await supabase.storage
                    .from('profile-pictures')
                    .remove([currentProfile.avatar_filename]);
                
                if (deleteError) {
                    console.warn('Could not delte old avatar file during reset: ', deleteError.message);
                }
            }

            const {error: updateError} = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: currentProfile.email || user.email,
                    avatar_url: null,
                    avatar_filename: null
                }, {onConflict: 'id'});
            
            if (updateError) {
                throw updateError;
            }

            setMessage('Avatar reset to default!');
            setAvatarUrl(DEFAULT_AVATAR_URL);
            setAvatarFile(null);
        } catch (resetError) {
            setError('Error resetting avatar: ' + resetError.message);
        } finally {
            setLoading(false);
        }
    }

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
                            <label className={styles.label}>Current Avatar:</label>
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                width={100}
                                height={100}
                                className={styles.currentAvatar}
                            />
                            {avatarUrl !== DEFAULT_AVATAR_URL && (
                                <button
                                    type="button"
                                    onClick={handleResetAvatar}
                                    className={`${styles.button} ${styles.dangerButton}`}
                                    disabled={loading}
                                    style={{marginTop: '10px'}}
                                >
                                    Reset to Default Avatar
                                </button>
                            )}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="avatar" className={styles.label}>Upload Avatar:</label>
                        <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={(e) => setAvatarFile(e.target.files[0])}
                            className={styles.input}
                        />
                    </div>
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
        </div>
    );
}