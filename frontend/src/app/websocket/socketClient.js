// src/websocket/socketClient.js
import { usePlayerStore } from "../features/player/playerStore";
// import { useGamePhaseStore } from "@/features/game/gamePhaseStore";

let socket = null;

export function connectWebSocket() {
    if (socket && socket.readyState === WebSocket.OPEN) return;

    // 実際のURLに合わせる
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
        console.log("✅ WebSocket connected");
        // 必要ならここで自分の情報を送信
        // socket.send(JSON.stringify({ type: "JOIN", name: "player1" }));
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("📩 Received:", message);

        switch (message.type) {
            case "INIT": // 初回接続時のIDと対戦相手ID
                usePlayerStore.getState().initPlayers(message.myId, message.opponentId);
                break;

            case "UPDATE_POINTS":
                usePlayerStore.getState().updatePoints(message.myPoint, message.opponentPoint);
                break;

            case "OPPONENT_BET":
                usePlayerStore.getState().setOpponentBet(message.bet);
                break;

            case "GAME_PHASE":
                // ゲームフェーズ更新
                // useGamePhaseStore.getState().setPhase(message.phase);
                break;

            default:
                console.log("Unknown message type:", message.type);
            }
    };

    socket.onclose = () => {
        console.log("❌ WebSocket disconnected");
        // 必要に応じて再接続処理を書く
    };
    }

    export function sendMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.warn("⚠️ WebSocket not connected");
    }
}
