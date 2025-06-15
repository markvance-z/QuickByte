'use client'
import React from 'react';
import Image from "next/image";
import Logout from "./logout.jsx"
import ProfilePicture from './profilePicture.jsx';

const width = 180;
const height = width/2.048;
    
export default function Header() {
    return <header className="header">
        <span> <Image 
            src="/logo-name.png"
            width={width}
            height={height}
            alt="QuickByte"
        /></span>
        <ProfilePicture />
        <Logout/>
    </header>

}