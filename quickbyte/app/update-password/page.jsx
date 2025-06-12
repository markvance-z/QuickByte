'use client'

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';
import styles from './updatePassword.module.css';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setShowPasswordForm(true);
            } else {
                setError('Invalid or expired password reset link. Please try again.');
                setShowPasswordForm(false);
            }
        });

        const checkUserSession = async () => {
            setLoading(true);
            const {data: {session}, error: sessionError} = await supabase.auth.getSession();
            if (sessionError) {
                setError(sessionError.message);
            } else if (session) {
                setShowPasswordForm(true);
            } else {
                setError('Plase use the password reset link from your email.');
            }
            setLoading(false);
        }
        checkUserSession();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            const {error: updateError} = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                throw updateError;
            }

            setMessage('Your password has been updated successfully! You can now log in with your new password. Redirecting to dashboard...');
            setTimeout(() => {
                router.push('/dashboard');
            }, 4000);
        } catch (updateError) {
            setError('Error updating password: '+ updateError.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Update Your Password</h1>
            {showPasswordForm ? (
                <form onSubmit={handlePasswordUpdate} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>New Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Updating...' : 'UpdatePassword'}
                    </button>
                    {message && <p className={styles.successMessage}>{message}</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}
                </form>
            ) : (
                <p className={styles.errorMessage}>
                    {error || 'Please click the password reset link from your email to update your password'}
                </p>
            )}
        </div>
    );
}