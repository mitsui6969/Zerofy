import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socketStore';

export default function QuestionPhase() {
    const { socket, isConnected, currentFormula } = useSocketStore();
    const [expression, setExpression] = useState(""); // 式を保持
    const [answer, setAnswer] = useState('');
    const [elapsedMs, setElapsedMs] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const inputRef = useRef(null);
    const startTimeRef = useRef(null);

    // コンポーネントマウント時の処理（START_GAMEは送信しない）
    useEffect(() => {
        console.log('QuestionPhase mounted');
    }, []);

    // currentFormulaが更新された時に式を設定
    useEffect(() => {
        if (currentFormula && currentFormula.Question) {
            setExpression(currentFormula.Question);
            console.log('Formula set from store:', currentFormula.Question);
        }
    }, [currentFormula]);

    // WebSocket受信処理（フォールバック用）
    useEffect(() => {
        if (!socket) return;
        
        const handleMessage = (event) => {
            console.log('QuestionPhase received:', event.data);
            try {
                const message = JSON.parse(event.data);
                
                // フォールバック: 直接Formulaオブジェクトが送信された場合
                if (message.Question && !message.type) {
                    setExpression(message.Question);
                    console.log('Formula received directly (fallback):', message.Question);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.addEventListener('message', handleMessage);
        
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket]);

    // スペースキーで開始
    useEffect(() => {
        const handleStartGame = (e) => {
            if (!isStarted && e.key === ' ') {
                e.preventDefault();
                setIsStarted(true);
                startTimeRef.current = Date.now();
            }
        };

        document.addEventListener('keydown', handleStartGame);

        return () => {
            document.removeEventListener('keydown', handleStartGame);
        };
    }, [isStarted]);

    // 入力フィールドにフォーカス
    useEffect(() => {
        if (isStarted && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isStarted]);

    const handleSubmit = () => {
        const endTime = Date.now();
        const elapsed = endTime - startTimeRef.current;
        const elapsedSeconds = elapsed / 1000; // 秒数に変換

        // コンソールで回答時間を確認
        console.log('回答時間:', elapsedSeconds.toFixed(2) + '秒');
        console.log('送信データ:', {
            type: 'Answer',
            roomID: '',
            Answer: parseFloat(answer),
            Time: elapsedSeconds
        });

        socket.send(JSON.stringify({
            type: 'Answer',
            roomID: '', // roomIDは現在空文字列、必要に応じて設定
            Answer: parseFloat(answer),
            Time: elapsedSeconds
        }));
        setAnswer('');
        setElapsedMs(elapsed); // ここで経過時間を保存（表示用はミリ秒のまま）
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
                expression ? (
                    <p className="text-lg mb-4">{expression} = ?</p>
                ) : (
                    <p>問題を待機中...</p>
                )
            ) : (
                <p>スペースキーで準備完了！<br />Enterで解答を送信できます！</p>
            )}
            <input
                type="text"
                value={answer}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value.match(/^-?[0-9.]*$/)) {
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