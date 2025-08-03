"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import "./style/home.css";
import { useSocketStore } from "./store/socketStore";
import"./style/sub_box.css";
import "./style/friend.css";
export default function Home() {
  const [modalType, setModalType] = useState(null);
  const [playerName, setPlayerName] = useState("test player");
  const [roomID, setRoomID] = useState(""); // 友達のルームID入力用
  const [isMatchmaking, setIsMatchmaking] = useState(false); // マッチング中かどうかの状態
  const router = useRouter();

  // Zustandストアから必要な関数と状態を取得
  const connect = useSocketStore((state) => state.connect);
  const sendMessage = useSocketStore((state) => state.sendMessage);
  const room = useSocketStore((state) => state.room);
  const isConnected = useSocketStore((state) => state.isConnected);
  const disconnect = useSocketStore((state) => state.disconnect);

  // ページがロードされた時に接続状態をリセット
  useEffect(() => {
    // ページロード時に接続を切断し、状態をリセット
    disconnect();
    setIsMatchmaking(false);
  }, []);

  // マッチングボタンがクリックされたときの処理
  const handleMatchmakingClick = () => {
    // 既に接続済みの場合は何もしない
    if (isConnected) return;

    setIsMatchmaking(true); // マッチング開始フラグを設定
    const message = {
      type: "JOIN",
      roomID: roomID, // ランダムマッチングなので空
      playerName: playerName || `Guest-${Math.floor(Math.random() * 1000)}`,
      friend: false,
    };
    connect(message); // 作成したメッセージを渡して接続開始
  };

  // 友達と遊ぶ機能でルームに参加する処理
  const handleJoinRoom = () => {
    if (!roomID || roomID.length !== 4) {
      alert("4桁のルーム番号を入力してください");
      return;
    }

    if (isConnected) return;

    setIsMatchmaking(true); // マッチング開始フラグを設定
    const message = {
      type: "JOIN",
      roomID: roomID,
      playerName: playerName || `Guest-${Math.floor(Math.random() * 1000)}`,
      friend: true,
    };
    connect(message);
    setModalType(null); // モーダルを閉じる
  };

  // roomの状態を監視し、ルームに参加できたらページ遷移する
  useEffect(() => {
    if (room && isMatchmaking) {
      // ルーム情報がセットされ、かつマッチング中の場合のみゲームページに遷移
      router.push("/game");
    }
  }, [room, isMatchmaking, router]);

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
            <button onClick={() =>setModalType("play")}>友達と遊ぶ</button>
        </div>

        <div className='menu3'>
            <button onClick={() => setModalType("howto")}>遊び方</button>
        </div>
      </div>
      
    {modalType && (
  <div className='modal-overlay' onClick={() => setModalType(null)}>
    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
      {modalType === "play"&&(
        <>

          <h2 className='sub_box2'>ルーム番号を入力しよう</h2>
      
        <input
          type='text'
          placeholder='　四桁だよ！'
          className='PassInput'
          value={roomID}
          onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/\D/g, ''); // 数字以外を除去
            if (onlyNumbers.length <= 4) setRoomID(onlyNumbers);   // 4桁まで
          }}
          inputMode="numeric"   // モバイルで数字キーボードが出るように
          maxLength={4}         // 入力可能な最大文字数
        />
        <button onClick={handleJoinRoom} className='join-button'>
          ルームに参加
        </button>
      </>
      )}
      
      {modalType === 'howto'&&(
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
  </>
  )}
    
      <button className='close-button' onClick={()=> setModalType(null)}>
        閉じる
      </button>
    </div>
  </div>
)}
    </>
  );
}
