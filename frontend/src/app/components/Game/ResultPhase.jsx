import React from 'react';
import '../../style/result.css';

export default function ResultPhase({ data, }) {
    //const { winnerID, yourPoints, opponentPoints } = data;
    const { 
        winnerID = 'you', 
        yourPoints = 100, 
        opponentPoints = 100 
    } = data || {};


    return (
        <div>
        <h2 className="title">Game Results</h2>
        <div className="box">
        <p className= "name">
            {winnerID === 'you'
            ? '🎉 あなたの勝ち！'
            : winnerID === 'opponent'
            ? '😢 相手の勝ち'
            : '同着'}
        </p>
        <p className="mypoint">あなたの残りポイント:{yourPoints}</p>
        <p className="yourpoint">相手の残りポイント:{opponentPoints}</p>
        </div>
        <div className="again">
        <p>5秒後に計算画面に戻ります</p>
        </div>
        </div>
    );
}