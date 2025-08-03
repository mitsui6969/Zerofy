'use client';
import React, { useEffect, useState } from 'react';
import BetPhase from '@/app/components/Game/BetPhase';
import QuestionPhase from '@/app/components/Game/QuestionPhase';
import ResultPhase from '@/app/components/Game/ResultPhase';
import { useSocketStore } from '../store/socketStore';
import "../style/game.css"
import Link from "next/link";

export default function GamePage() {
    const [phase, setPhase] = useState('QUESTION'); // 'BET' | 'QUESTION' | 'RESULT' | 'WAIT'
    const [data, setData] = useState(null); // サーバーからのフェーズデータ
    const [ws, setWs] = useState(null);
    // const {messages, setMessages} = useSocketStore();

    useEffect(() => {

    }, []);

    return (
    <div>
        {phase === 'WAIT'? (
        <div className="matching">
            <div className="circle circle-top-right"></div>
            <div className="circle circle-bottom-left"></div>

            <h1>相手を探しています...</h1>
        <div className='cancel'>
            <Link href='/'>
                <button>キャンセル</button>
            </Link>
        </div>
        </div>
        ) : (
        <main className="p-8">
        {phase === 'BET' && <BetPhase ws={ws} />}
        {phase === 'QUESTION' && <QuestionPhase data={data} ws={ws} />}
        {phase === 'RESULT' && <ResultPhase data={data} />}
        </main> 
    )}
</div>
);
}
