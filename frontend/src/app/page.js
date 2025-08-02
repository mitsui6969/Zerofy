"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import "./style/home.css";
import { useSocketStore } from "./store/socketStore";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState("test player");
  const [roomID, setRoomID] = useState(""); // 友達のルームID入力用
  const router = useRouter();

  // Zustandストアから必要な関数と状態を取得
  const connect = useSocketStore((state) => state.connect);
  const room = useSocketStore((state) => state.room);
  const isConnected = useSocketStore((state) => state.isConnected);

  // マッチングボタンがクリックされたときの処理
  const handleMatchmakingClick = () => {
    // 接続されていなければ接続処理を開始するだけ
    if (!isConnected) {
      // connect();
      if (isConnected) return; // 接続済みなら何もしない

    const message = {
      type: "JOIN",
      roomID: roomID, // ランダムマッチングなので空
      playerName: playerName || `Guest-${Math.floor(Math.random() * 1000)}`,
      friend: false,
    };
    connect(message); // 作成したメッセージを渡して接続開始
    }
  };

  // roomの状態を監視し、ルームに参加できたらページ遷移する
  useEffect(() => {
    if (room) {
      // ルーム情報がセットされたら（＝参加成功）、ゲームページに遷移
      router.push("/game");
    }
  }, [room, router]);

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
