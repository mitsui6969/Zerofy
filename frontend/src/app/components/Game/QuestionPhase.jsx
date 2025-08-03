import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socketStore';
import { usePlayerStore } from '../../features/payer/playerStore';

export default function QuestionPhase() {
    const { socket, isConnected, readyPlayers, formula, currentPoints, resetReadyState, resetIncorrectState, phase, isIncorrect, incorrectAnswer } = useSocketStore();
    const { myPlayer, opponent } = usePlayerStore();
    const [answer, setAnswer] = useState('');
    const [elapsedMs, setElapsedMs] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [submittedAnswer, setSubmittedAnswer] = useState(null);
    const inputRef = useRef(null);
    const startTimeRef = useRef(null);

    // コンポーネントマウント時とRESULTフェーズからQUESTIONフェーズに戻る際に準備状態をリセット
    useEffect(() => {
        resetReadyState();
        setIsReady(false);
        setIsStarted(false);
        setAnswer('');
        setElapsedMs(null);
        setSubmittedAnswer(null);
        
        // 新しいQUESTIONフェーズの開始時のみ不正解状態をリセット
        if (phase === 'QUESTION') {
            resetIncorrectState();
        }
    }, [phase, resetReadyState, resetIncorrectState]);

    // 半角数字に変換する関数
    const convertToHalfWidth = (str) => {
        return str
            .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
            .replace(/[ー－]/g, '-')
            .replace(/[。]/g, '.');
    };

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

    // 準備完了後またはゲーム開始後に自動的に入力フィールドにフォーカス
    useEffect(() => {
        if ((isReady || isStarted) && inputRef.current) {
            // 少し遅延を入れてフォーカスを設定
            const timer = setTimeout(() => {
                inputRef.current.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isReady, isStarted]);

    const handleSubmit = () => {
        const endTime = Date.now();
        const elapsed = endTime - startTimeRef.current;
        const elapsedSeconds = elapsed / 1000; // 秒数に変換

        // ポイント関係のログ出力
        console.log('=== 回答送信ログ ===');
        console.log('自分のポイント:', myPlayer.point);
        console.log('相手のポイント:', opponent.point);
        console.log('問題のポイント:', currentPoints);
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
        
        // 送信した回答を保存
        setSubmittedAnswer(answer);
        // 回答を送信したら入力欄をリセット
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
            
            {/* ポイント表示 */}
            <div className="mb-4 p-3 bg-gray-100 rounded">
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
                            // 半角数字に変換
                            const convertedValue = convertToHalfWidth(value);
                            // 数字、マイナス記号、小数点のみ許可（ハイフンは先頭のみ）
                            if (convertedValue.match(/^-?[0-9.]*$/) || convertedValue === '-') {
                                setAnswer(convertedValue);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        ref={inputRef}
                        className="border p-2 mr-2"
                        disabled={!isStarted}
                        placeholder="数字を入力してください"
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
                    
                    {/* 不正解表示 */}
                    {isIncorrect && submittedAnswer !== null && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
                            <p className="text-red-700 font-semibold">× {submittedAnswer}</p>
                        </div>
                    )}
                    
                    {/* デバッグ情報 */}
                    <div className="mt-2 text-xs text-gray-500">
                        <p>isIncorrect: {isIncorrect.toString()}</p>
                        <p>submittedAnswer: {submittedAnswer}</p>
                        <p>phase: {phase}</p>
                    </div>
                </div>
            )}
        </div>
    );
}