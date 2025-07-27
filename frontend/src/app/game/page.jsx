'use client';
import React, { useEffect, useState } from 'react';
import BetPhase from '@/app/components/Game/BetPhase';
import QuestionPhase from '@/app/components/Game/QuestionPhase';
import ResultPhase from '@/app/components/Game/ResultPhase';

export default function GamePage() {
    const [phase, setPhase] = useState('WAIT'); // 'BET' | 'QUESTION' | 'RESULT' | 'WAIT'
    const [data, setData] = useState(null); // サーバーからのフェーズデータ
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/ws');

        socket.onopen = () => {
        console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'PHASE') {
            setPhase(msg.phase);   // "BET" | "QUESTION" | "RESULT"
            setData(msg.payload);
        }
        };

        socket.onerror = console.error;
        socket.onclose = () => console.log('WebSocket disconnected');

        setWs(socket);

        return () => socket.close();
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
