// ブラウザのコンソールで実行するテストスクリプト
// フロントエンドのゲームページ（http://localhost:3000/game）で実行してください

// WebSocketストアを取得
const socketStore = window.__ZUSTAND_STORE__ || 
    (window.store && window.store.getState ? window.store : null);

if (!socketStore) {
    console.error('SocketStoreが見つかりません。ゲームページで実行してください。');
} else {
    console.log('SocketStoreが見つかりました');
    
    // テスト用のGAME_ENDメッセージを作成
    const testGameEndMessage = {
        type: 'GAME_END',
        winner: 'player1',
        winnerID: 'test_player_1',
        roundResults: [
            {
                P1: { 'test_player_1': 20 },
                P2: { 'test_player_2': 20 }
            },
            {
                P1: { 'test_player_1': 16 },
                P2: { 'test_player_2': 20 }
            },
            {
                P1: { 'test_player_1': 10 },
                P2: { 'test_player_2': 20 }
            },
            {
                P1: { 'test_player_1': 10 },
                P2: { 'test_player_2': 16 }
            },
            {
                P1: { 'test_player_1': 10 },
                P2: { 'test_player_2': 15 }
            },
            {
                P1: { 'test_player_1': 5 },
                P2: { 'test_player_2': 15 }
            },
            {
                P1: { 'test_player_1': 0 },
                P2: { 'test_player_2': 15 }
            }
        ],
        finalScores: {
            'test_player_1': 0,
            'test_player_2': 15
        }
    };
    
    // 手動でメッセージを処理（WebSocketのonmessageをシミュレート）
    const event = {
        data: JSON.stringify(testGameEndMessage)
    };
    
    // socketStoreのonmessageハンドラーを直接呼び出し
    if (socketStore.socket && socketStore.socket.onmessage) {
        socketStore.socket.onmessage(event);
        console.log('テストメッセージを送信しました');
        console.log('現在のフェーズ:', socketStore.getState().phase);
        console.log('ゲーム結果:', socketStore.getState().gameResult);
    } else {
        console.log('手動でフェーズとゲーム結果を設定します');
        socketStore.setState({
            phase: 'END',
            gameResult: {
                winner: 'player1',
                winnerID: 'test_player_1',
                roundResults: testGameEndMessage.roundResults,
                finalScores: testGameEndMessage.finalScores
            }
        });
    }
}

// 現在の状態を確認する関数
function checkState() {
    if (socketStore) {
        const state = socketStore.getState();
        console.log('現在の状態:', {
            phase: state.phase,
            gameResult: state.gameResult,
            isConnected: state.isConnected
        });
    }
}

// 状態をリセットする関数
function resetState() {
    if (socketStore) {
        socketStore.setState({
            phase: 'WAIT',
            gameResult: null
        });
        console.log('状態をリセットしました');
    }
}

console.log('テスト関数が利用可能です:');
console.log('- checkState(): 現在の状態を確認');
console.log('- resetState(): 状態をリセット'); 