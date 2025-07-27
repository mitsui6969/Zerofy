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
        <h2 className="text-xl font-bold mb-4">ポイントを賭けてください (1〜9)</h2>
        <input
            type="number"
            min={1}
            max={9}
            value={bet}
            onChange={(e) => setBet(parseInt(e.target.value))}
            className="border p-2 mr-2"
        />
        <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
            送信
        </button>
        </div>
    );
    }
