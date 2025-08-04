'use client';
import React from 'react';
import { useSocketStore } from '../../store/socketStore';
import { usePlayerStore } from '../../features/payer/playerStore';
import { useRouter } from 'next/navigation';

export default function EndPhase() {
    const winner = useSocketStore(state => state.winner);
    // const roundLogs = useSocketStore(state => state.roundLogs || []);
    const myPlayerId = usePlayerStore(state => state.myPlayer.id);
    const router = useRouter();
    const cleanup = useSocketStore(state => state.cleanup);

    const handleHomeClick = () => {
        cleanup();        // 状態リセット＆WebSocket切断
        router.push('/'); // ホームへ移動
    };

    return (
        <div id="score-container">
            <h2>Zerofy RESULT</h2>
            <div style={{ fontSize: '2rem', margin: '1em 0' }}>
                {winner === myPlayerId ? 'WIN 🎉' : 'LOSE...'}
            </div>

            <button href="/" onClick={handleHomeClick} className="corner-button">
                ホームへ
            </button>

            {/* <div id="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ラウンド</th>
                            <th>計算式</th>
                            <th>答え</th>
                            <th>自分が回答</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roundLogs != null && roundLogs.map((log, idx) => (
                            <tr key={idx}>
                                <td>{log.round}</td>
                                <td>{log.formula}</td>
                                <td>{log.answer}</td>
                                <td>{log.answeredBy === myPlayerId ? '⭕️' : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div id="button-container">
                    <a href="/" className="corner-button">
                        Zerofyページへ →
                    </a>
                </div>
            </div> */}
        </div>
    );
}