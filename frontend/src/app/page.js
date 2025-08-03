"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import "./style/home.css";
import { useSocketStore } from "./store/socketStore";
import "./style/sub_box.css";
import "./style/friend.css";

export default function Home() {
  const [modalType, setModalType] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [roomID, setRoomID] = useState("");
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const router = useRouter();

  const connect = useSocketStore((state) => state.connect);
  const room = useSocketStore((state) => state.room);
  const isConnected = useSocketStore((state) => state.isConnected);
  const disconnect = useSocketStore((state) => state.disconnect);

  useEffect(() => {
    disconnect();
    setIsMatchmaking(false);
  }, [disconnect]);

  const handleMatchmakingClick = () => {
    if (isConnected) return;

    setIsMatchmaking(true);
    const message = {
      type: "JOIN",
      roomID: "", // ランダムマッチングは空
      playerName: playerName || `Guest-${Math.floor(Math.random() * 1000)}`,
      friend: false,
    };
    connect(message);
  };

  const handleJoinRoom = () => {
    if (!roomID || roomID.length !== 4) {
      alert("4桁のルーム番号を入力してください");
      return;
    }
    if (isConnected) return;

    setIsMatchmaking(true);
    const message = {
      type: "JOIN",
      roomID,
      playerName: playerName || `Guest-${Math.floor(Math.random() * 1000)}`,
      friend: true,
    };
    connect(message);
    setModalType(null);
  };

  useEffect(() => {
    if (room && isMatchmaking) {
      router.push("/game");
    }
  }, [room, isMatchmaking, router]);

  return (
    <>
      <div className='container'>
        <h1 className='title'>Zerofy</h1>

        <input
          type='text'
          placeholder='名前を入力（任意）'
          className='usernameInput'
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        <div className='menu'>
          <button onClick={handleMatchmakingClick}>オンラインでマッチング</button>      
        </div>

        <div className='menu2'>
          <button onClick={() => setModalType("play")}>友達と遊ぶ</button>
        </div>

        <div className='menu3'>
          <button onClick={() => setModalType("howto")}>遊び方</button>
        </div>
      </div>

      {modalType && (
        <div className='modal-overlay' onClick={() => setModalType(null)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            {modalType === "play" && (
              <>
                <h2 className='sub_box2'>ルーム番号を入力しよう</h2>

                <div className="room-inputs">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                    key={i}
                    type="text"
                    maxLength={1}
                      value={roomID[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 1);
                        const newRoomID = roomID.split("");
                        newRoomID[i] = val;
                        setRoomID(newRoomID.join(""));

        if (val && i < 3) {
          const nextInput = document.getElementById(`room-input-${i + 1}`);
          if (nextInput) nextInput.focus();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === " ") {  // スペースキーで戻る
          e.preventDefault(); // スペースのスクロールなどを防止
          if (i > 0) {
            const prevInput = document.getElementById(`room-input-${i - 1}`);
            if (prevInput) prevInput.focus();
          }
        }
        if (e.key === "Enter" && roomID.length === 4) {
          handleJoinRoom(); // 4桁揃っていたら参加処理を呼び出す
        }
        
        if (e.key === "Backspace") {  // バックスペースで戻る（あると便利）
          if (!roomID[i] && i > 0) {
            const prevInput = document.getElementById(`room-input-${i - 1}`);
            if (prevInput) prevInput.focus();
          }
        }
      
      }}
      inputMode="numeric"
      id={`room-input-${i}`}
    />
  ))}
</div>

                <button onClick={handleJoinRoom} className='join-button'>
                  ルームに参加
                </button>

                <button className='close-friend' onClick={() => setModalType(null)}>
                  閉じる
                </button>
              </>
            )}

            {modalType === 'howto' && (
              <>
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
                        たまーに負けているプレイヤーが条件を決められる！<br />
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

                  <button className='close-howto' onClick={() => setModalType(null)}>
                    閉じる
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
