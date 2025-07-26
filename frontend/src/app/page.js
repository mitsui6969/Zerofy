"use client";
import React from "react";
import Link from "next/link";


export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>ここに表示したい</p>

    <Link href={"/start"}><button>Start へ</button></Link>
      <button onClick={() => alert("Button clicked!")}>hello backend!</button>
    </>
  );
}
