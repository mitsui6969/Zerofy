const WebSocket = require('ws');

// WebSocketサーバーに接続
const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', function open() {
    console.log('WebSocket接続成功');
    
    // まずJOINメッセージを送信（ルームに参加）
    const joinMessage = {
        type: 'JOIN',
        roomID: 'test123',
        playerID: 'test_player_1',
        playerName: 'テストプレイヤー1',
        isFriend: true
    };
    
    ws.send(JSON.stringify(joinMessage));
    console.log('JOINメッセージ送信:', joinMessage);
    
    // 3秒後にGAME_ENDメッセージを送信
    setTimeout(() => {
        const gameEndMessage = {
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
        
        ws.send(JSON.stringify(gameEndMessage));
        console.log('GAME_ENDメッセージ送信:', gameEndMessage);
        
        // 5秒後に接続を閉じる
        setTimeout(() => {
            ws.close();
            console.log('WebSocket接続終了');
        }, 5000);
        
    }, 3000);
});

ws.on('message', function message(data) {
    console.log('受信メッセージ:', data.toString());
});

ws.on('error', function error(err) {
    console.error('WebSocketエラー:', err);
});

ws.on('close', function close() {
    console.log('WebSocket接続終了');
}); 