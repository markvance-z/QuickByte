'use client'
import React from 'react';
import Image from "next/image";
import Logout from "./logout.jsx"

const width = 180;
const height = width/2.048;
const profile = "{profile-icon}"
    
export default function Header() {
    return <header className="header">
        <span> <Image 
            src="/logo-name.png"
            width={width}
            height={height}
            alt="QuickByte"
        /></span> {profile}
        <Logout/>
    </header>

}