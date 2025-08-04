import { create } from 'zustand';
import { usePlayerStore } from '../features/payer/playerStore';

export const useSocketStore = create((set, get) => ({
    ws: null, // WebSocketのインスタンスを保持
    socket: null,
    isConnected: false,
    phase: 'WAIT', // フェーズ管理
    room: null, // 参加したルームの情報を保持
    player: null, // プレイヤー情報を保持
    points: 20, // 初期ポイント
    setPhase: (newPhase) => set({ phase: newPhase }), // フェーズを更新する関数
    currentFormula: null, // 現在の計算式
    currentPoints: 0, // 現在の問題のポイント
    readyPlayers: new Set(), // 準備完了したプレイヤーを管理
    formula: null, // 計算式を保持
    isIncorrect: false, // 不正解フラグ
    incorrectAnswer: null, // 不正解の回答

    // 1. WbSocketに接続する関数
    connect: (initialMessage) => {
        // 既に接続済みの場合は何もしない
        if (get().socket) return;

        const ws = new WebSocket("ws://localhost:8080/ws");

        ws.onopen = () => {
            console.log("✅ WebSocket connected!");
            set({ socket: ws, isConnected: true });
            // 接続が確立したらJOINメッセージを送信
            if (initialMessage) {
                get().sendMessage(initialMessage);
            }
        };

        // メッセージ受信時の処理
        ws.onmessage = (event) => {
            console.log("✉️ Message from server: ", event.data);
            
            // 複数のJSONメッセージが連続している可能性があるため、改行で分割
            const messages = event.data.split('\n').filter(msg => msg.trim());
            
            messages.forEach(messageStr => {
                try {
                    const message = JSON.parse(messageStr);
                    
                    // JOIN_SUCCESS の場合は WAIT に設定
                    if (message.type === 'JOIN_SUCCESS') {
                        set({ room: message.room, phase: 'WAIT' });
                        const playerStore = usePlayerStore.getState();
                        if (message.room && message.room.players && message.playerID) {
                            // サーバーから自分のIDを受け取る
                            const myId = message.playerID;
                            // 相手のIDは自分以外
                            const opponentId = message.room.players.find(id => id !== myId);
                            playerStore.initPlayers(myId, opponentId || null);
                            console.log('プレイヤーストアを初期化しました:', { myId, opponentId: opponentId || null });
                        }
                        return;
                    }

                    // プレイヤーの準備完了メッセージ
                    if (message.type === 'PLAYER_READY') {
                        const { readyPlayers } = get();
                        readyPlayers.add(message.playerID);
                        set({ readyPlayers: new Set(readyPlayers) });
                        console.log('Player ready:', message.playerID);
                        return;
                    }

                    // ベットメッセージ
                    if (message.type === 'Bet') {
                        const playerStore = usePlayerStore.getState();
                        if (message.Bet && message.playerID) {
                            // 相手のベット情報を保存
                            if (message.playerID !== playerStore.myPlayer.id) {
                                playerStore.setOpponentBet(message.Bet);
                                console.log('相手のベット情報を保存しました:', message.Bet);
                            }
                        }
                        return;
                    }

                    // 計算式メッセージ
                    if (message.type === 'FORMULA') {
                        set({ 
                            formula: {
                                question: message.Question,
                                answer: message.Answer
                            },
                            currentPoints: message.Points || 0,
                            phase: 'QUESTION'
                        });
                        
                        // ポイント関係のログ出力
                        console.log('=== 計算式受信ログ ===');
                        console.log('問題のポイント:', message.Points);
                        
                        return;
                    }

                    // 勝敗結果メッセージ
                    if (message.type === 'RESULT') {
                        const playerStore = usePlayerStore.getState();
                        const isWinner = message.winner === playerStore.myPlayer.id;

                        // ポイントをサーバー値で直接上書き
                        if (isWinner) {
                            playerStore.setMyPoint(message.winnerPoint);
                        } else if (message.winner === playerStore.opponent.id) {
                            playerStore.setOpponentPoint(message.winnerPoint);
                        }

                        set({ 
                            phase: 'RESULT',
                            winner: message.winner,
                            correctAnswer: message.answer,
                            formula: null,
                            isIncorrect: !isWinner,
                            incorrectAnswer: !isWinner ? message.answer : null
                        });

                        return;
                    }

                    // 終了メッセージ
                    if (message.type === 'END') {
                        set({ phase: 'END', winner: message.winner });
                        return;
                    }

                    // フェーズ系のメッセージならphase更新
                    if (['END', 'QUESTION', 'RESULT'].includes(message.type)) {
                        set({ phase: message.type });

                        // QUESTIONメッセージの場合は式も保存
                        if (message.type === 'QUESTION' && message.formula) {
                            set({ 
                                currentFormula: message.formula,
                                currentPoints: message.formula.Points || 0
                            });
                            console.log('Formula saved in store:', message.formula.Question, 'Points:', message.formula.Points);
                            
                            // プレイヤーストアの相手IDを更新（2人目のプレイヤーが参加した場合）
                            if (message.room && message.room.players && message.room.players.length >= 2) {
                                const playerStore = usePlayerStore.getState();
                                // 現在の自分のIDを保持
                                const currentMyId = playerStore.myPlayer.id;
                                // 相手のIDは自分以外
                                const opponentId = message.room.players.find(id => id !== currentMyId);
                                if (opponentId && playerStore.opponent.id !== opponentId) {
                                    playerStore.initPlayers(currentMyId, opponentId);
                                    console.log('プレイヤーストアを更新しました:', { myId: currentMyId, opponentId });
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error parsing message:', error, 'Raw message:', messageStr);
                }
            });
        };

        ws.onclose = () => {
            console.log("✂️ WebSocket disconnected");
            set({ socket: null, isConnected: false, room: null });
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            set({ socket: null, isConnected: false, room: null });
        };
    },

    // 2. メッセージを送信する関数
    sendMessage: (message) => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) {
            try {
                socket.send(JSON.stringify(message));
                console.log("📤 Sent message:", message);
            } catch(err){
                console.error("❌✉️ Failed to send message:", err);
            }
        } else {
            console.error("❌ WebSocket is not connected.");
        }
    },

    // 3. 接続を切断する関数
    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.close();
        }
        set({ socket: null, isConnected: false, room: null });
    },

    // 4. 準備状態をリセットする関数
    resetReadyState: () => {
        set({ readyPlayers: new Set() });
    },

    // 5. 不正解状態をリセットする関数
    resetIncorrectState: () => {
        set({ isIncorrect: false, incorrectAnswer: null });
    },
}));
