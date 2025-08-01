import React, { useState } from 'react';

export default function BetPhase({ ws }) {
    const [bet, setBet] = useState(1);

    const handleSubmit = () => {
        ws.send(JSON.stringify({
        type: 'BET',
        payload: { point: bet },
        }));
    };

    return (
        <div>
        <h2 className="text-xl font-bold mb-4">ポイントを賭け</h2>
        <input
            type="range"
            min={1}
            max={10}
            value={bet}
            onChange={(e) => setBet(parseInt(e.target.value))}
            className="border p-2 mr-2"
        />
        <div className="mb-4 text-center font-semibold">{bet} ポイント</div>
        <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
            送信
        </button>
        </div>
    );
    }