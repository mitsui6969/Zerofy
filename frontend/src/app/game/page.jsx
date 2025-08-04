'use client';
import React, { useEffect, useState } from 'react';
import QuestionPhase from '@/app/components/Game/QuestionPhase';
import ResultPhase from '@/app/components/Game/ResultPhase';
import EndPhase from '../components/Game/EndPhase';
import { useSocketStore } from '../store/socketStore';
import "../style/game.css"
import Link from "next/link";

export default function GamePage() {
    const data = useSocketStore((state) => state.room);
    const ws = useSocketStore((state) => state.ws);
    const phase = useSocketStore((state) => state.phase);
    const setPhase = useSocketStore((state) => state.setPhase);

    const playSound = () => {
        const audio = new Audio("/sound/クリック.mp3");
        audio.play();
    };

    const [displayPhase, setDisplayPhase] = useState('WAIT');
    const [showMatched, setShowMatched] = useState(false);

    useEffect(() => {
        if (phase === 'RESULT') {
            setDisplayPhase('RESULT');
            const timer = setTimeout(() => {
                setPhase('QUESTION');
                const socketStore = useSocketStore.getState();
                socketStore.resetReadyState();
            }, 5000);
            return () => clearTimeout(timer);
        } else if (phase === 'QUESTION') {
            setDisplayPhase('WAIT');
            setShowMatched(true);
            const timer = setTimeout(() => {
                setDisplayPhase('QUESTION');
                setShowMatched(false);
            }, 1500);
            return () => clearTimeout(timer);
        } else if (phase === 'END') {
            setDisplayPhase('END');
        } else {
            setDisplayPhase(phase);
        }
    }, [phase, setPhase]);

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
                            <Link href='/' onClick={playSound}>
                                <button>キャンセル</button>
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <main className="p-8">
                    {displayPhase === 'QUESTION' && <QuestionPhase data={data} ws={ws} />}
                    {displayPhase === 'RESULT' && <ResultPhase data={data} />}
                    {displayPhase === 'END' && <EndPhase />}
                    {displayPhase === 'WAIT' && <p>Waiting for opponent...</p>}
                </main>
            )}
        </>
    )
}
