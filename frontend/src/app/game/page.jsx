'use client';
import React, { useEffect, useState } from 'react';
import BetPhase from '@/app/components/Game/BetPhase';
import QuestionPhase from '@/app/components/Game/QuestionPhase';
import ResultPhase from '@/app/components/Game/ResultPhase';
import { useSocketStore } from '../store/socketStore';
import "../style/game.css"
import Link from "next/link";

export default function GamePage() {
    const data = useSocketStore((state) => state.room) // サーバーからのフェーズデータ
    const ws = useSocketStore((state) => state.ws); // WebSocketのインスタンス
    const phase = useSocketStore((state) => state.phase); // 'BET' | 'QUESTION' | 'RESULT' | 'WAIT'
    const setPhase = useSocketStore((state) => state.setPhase); // フェーズを更新する関数

     // 実際に画面に表示するフェーズ
    const [displayPhase, setDisplayPhase] = useState('WAIT');
    const [showMatched, setShowMatched] = useState(false);

    
    useEffect(() => {
        if (phase === 'RESULT') {
            // RESULTになったら、5秒後にフェーズをQUESTIONに設定する
            setDisplayPhase('RESULT');
            const timer = setTimeout(() => {
            setPhase('QUESTION');
            }, 5000); // 5秒
            return () => clearTimeout(timer);
        } else if (phase === 'BET') {
            // BETになった瞬間に「マッチングしました」を表示して、1.5秒後にBET画面へ
            setDisplayPhase('WAIT');
            setShowMatched(true);

            const timer = setTimeout(() => {
                setDisplayPhase('BET');
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
                    <div className="circle circle-top-right"></div>
                    <div className="circle circle-bottom-left"></div>

                    <h1>
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
                    {phase === 'BET' && <BetPhase ws={ws} />}
                    {phase === 'QUESTION' && <QuestionPhase data={data} ws={ws} />}
                    {phase === 'RESULT' && <ResultPhase data={data} />}
                    {phase === 'WAIT' && <p>Waiting for opponent...</p>}
                    </main>
                )
            }
        </>
    )
}
