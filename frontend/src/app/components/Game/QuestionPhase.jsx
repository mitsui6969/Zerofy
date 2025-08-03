import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socketStore';

export default function QuestionPhase() {
    const { socket, isConnected, readyPlayers, formula, currentPoints, resetReadyState } = useSocketStore();
    const [answer, setAnswer] = useState('');
    const [elapsedMs, setElapsedMs] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const inputRef = useRef(null);
    const startTimeRef = useRef(null);

    // コンポーネントマウント時に準備状態をリセット
    useEffect(() => {
        resetReadyState();
        setIsReady(false);
        setIsStarted(false);
        setAnswer('');
        setElapsedMs(null);
    }, []);

    // スペースキーで準備完了
    useEffect(() => {
        const handleReady = (e) => {
            if (!isReady && e.key === ' ') {
                e.preventDefault();
                setIsReady(true);
                
                // サーバーに準備完了を送信
                if (socket) {
                    socket.send(JSON.stringify({
                        type: 'START_GAME'
                    }));
                    console.log('Sent ready signal');
                }
            }
        };

        document.addEventListener('keydown', handleReady);

        return () => {
            document.removeEventListener('keydown', handleReady);
        };
    }, [isReady, socket]);

    // 計算式が受信されたら開始
    useEffect(() => {
        if (formula && !isStarted) {
            setIsStarted(true);
            startTimeRef.current = Date.now();
        }
    }, [formula, isStarted]);

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
            Time: elapsedSeconds,
            Points: currentPoints
        });

        socket.send(JSON.stringify({
            type: 'Answer',
            roomID: '', // roomIDは現在空文字列、必要に応じて設定
            Answer: parseFloat(answer),
            Time: elapsedSeconds,
            Points: currentPoints
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
            
            {!isReady ? (
                <div>
                    <p className="text-lg mb-4">スペースキーで準備完了！</p>
                    <p className="text-sm text-gray-600">両プレイヤーが準備完了すると同時に問題が表示されます</p>
                </div>
            ) : !isStarted ? (
                <div>
                    <p className="text-lg mb-4 text-green-600">✓ 準備完了！</p>
                    <p className="text-sm text-gray-600">
                        相手プレイヤーの準備を待っています... ({readyPlayers.size}/2)
                    </p>
                </div>
            ) : (
                <div>
                    {formula ? (
                        <div>
                            <p className="text-lg mb-2">{formula.question} = ?</p>
                            <p className="text-sm text-blue-600 mb-4">この問題のポイント: {currentPoints}点</p>
                        </div>
                    ) : (
                        <p>問題を待機中...</p>
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
            )}
        </div>
    );
}