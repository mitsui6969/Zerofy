import React, { useState } from 'react';
import { useSocketStore } from '../../store/socketStore';
import '../../style/point.css';

export default function BetPhase() {
    const { socket } = useSocketStore();
    const [bet, setBet] = useState(1);

    const handleSubmit = () => {
        if (socket) {
            socket.send(JSON.stringify({
                type: 'BET',
                payload: { point: bet },
            }));
        }
    };

    return (
        <div>
        <h1 className="my-title">ポイント賭け</h1>
        <div className="my-point">{bet}</div>
        <input
            type="range"
            min={1}
            max={10}
            value={bet}
            onChange={(e) => setBet(parseInt(e.target.value))}
            className="my-slider"
        />
        <button
            onClick={handleSubmit}
            className="my-button"
        >
            決定
        </button>
        </div>
    );
}