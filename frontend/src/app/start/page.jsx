"use client";
import Link from "next/link";

function Start() {
    return (
        <div>
            <h1>Start</h1>
            <p>ここに表示したい</p>

            <Link href={"/"}><button>home へ</button></Link>
            <button onClick={() => alert("Button clicked!")}>hello backend!</button>
        </div>
    );
}

export default Start;