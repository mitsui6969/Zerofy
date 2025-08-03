'use client';
import React, { useEffect, useState } from 'react';
import BetPhase from '@/app/components/Game/BetPhase';
import QuestionPhase from '@/app/components/Game/QuestionPhase';
import ResultPhase from '@/app/components/Game/ResultPhase';
import EndPhase from '../components/Game/EndPhase';
import { useSocketStore } from '../store/socketStore';
import "../style/game.css"
import Link from "next/link";

export default function GamePage() {

    const data = useSocketStore((state) => state.room) // サーバーからのフェーズデータ
    const ws = useSocketStore((state) => state.ws); // WebSocketのインスタンス
    const phase = useSocketStore((state) => state.phase); // 'QUESTION' | 'RESULT' | 'WAIT'

    const handlePlayAgain = () => {
        // 次のラウンドを開始する処理
        // ここでサーバーに次のラウンド開始を要求する
        console.log('Play again clicked');
    };

    // 実際に画面に表示するフェーズ
    const [displayPhase, setDisplayPhase] = useState('WAIT');
    const [showMatched, setShowMatched] = useState(false);

    useEffect(() => {
        if (phase === 'QUESTION') {
            // QUESTIONになった瞬間に「マッチングしました」を表示して、1.5秒後にBET画面へ
            setDisplayPhase('WAIT');
            setShowMatched(true);

            const timer = setTimeout(() => {
                setDisplayPhase('QUESTION');
                setShowMatched(false);
            }, 1500);

            return () => clearTimeout(timer);
        } else {
            // それ以外はそのまま同期
            setDisplayPhase(phase);
        }
    }, [phase]);

    return (
        <>
            {displayPhase === 'WAIT'? (
                <div className="matching">
                    <div className={`circle circle-top-right ${showMatched ? "merge" : ""}`}></div>
                    <div className={`circle circle-bottom-left ${showMatched ? "merge" : ""}`}></div>

                    <h1 className={showMatched ? "match-text show" : "matching-"}>
                        {showMatched ? "マッチングしました！" : "相手を探しています..."}
                    </h1>
                    
                    {!showMatched && (
                        <div className='cancel'>
                            <Link href='/'>
                                <button>キャンセル</button>
                            </Link>
                        </div>
                    )}
                </div>
                ) : (
                    <main className="p-8">
                    {phase === 'BET' && <BetPhase ws={socket} />}
                    {phase === 'QUESTION' && <QuestionPhase data={data} ws={socket} />}
                    {phase === 'RESULT' && <ResultPhase data={data} onPlayAgain={handlePlayAgain} />}

                    {phase === 'END' && <EndPhase />}
                    {phase === 'WAIT' && <p>Waiting for opponent...</p>}
                    </main>
                )
            }
        </>
    )
}
