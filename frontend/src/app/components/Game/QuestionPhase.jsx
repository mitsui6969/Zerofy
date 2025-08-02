import React, { useState, useEffect, useRef } from 'react';

export default function QuestionPhase({ data, ws }) {
    const [isStarted, setIsStarted] = useState(false);
    const { expression } = "1+1"; // 仮のデータここに入れる
    // const { expression } = data; // 実際のデータを使用する場合はこちらを有効にする
    const [answer, setAnswer] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
    const handleStartGame = (e) => {
        if (!isStarted && e.key === ' ') {
            e.preventDefault();
            setIsStarted(true);
        }
    };

    document.addEventListener('keydown', handleStartGame);

    if (isStarted && inputRef.current) {
            inputRef.current.focus();
        }

    return () => {
        document.removeEventListener('keydown', handleStartGame);
    };
    }, [isStarted]);

        const handleSubmit = () => {
        ws.send(JSON.stringify({
        type: 'ANSWER',
        payload: {
            answer: parseFloat(answer),
            timeAt: new Date().toISOString(),
        },
        }));
        setAnswer(''); 
        };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div>
        <h2 className="text-xl font-bold mb-4">計算式に答えてください！</h2>
        {isStarted ? (
            <p className="text-lg mb-4">{expression} = ?</p>
        ) : (  
            <p>スペースキーで準備完了！<br />Enterで解答を送信できます！</p>

        )}
        <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
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