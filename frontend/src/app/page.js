"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./style/home.css";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false); // ← モーダル表示用の状態

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

      
      
      

      <div className='container'>
        <h1 className='title'>Zerofy</h1>
      
        <input
          type='text'
          placeholder='任意'
          className='usernameInput'
          />
        
        <div className='menu'>
          <Link href='/game'>
            <button>オンラインでマッチング</button>
          </Link>
      
            <button>友達と遊ぶ</button>
            <button onClick={() => setShowModal(true)}>ルール説明</button>
        </div>
      </div>
      
      {showModal && (
  <div className='modal-overlay' onClick={() => setShowModal(false)}>
    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
      
      <h2>計算対戦</h2>
      
      <div className = 'sub_box'>
      <p>
        ゲームのルール
        <br />
        1.
        <br />
        2.
      </p>
    </div>
    
      <button className='close-button' onClick={()=> setShowModal(false)}>
        閉じる
      </button>
    </div>
  </div>
)}

    </>
  );
}
