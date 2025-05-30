import React from 'react';
import Image from "next/image";

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
        
    </header>

}