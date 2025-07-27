import Link from 'next/link'
import React from 'react'

function Header() {
    return (
        <div>
            <Link href={"/"}>/Home</Link>
            <Link href={"/start"}>/Start</Link>
            <Link href={"/game"}>/Game</Link>
        </div>
    )
}

export default Header