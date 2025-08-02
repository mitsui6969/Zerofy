import React, { useState, useEffect, useRef } from 'react';

export default function QuestionPhase({ data, ws }) {
    const { expression } = data;
    const [answer, setAnswer] = useState('');
    const startTimeRef = useRef(null);

    useEffect(() => {
        startTimeRef.current = Date.now(); // 問題表示時に開始時刻記録
    }, [expression]);

    const handleSubmit = () => {
        const endTime = Date.now();
        const elapsedMs = endTime - startTimeRef.current; // 経過時間計算

        ws.send(JSON.stringify({
        type: 'ANSWER',
        payload: {
            answer: parseFloat(answer),
            timeAt: new Date().toISOString(),
            elapsedMs, // 経過時間（ミリ秒）
        },
        }));
    };

    return (
        <div>
        <h2 className="text-xl font-bold mb-4">計算式に答えてください！</h2>
        <p className="text-lg mb-4">{expression} = ?</p>
        <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="border p-2 mr-2"
        />
        <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded"
        >
            解答
        </button>
        </div>
    );
}
