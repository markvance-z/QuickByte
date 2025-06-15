'use client'

import { useEffect, useState } from "react";
import styles from "./themeToggle.module.css";
import { useTheme } from "next-themes";
import { Switch } from "@headlessui/react";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";
import React from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);  
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null; // Prevents hydration mismatch
    }
    return (        
        <div className={styles.themeToggleContainer}>
        <Switch
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`${styles.switch} ${theme === "dark" ? styles.dark : styles.light}`}            
        >            
            {theme === "dark" ? (
                <MoonIcon className={styles.icon} />
            ) : (
                <SunIcon className={styles.icon} />
            )}
        </Switch>
        <span className={styles.toggleText}>Toggle Theme</span>
        </div>        
        );
    }