import React from 'react';

export default function Header() {
    return <div>
        <text className="title">QuickByte</text>
        <input className="filter" placeholder="search here"></input>
        <button className="filter">Filter</button>
        <button className="cart">🛒 Grocery Cart</button>
    </div>

}