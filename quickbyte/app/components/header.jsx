import React from 'react';
import Image from "next/image";

const width = 200;
const height = width/2.048;

export default function Header() {
    return <header className="header">
        <span> <Image 
            src="/logo-name.png"
            width={width}
            height={height}
            alt="QuickByte"
        /></span>
    </header>

}