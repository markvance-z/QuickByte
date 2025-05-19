import React from 'react';
import Image from "next/image";

export default function Header() {
    return <header className="header">
        <span className="title">QuickByte</span><Image 
            src="/cat.png"
            width={40}
            height={40}
            alt="cat"
        />
    </header>

}