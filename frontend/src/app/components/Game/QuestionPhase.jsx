import React, { useState, useEffect, useRef } from 'react';

export default function QuestionPhase({ data, ws }) {
    const [isStarted, setIsStarted] = useState(false);
    const { expression } = "1+1"; // 仮のデータ
    // const { expression } = data; // 実際のデータを使用する場合はこちら
    const [answer, setAnswer] = useState('');
    const [elapsedMs, setElapsedMs] = useState(null);
    const inputRef = useRef(null);
    // 問題表示から回答までの時間を計測するためのタイマー処理
    const startTimeRef = useRef(null);

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

    useEffect(() => {
        if (isStarted) {
            startTimeRef.current = Date.now();
            setElapsedMs(null); // 問題表示時に前回のタイマーをリセット
        }
    }, [isStarted]);

    const handleSubmit = () => {
        const endTime = Date.now();
        const elapsed = endTime - startTimeRef.current;

        ws.send(JSON.stringify({
            type: 'ANSWER',
            payload: {
                answer: parseFloat(answer),
                timeAt: new Date().toISOString(),
                elapsedMs: elapsed,
            },
        }));
        setAnswer('');
        setElapsedMs(elapsed); // ここで経過時間を保存
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
                onChange={(e) => {
                    const value = e.target.value;
                    if (value.match(/^[0-9.]*$/)) {
                        setAnswer(value);
                    }
                }}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                className="border p-2 mr-2"
                disabled={!isStarted}
            />
            <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded"
                disabled={!isStarted}
            >
                解答
            </button>
            {/* ここで経過時間を表示 */}
            {elapsedMs !== null && (
                <p className="mt-4 text-blue-600">
                    回答までの時間: {(elapsedMs / 1000).toFixed(2)} 秒
                </p>
            )}
        </div>
    );
}