import React from 'react';

export default function ResultPhase({ data }) {
    const { winnerID, yourPoints, opponentPoints } = data;
    //aaa//
    return (
        <div>
        <h2 className="text-xl font-bold mb-4">ラウンド結果</h2>
        <p>
            {winnerID === 'you'
            ? '🎉 あなたの勝ち！'
            : winnerID === 'opponent'
            ? '😢 相手の勝ち'
            : '同着'}
        </p>
        <p className="mt-4">あなたの残りポイント: {yourPoints}</p>
        <p>相手の残りポイント: {opponentPoints}</p>
        </div>
    );
}
