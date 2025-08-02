"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./style/home.css";
import"./style/sub_box.css";
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
      <div className='container'>
        <h1 className='title'>Zerofy</h1>
      
        <input
          type='text'
          placeholder='任意'
          className='usernameInput'
          />
        
        <div className='menu'>
          <Link href='/game'>
            <button onClick={() => setPhase('WAIT')}>マッチング</button>
          </Link>
        </div>
        <div className='menu2'>
            <button>友達と遊ぶ</button>
        </div>
        <div className='menu3'>
            <button onClick={() => setShowModal(true)}>遊び方</button>

        </div>
            
        </div>
      
    {showModal && (
  <div className='modal-overlay' onClick={() => setShowModal(false)}>
    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
      
      <h2>計算対戦</h2>
      
      <div className="sub_box">
  <h2>ゲームのルール</h2>

  <div className="rule-section">
    <h3>1. ポイントを賭けよう！</h3>
    <ul>
      <li>各プレイヤーは「1〜10」で賭けポイントを決めよう</li>
      <li>持っているポイントはどんどん減らそう！</li>
    </ul>
  </div>

  <div className="rule-section">
    <h3>2. 計算しよう！ ➕ ➖ ✖️ ➗</h3>
    <ul>
      <li>二人とも同じ計算式を解くよ（例：1 + 1 = ?）</li>
      <li>相手より早く解こう！</li>
      <li>
      たまーに負けているプレイヤーが条件を決められる！
        <br />
        例：計算式に「5は出したくない」など
      </li>
    </ul>
  </div>

  <div className="rule-section">
    <h3>3. 早押し勝負</h3>
    <ul>
      <li>より早く正解しよう！</li>
      <li>勝ったら賭けポイント分、減らせるよ 😊</li>
      <li>負けたら何も変わらない 😢</li>
      <li>持ちポイントが先に0になったら勝ちだよ</li>
    </ul>
  </div>
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
