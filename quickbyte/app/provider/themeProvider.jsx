'use client'

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function Provider({ children }) { 
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null; // Prevents hydration mismatch
    }
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={true}
        >
            {children}
            </ThemeProvider>
        );
    }