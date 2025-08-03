import { create } from "zustand";


function normalizeBet(bet) {
    // 全角数字→半角数字に変換
    const half = bet.replace(/[０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    );
    const num = Number(half);

    // 1〜9 の整数のみ許可
    if (Number.isInteger(num) && num >= 1 && num <= 9) return num;
    return NaN;
    }

export const usePlayerStore = create((set, get) => ({
    myPlayer: {
        id: null,
        point: 20,
        bet: null,
    },
    opponent: {
        id: null,
        point: 20,
        bet: null,
    },

    // 初期化
    initPlayers: (myId, opponentId) =>
        set({
        myPlayer: { id: myId, point: 20, bet: null },
        opponent: { id: opponentId, point: 20, bet: null },
        }),

    // ポイント更新
    updatePoints: (myPoint, opponentPoint) =>
        set((state) => ({
        myPlayer: { ...state.myPlayer, point: myPoint },
        opponent: { ...state.opponent, point: opponentPoint },
        })),

    // 自分のBetを設定（フロント入力用）
    setMyBet: (betStr) => {
        const bet = normalizeBet(betStr);
        if (Number.isNaN(bet)) throw new Error("Invalid Bet (1〜9の整数のみ)");
        set((state) => ({
        myPlayer: { ...state.myPlayer, bet },
        }));
    },

    // 相手Betを反映（サーバー受信用）
    setOpponentBet: (bet) =>
        set((state) => ({
        opponent: { ...state.opponent, bet },
        })),

    // 勝敗結果を処理してポイントを更新
    processResult: (winner, myBet, opponentBet) =>
        set((state) => {
            let newMyPoint = state.myPlayer.point;
            let newOpponentPoint = state.opponent.point;

            // ログ出力
            console.log('=== ポイント更新ログ ===');
            console.log('勝者:', winner);
            console.log('自分のID:', state.myPlayer.id);
            console.log('相手のID:', state.opponent.id);
            console.log('更新前の自分のポイント:', state.myPlayer.point);
            console.log('更新前の相手のポイント:', state.opponent.point);

            // 勝ったプレイヤーのポイントを減らす
            if (winner === state.myPlayer.id) {
                newMyPoint -= myBet;
                if (newMyPoint < 0) newMyPoint = 0;
                console.log('自分が勝ちました。ポイントを減らします:', myBet);
            } else if (winner === state.opponent.id) {
                newOpponentPoint -= opponentBet;
                if (newOpponentPoint < 0) newOpponentPoint = 0;
                console.log('相手が勝ちました。相手のポイントを減らします:', opponentBet);
            } else {
                console.log('勝者が不明です。勝者ID:', winner);
            }

            console.log('更新後の自分のポイント:', newMyPoint);
            console.log('更新後の相手のポイント:', newOpponentPoint);

            return {
                myPlayer: { ...state.myPlayer, point: newMyPoint },
                opponent: { ...state.opponent, point: newOpponentPoint },
            };
        }),

    // デバッグ表示用
    logState: () => {
        const state = get();
        console.log("=== Player State ===");
        console.log("Myself:", state.myPlayer);
        console.log("Opponent:", state.opponent);
    },
}));
