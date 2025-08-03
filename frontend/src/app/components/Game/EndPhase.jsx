import React from 'react';
import { useSocketStore } from '../../store/socketStore';

export default function EndPhase({ gameResult: propGameResult }) {
    const storeGameResult = useSocketStore((state) => state.gameResult);
    
    // propsまたはstoreからgameResultを取得
    const gameResult = propGameResult || storeGameResult;
    
    // ゲーム結果がない場合はデフォルトデータを使用
    const roundData = gameResult?.roundResults || [
        { はなこ: 20, たろう: 20 },
        { はなこ: 16, たろう: 20 },
        { はなこ: 10, たろう: 20 },
        { はなこ: 10, たろう: 16 },
        { はなこ: 10, たろう: 15 },
        { はなこ: 5, たろう: 15 },
        { はなこ: 0, たろう: 15 },
    ];

    const renderTable = () => {
        const keys = Object.keys(roundData[0]);

        return (
            <table>
                <thead>
                    <tr>
                        <th>ラウンド</th>
                        {keys.map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {roundData.map((round, index) => (
                        <tr key={index}>
                            <td>{index}</td>
                            {keys.map((key) => (
                                <td key={key}>{round[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // 勝敗表示を取得
    const getWinnerDisplay = () => {
        if (!gameResult) return "ゲーム終了";
        
        if (gameResult.winner === "draw") {
            return "引き分け！";
        } else if (gameResult.winner === "player1") {
            return "プレイヤー1の勝利！";
        } else if (gameResult.winner === "player2") {
            return "プレイヤー2の勝利！";
        } else {
            return "ゲーム終了";
        }
    };

    return (
        <div id="score-container">
            <h2>Zerofy RESULT</h2>
            <div id="winner-display">
                <h3>{getWinnerDisplay()}</h3>
            </div>
            <div id="table-wrapper">
                {renderTable()}
                <div id="button-container">
                    <a href="/" className="corner-button">
                        Zerofyページへ →
                    </a>
                </div>
            </div>
        </div>
    );
}