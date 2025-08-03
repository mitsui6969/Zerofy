"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import "./style/home.css";
import { useSocketStore } from "./store/socketStore";
import"./style/sub_box.css";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState("test player");
  const [roomID, setRoomID] = useState(""); // 友達のルームID入力用
  const router = useRouter();

  // Zustandストアから必要な関数と状態を取得
  const connect = useSocketStore((state) => state.connect);
  const sendMessage = useSocketStore((state) => state.sendMessage);
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
