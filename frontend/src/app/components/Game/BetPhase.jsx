import React, { useState } from 'react';
import { useSocketStore } from '../../store/socketStore';
import { usePlayerStore } from '../../features/payer/playerStore';
import '../../style/point.css';

export default function BetPhase() {
    const { socket } = useSocketStore();
    const { myPlayer, opponent } = usePlayerStore();
    const [bet, setBet] = useState(1);

    const handleSubmit = () => {
        if (socket) {
            // プレイヤーストアにベット情報を保存
            const playerStore = usePlayerStore.getState();
            playerStore.setMyBet(bet.toString());
            
            // ポイント関係のログ出力
            console.log('=== ベット送信ログ ===');
            console.log('自分のポイント:', myPlayer.point);
            console.log('相手のポイント:', opponent.point);
            console.log('送信データ:', {
                type: 'Bet',
                Bet: bet,
            });

            socket.send(JSON.stringify({
                type: 'Bet',
                Bet: bet,
            }));
        }
    };

    return (
        <div>
        <h1 className="my-title">ポイント賭け</h1>
        
        {/* 現在のポイント表示 */}
        <div className="mb-4 p-3 bg-gray-100 rounded">
            <div className="flex justify-between items-center">
                <div>
                    <span className="font-semibold">あなたのポイント: </span>
                    <span className="text-blue-600 font-bold">{myPlayer.point}</span>
                </div>
                <div>
                    <span className="font-semibold">相手のポイント: </span>
                    <span className="text-red-600 font-bold">{opponent.point}</span>
                </div>
            </div>
        </div>
        
        <div className="my-point">{bet}</div>
        <input
            type="range"
            min={1}
            max={10}
            value={bet}
            onChange={(e) => setBet(parseInt(e.target.value))}
            className="my-slider"
        />
        <button
            onClick={handleSubmit}
            className="my-button"
        >
            決定
        </button>
        </div>
    );
}