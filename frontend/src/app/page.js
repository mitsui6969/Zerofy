"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import "./style/home.css";
import { useSocketStore } from "./store/socketStore";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false); // ← モーダル表示用の状態

  const router = useRouter(); // Next.jsのルーターを使用
  const connect = useSocketStore((state) => state.connect);
  const sendMessage = useSocketStore((state) => state.sendMessage);

  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:8080/ws");
  //   ws.onopen = () => console.log("Connected to WebSocket");

  //   ws.onmessage = (e) => {
  //     setMessages((prev) => [...prev, e.data]);
  //   };

  //   ws.onerror = (e) => console.error("WebSocket error:", e);
  //   ws.onclose = () => console.log("WebSocket closed");

  //   setSocket(ws);

  //   // return () => ws.close();
  // }, []);

  // バックエンドにメッセージを送信する関数
  const sendToBack = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      const message = { type: "JOIN", roomID: "", playerName: "Player1", friend: false };
      socket.send(JSON.stringify(message)); 
      console.log("バックエンドに送ったよ!");
    }
  };

  // マッチングボタンがクリックされたときの処理
  const handleMatchmakingClick = () => {
    connect(); // ページ遷移前に接続
    sendMessage({ type: "JOIN", roomID: "", playerName: "Player1", friend: false });
    console.log("バックエンドに送ったよ!");
    router.push("/game");
  };

  return (
    <>
      <div className='container'>
        <h1 className='title'>Zerofy</h1>
      
        <input
          type='text'
          placeholder='任意'
          className='usernameInput'
          />
        
        <div className='menu'>
            <button onClick={handleMatchmakingClick}>オンラインでマッチング</button>
      
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
