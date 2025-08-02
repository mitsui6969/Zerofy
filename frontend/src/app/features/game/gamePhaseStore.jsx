import {useState, useEffect} from "react";

// 該当ファイルのフェーズと紐づける
const RoundState = {
    StateBetting : 0,
    StateQuestion : 1,
    StateAnswering : 2,
    StateResult : 3,
};


export default function RoundPhase() {
    const [Phase, setPhase] = useState(RoundState.StateBetting);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080/ws/round");

        socket.onopen = () => {
            console.log("WebSocket接続成功");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data && typeof data.state === "number") {
                    setPhase(data.state);
                }
            } catch (err) {
                console.error("WebSocketデータ解析エラー:", err);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocketエラー:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket接続終了");
        };

        return () => {
            socket.close();
        };
    }, []);


    // フェーズ名を返す
    switch (Phase) {
        case RoundState.StateBetting:
            return "BET";
        case RoundState.StateQuestion:
            return "QUESTION";
        case RoundState.StateAnswering:
            return "ANSWERING";
        case RoundState.StateResult:
            return "RESULT";
        default:
            throw new Error("Not Found State");
    }
}