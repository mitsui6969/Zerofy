import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socketStore';
import '../../style/Question.css';
export default function QuestionPhase() {
    const { socket, isConnected } = useSocketStore();
    const [expression, setExpression] = useState(""); // 式を保持
    const [answer, setAnswer] = useState('');
    const [elapsedMs, setElapsedMs] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const inputRef = useRef(null);
    const startTimeRef = useRef(null);

    // コンポーネントマウント時に問題を要求
    useEffect(() => {
        if (socket) {
            socket.send(JSON.stringify({
                type: 'START_GAME'
            }));
            console.log('Requested formula on mount');
        }
    }, [socket]);

    // WebSocket受信処理
    useEffect(() => {
        if (!socket) return;
        
        const handleMessage = (event) => {
            console.log('QuestionPhase received:', event.data);
            try {
                const message = JSON.parse(event.data);
                
                // Formulaオブジェクトが直接送信されている場合
                if (message.Question) {
                    setExpression(message.Question);
                    console.log('Formula received:', message.Question);
                }
                // payloadの中にQuestionがある場合（既存の処理）
                else if (message.payload && message.payload.Question) {
                    setExpression(message.payload.Question);
                    console.log('Formula received from payload:', message.payload.Question);
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
useEffect(() => {
    const handleGlobalKeyDown = (e) => {
        if (document.activeElement === inputRef.current) return;

        if (e.key.match(/^[0-9.-]$/)) {
            e.preventDefault();

            setAnswer((prev) => {
                const newValue = prev + e.key;
                if (newValue.match(/^-?[0-9.]*$/)) {
                    return newValue;
                }
                return prev;
            });

            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown);
    };
}, []);



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
        <div className="question-container">
            <div className="question-box">
                <h2 className="title">計算式に答えてください！</h2>

        {isStarted ? (
            expression ? (
            <p className="expression">{expression} = ?</p>
            ) : (
            <p className="waiting">問題を待機中...</p>
            )
        ) : (
        <p className="instructions">
            スペースキーで準備完了！<br />Enterで解答を送信できます！
            </p>
        )}

        <div className="input-row">
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
            className="answer-input"
            disabled={!isStarted}
            />
            <button
            onClick={handleSubmit}
            className="submit-button"
            disabled={!isStarted}
            >
            解答
            </button>
        </div>

        {elapsedMs !== null && (
            <p className="elapsed-time">
            回答までの時間: {(elapsedMs / 1000).toFixed(2)} 秒
            </p>
        )}
        </div>
    </div>
    );
}