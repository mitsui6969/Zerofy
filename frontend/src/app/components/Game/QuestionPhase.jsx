import React, { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socketStore';
import { usePlayerStore } from '../../features/payer/playerStore';

export default function QuestionPhase() {
    const { socket, isConnected, readyPlayers, formula, currentPoints, resetReadyState, resetIncorrectState, phase, isIncorrect } = useSocketStore();
    const { myPlayer, opponent } = usePlayerStore();
    const [answer, setAnswer] = useState('');
    const [elapsedMs, setElapsedMs] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [submittedAnswer, setSubmittedAnswer] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const inputRef = useRef(null);
    const startTimeRef = useRef(null);

    const inCorrectSound = () => {
        const audio = new Audio("/sound/ビープ音4.mp3");
        audio.play();
    };

    useEffect(() => {
    if (
        submittedAnswer !== null &&
        formula &&
        Number(submittedAnswer) !== Number(formula.answer)
    ) {
        inCorrectSound();
    }
}, [submittedAnswer, formula]);
    // コンポーネントマウント時とRESULTフェーズからQUESTIONフェーズに戻る際に準備状態をリセット
    useEffect(() => {
        resetReadyState();
        setIsReady(false);
        setIsStarted(false);
        setAnswer('');
        setElapsedMs(null);
        setSubmittedAnswer(null);
        setCountdown(null);
        
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

    // 計算式が受信されたらカウントダウン開始
    useEffect(() => {
        if (formula && !isStarted && countdown === null) {
            console.log('カウントダウン開始');
            setCountdown(3);
        }
    }, [formula, isStarted, countdown]);

    // カウントダウン処理
    useEffect(() => {
        // カウントダウンが不要な場合は処理を中断
        if (countdown === null || isStarted) return;
    
        let timer;
    
        if (typeof countdown === 'number' && countdown > 0) {
            // カウントダウン中 (3, 2, 1)
            timer = setTimeout(() => {
                setCountdown(prev => (typeof prev === 'number' ? prev - 1 : prev));
            }, 1000);
        } else if (countdown === 0) {
            // カウントダウンが0になったら "start" に状態を移行
            setCountdown("start");
        } else if (countdown === "start") {
            // "Start!" と表示した状態で1秒待機
            timer = setTimeout(() => {
                console.log("Start!表示終了、計算式表示開始");
                console.log("formula.question:", formula.question); // デバッグ用ログ
                setIsStarted(true);
                startTimeRef.current = Date.now();
                setCountdown(null); // ゲーム開始と同時にカウントダウン状態をリセット
            }, 1000); // "Start!" の表示時間
        }
    
        return () => clearTimeout(timer);
    }, [countdown, isStarted]);
    

    // ゲーム開始後にキーボードイベントリスナーを追加
    useEffect(() => {
        if (isStarted) {
            const handleGlobalKeyDown = (e) => {
                // 入力欄にフォーカスがある場合は無視（重複を避ける）
                if (e.target === inputRef.current) {
                    return;
                }
                handleKeyDown(e);
            };

            document.addEventListener('keydown', handleGlobalKeyDown);
            
            return () => {
                document.removeEventListener('keydown', handleGlobalKeyDown);
            };
        }
    }, [isStarted, answer]); // answerを依存配列に追加

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
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            // デリートで1文字取り消し
            setAnswer(prev => prev.slice(0, -1));
        } else if (e.key === 'Escape') {
            // エスケープで入力欄をクリア
            setAnswer('');
        } else if (e.key === ' ') {
            // スペースキーは準備完了用なので無視
            return;
        } else {
            // 数字、マイナス、小数点の入力処理
            const key = e.key;
            const convertedKey = convertToHalfWidth(key);
            
            // 有効な文字かチェック
            if (convertedKey.match(/^[0-9.-]$/)) {
                // マイナス記号は先頭のみ許可
                if (convertedKey === '-') {
                    if (answer === '' || answer === '-') {
                        setAnswer('-');
                    }
                }
                // 小数点は1つまで許可
                else if (convertedKey === '.') {
                    if (!answer.includes('.')) {
                        setAnswer(prev => prev + '.');
                    }
                }
                // 数字は常に許可
                else {
                    setAnswer(prev => prev + convertedKey);
                }
            }
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
                            <p className="text-lg mb-4">スペースキーで準備完了！</p>
                            <p className="text-sm text-gray-600">両プレイヤーが準備完了すると同時に問題が表示されます</p>
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
                            ) : isStarted && formula && formula.question ? (
                                <div>
                                    <p className="text-lg mb-2">{formula.question} = ?</p>
                                    <p className="text-sm text-blue-600 mb-4">この問題のポイント: {currentPoints}点</p>
                                    <p className="text-sm text-gray-600 mb-2">
                                        操作: 数字キーで入力 → Enterで送信 → Deleteで1文字削除 → Escでクリア
                                    </p>

                                    {/* 入力欄 */}
                                    <div>
                                        <input
                                            type="text"
                                            value={answer}
                                            onKeyDown={handleKeyDown}
                                            ref={inputRef}
                                            className="border p-2 mr-2"
                                            placeholder="キーボードで数字を入力してください"
                                            readOnly
                                        />
                                        <button
                                            onClick={handleSubmit}
                                            className="bg-green-500 text-white px-4 py-2 rounded"
                                        >
                                            解答
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg mb-2">問題を待機中...</p>
                                    <p className="text-sm text-gray-600">計算式を受信中...</p>
                                </div>
                            )}
                            
                            {/* {isStarted && formula && (
                                <>
                                    <input
                                        type="text"
                                        value={answer}
                                        onKeyDown={handleKeyDown}
                                        ref={inputRef}
                                        className="border p-2 mr-2"
                                        placeholder="キーボードで数字を入力してください"
                                        readOnly
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                    >
                                        解答
                                    </button>
                                </>
                            )} */}
                            
                            {/* ここで経過時間を表示 */}
                            {elapsedMs !== null && (
                                <p className="mt-4 text-blue-600">
                                    {submittedAnswer}
                                </p>
                            )}
                            
                            {/* 不正解表示 */}
                            {isIncorrect && submittedAnswer !== null && (
                                <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
                                    <p className="text-red-700 font-semibold">× {submittedAnswer}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}