'use client';
import React, { useEffect, useState } from 'react';
import BetPhase from '@/app/components/Game/BetPhase';
import QuestionPhase from '@/app/components/Game/QuestionPhase';
import ResultPhase from '@/app/components/Game/ResultPhase';
import { useSocketStore } from '../store/socketStore';
// import { sendMessage } from '../websocket/socketClient';

export default function GamePage() {
    const [phase, setPhase] = useState('WAIT'); // 'BET' | 'QUESTION' | 'RESULT' | 'WAIT'
    const [data, setData] = useState(null); // サーバーからのフェーズデータ
    const [ws, setWs] = useState(null);
    // const {messages, setMessages} = useSocketStore();

    useEffect(() => {

    }, []);

    return (
        <main className="p-8">
        {phase === 'BET' && <BetPhase ws={ws} />}
        {phase === 'QUESTION' && <QuestionPhase data={data} ws={ws} />}
        {phase === 'RESULT' && <ResultPhase data={data} />}
        {phase === 'WAIT' && <p>Waiting for opponent...</p>}
        </main>
    );
}
