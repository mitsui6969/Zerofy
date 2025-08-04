import { create } from "zustand";


export const usePlayerStore = create((set, get) => ({
    myPlayer: {
        id: '',
        point: 20,
    },
    opponent: {
        id: '',
        point: 20,
    },

    // プレイヤーID初期化（ポイントはリセットしない！）
    initPlayers: (myId, opponentId) =>
        set((state) => ({
            myPlayer: { ...state.myPlayer, id: myId },
            opponent: { ...state.opponent, id: opponentId },
        })),

    // サーバーから受け取ったポイントで自分のポイントを更新
    setMyPoint: (point) =>
        set((state) => ({
            myPlayer: { ...state.myPlayer, point }
        })),

    // サーバーから受け取ったポイントで相手のポイントを更新
    setOpponentPoint: (point) =>
        set((state) => ({
            opponent: { ...state.opponent, point }
        })),

    // デバッグ用
    logState: () => {
        const state = get();
        console.log("=== Player State ===");
        console.log("Myself:", state.myPlayer);
        console.log("Opponent:", state.opponent);
    },
}));
