import { create } from 'zustand';

export const useSocketStore = create((set, get) => ({
    ws: null, // WebSocketのインスタンスを保持
    socket: null,
    isConnected: false,
    phase: 'WAIT', // フェーズ管理
    room: null, // 参加したルームの情報を保持
    player: null, // プレイヤー情報を保持
    points: 20, // 初期ポイント

    // 1. WebSocketに接続する関数
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
            const message = JSON.parse(event.data);

             // JOIN_SUCCESS の場合は WAIT に設定
            if (message.type === 'JOIN_SUCCESS') {
                set({ room: message.room, phase: 'WAIT' });
                return;
            }

            // フェーズ系のメッセージならphase更新
            if (['BET', 'QUESTION', 'RESULT'].includes(message.type)) {
                set({ phase: message.type });
            }
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
}));
