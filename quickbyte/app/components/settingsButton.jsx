'use client'

import Link from "next/link";
import React from "react";
import styles from './settingsButton.module.css';

export default function SettingsButton() {
    return (
        <Link href="/settings" passHref>
            <button className={styles.settingsButton}>
                Settings
            </button>
        </Link>
    )
}