import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socketStore';
import { usePlayerStore } from '../../features/payer/playerStore';
import '../../style/Question.css';

export default function QuestionPhase() {
    const {
        socket,
        isConnected,
        readyPlayers,
        formula,
        currentPoints,
        resetReadyState,
        resetIncorrectState,
        phase,
        isIncorrect,
        incorrectAnswer
    } = useSocketStore();
    const { myPlayer, opponent } = usePlayerStore();

    const [answer, setAnswer] = useState('');
    const [elapsedMs, setElapsedMs] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [submittedAnswer, setSubmittedAnswer] = useState(null);
    const [countdown, setCountdown] = useState(null);

    const inputRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        resetReadyState();
        setIsReady(false);
        setIsStarted(false);
        setAnswer('');
        setElapsedMs(null);
        setSubmittedAnswer(null);
        setCountdown(null);

        if (phase === 'QUESTION') {
            resetIncorrectState();
        }
    }, [phase, resetReadyState, resetIncorrectState]);

    const convertToHalfWidth = (str) => {
        return str
            .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
            .replace(/[ー－]/g, '-')
            .replace(/[。]/g, '.');
    };

    useEffect(() => {
        const handleReady = (e) => {
            if (!isReady && e.key === ' ') {
                e.preventDefault();
                setIsReady(true);
                socket?.send(JSON.stringify({ type: 'START_GAME' }));
            }
        };

        document.addEventListener('keydown', handleReady);
        return () => document.removeEventListener('keydown', handleReady);
    }, [isReady, socket]);

    useEffect(() => {
        if (formula && !isStarted && countdown === null) {
            setCountdown(3);
        }
    }, [formula, isStarted, countdown]);

    useEffect(() => {
        if (countdown === null || isStarted) return;

        let timer;
        if (typeof countdown === 'number' && countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        } else if (countdown === 0) {
            setCountdown("start");
        } else if (countdown === "start") {
            timer = setTimeout(() => {
                setIsStarted(true);
                startTimeRef.current = Date.now();
                setCountdown(null);
            }, 1000);
        }

        return () => clearTimeout(timer);
    }, [countdown, isStarted]);

    useEffect(() => {
        if (isStarted) {
            const handleGlobalKeyDown = (e) => {
                if (e.target === inputRef.current) return;
                handleKeyDown(e);
            };

            document.addEventListener('keydown', handleGlobalKeyDown);
            return () => document.removeEventListener('keydown', handleGlobalKeyDown);
        }
    }, [isStarted, answer]);

    const handleSubmit = () => {
        const endTime = Date.now();
        const elapsed = endTime - startTimeRef.current;
        const elapsedSeconds = elapsed / 1000;

        socket.send(JSON.stringify({
            type: 'Answer',
            roomID: '',
            Answer: parseFloat(answer),
            Time: elapsedSeconds,
            Points: currentPoints
        }));

        setSubmittedAnswer(answer);
        setAnswer('');
        setElapsedMs(elapsed);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            setAnswer(prev => prev.slice(0, -1));
        } else if (e.key === 'Escape') {
            setAnswer('');
        } else if (e.key === ' ') {
            return;
        } else {
            const key = convertToHalfWidth(e.key);
            if (key.match(/^[0-9.-]$/)) {
                if (key === '-') {
                    if (answer === '' || answer === '-') {
                        setAnswer('-');
                    }
                } else if (key === '.') {
                    if (!answer.includes('.')) {
                        setAnswer(prev => prev + '.');
                    }
                } else {
                    setAnswer(prev => prev + key);
                }
            }
        }
    };

return (
    <div className="question-container">
        <div className="question-box">

        <h2 className="text-xl font-bold mb-4">計算式に答えてください！</h2>

        {/* ポイント表示：計算中は非表示 */}
        {!isStarted && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-black">
            <div className="flex justify-between items-center">
                <div>
                <span className="font-semibold">あなたのポイント: </span>
                <span className="text-blue-600 font-bold">{myPlayer.point}</span>
                </div>
                <div>
                <span className="font-semibold">相手のポイント: </span>
                <span className="text-red-600 font-bold">{opponent.point}</span>
                </div>
            </div>
            </div>
        )}
{!isReady ? (
    <div className="ready-message-center">
    <p className="ready-message-large">スペースキーで準備完了！</p>
    <p className="ready-message-small">両プレイヤーが準備完了すると問題が表示されます</p>
</div>

        
) : (

        <div>
            {countdown !== null ? (
                <div className="text-center">
                <div className="text-6xl font-bold text-red-600 mb-4">
                    {countdown === 'start' ? 'Start!' : countdown}
                </div>
                <p className="text-lg text-gray-600">
                    {countdown === 'start' ? 'ゲーム開始！' : '準備してください！'}
                </p>
                </div>
            ) : !isStarted ? (
                <div>
                <p className="text-lg mb-4 text-green-600">✓ 準備完了！</p>
                <p className="text-sm text-gray-600">
                    相手プレイヤーの準備を待っています... ({readyPlayers.size}/2)
                </p>
                </div>
            ) : isStarted && formula?.question ? (
                <>
                <p className="expression mb-4">{formula.question} = ?</p>
                <p className="text-sm text-blue-600 mb-4">この問題のポイント: {currentPoints}点</p>
                <p className="text-sm text-gray-600 mb-2">
                    操作: 数字キーで入力 → Enterで送信 → Deleteで1文字削除 → Escでクリア
                </p>

                <div className="answer-area">
                    <input
                    type="text"
                    value={answer}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    className="border"
                    placeholder="数字を入力"
                    readOnly
                    />
                    <button
                    onClick={handleSubmit}
                    className="bg-green-500"
                    >
                    解答
                    </button>
                </div>

                {elapsedMs !== null && (
                    <p className="text-blue-600 mt-4">
                    回答までの時間: {(elapsedMs / 1000).toFixed(2)} 秒
                    </p>
                )}
                </>
            ) : (
                <div>
                <p className="text-lg mb-2">問題を待機中...</p>
                <p className="text-sm text-gray-600">計算式を受信中...</p>
                </div>
            )}

            {isIncorrect && submittedAnswer !== null && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
                <p className="text-red-700 font-semibold">× {submittedAnswer}</p>
                </div>
            )}
            </div>
        )}

        </div>
    </div>
);

}
