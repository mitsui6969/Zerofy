"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";


export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    ws.onopen = () => console.log("Connected to WebSocket");

    ws.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data]);
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);
    ws.onclose = () => console.log("WebSocket closed");

    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendToBack = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send("Hi from front");
    }
  };

  return (
    <>
      <h1> Zerofy</h1>

      <Link href={"/start"}><button>Start へ</button></Link>
      <button onClick={() => sendToBack()}>hello backend!</button>
      
      

      <div className='menu'>
        <Link href='/game'>
          <button>オンラインでマッチング</button>
        </Link>
      
        <button>友達と遊ぶ</button>
        <button>ルール説明</button>
      </div>
      <ul>
        <li>バックエンドから</li>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </>
  );
}
