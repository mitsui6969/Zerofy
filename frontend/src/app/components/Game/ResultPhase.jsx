import React from 'react';
import { useSocketStore } from '../../store/socketStore';
import { usePlayerStore } from '../../features/payer/playerStore';
import '../../style/result.css';

export default function ResultPhase({ onPlayAgain }) {
    const { winner, correctAnswer } = useSocketStore();
    const { myPlayer, opponent } = usePlayerStore();
    
    // ---デバッグ用ログ---
    //console.log('=== ResultPhase デバッグ ===');
    //console.log('winner:', winner);
    //console.log('myPlayer.id:', myPlayer.id);
    //console.log('opponent.id:', opponent.id);
    //console.log('winner === myPlayer.id:', winner === myPlayer.id);
    console.log('winner === opponent.id:', winner === opponent.id);
    console.log('myPlayer.point:', myPlayer.point);
    console.log('opponent.point:', opponent.point);

    // 表示内容も確認
    const displayText = winner === myPlayer.id
        ? '🎉 あなたの勝ち！'
        : winner === opponent.id
        ? '😢 あなたの負け'
        : winner
        ? '勝者不明'
        : '';
    // ---デバッグ用ログ---
    //console.log('表示テキスト:', displayText);
    // ---デバッグ用ログ---

    return (
        <div>
        <h2 className="title">Game Results</h2>
        <div className="box">
        <p className="name">
            {winner === myPlayer.id
                ? '🎉 あなたの勝ち！'
                : winner === opponent.id
                ? '😢 あなたの負け'
                : winner
                ? '勝者不明'
                : ''}
        </p>
        <p className="mypoint">あなたの残りポイント:{myPlayer.point}</p>
        <p className="yourpoint">相手の残りポイント:{opponent.point}</p>
        <p className="correct-answer">正解: {correctAnswer}</p>
        </div>
        <div className="again">
        <p>5秒後に計算画面に戻ります</p>
        </div>
        </div>
    );
}