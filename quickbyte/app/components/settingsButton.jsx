'use client'

import React from "react";
import {useRouter, usePathname} from "next/navigation";
import styles from './settingsButton.module.css';

export default function SettingsButton() {
    const router = useRouter();
    const pathname = usePathname();
    
    const handleSettingsClick = () => {
        if (pathname === '/settings') {
            router.back();
        } else {
            router.push('/settings');
        }
    }
    return (
        <button className={styles.settingsButton} onClick={handleSettingsClick}>
                Settings
        </button>
    )
}