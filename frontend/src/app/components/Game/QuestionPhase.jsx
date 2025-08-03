import React, { useState, useEffect, useRef } from 'react';
import "../../style/QuestionPhase.css";

export default function QuestionPhase({ data, ws }) {
    const [isStarted, setIsStarted] = useState(false);
    const expression = "1+1"; // 仮のデータ
  // const { expression } = data; // 本番用データ
    const [answer, setAnswer] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
    const handleStartGame = (e) => {
        if (!isStarted && e.key === ' ') {
            e.preventDefault();
            setIsStarted(true);
        }
    };

    document.addEventListener('keydown', handleStartGame);

    if (isStarted && inputRef.current) {
    inputRef.current.focus();
    }

    return () => {
        document.removeEventListener('keydown', handleStartGame);
    };
    }, [isStarted]);

    const handleSubmit = () => {
    ws.send(JSON.stringify({
        type: 'ANSWER',
        payload: {
            answer: parseFloat(answer),
            timeAt: new Date().toISOString(),
        },
    }));
    setAnswer('');
};

const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
};

return (
    <div className="container">
        <div className="header">
        <h2 className="title">計算式に答えてください！</h2>
        {!isStarted && (
            <p className="description">
            スペースキーで準備完了！<br />
            Enterで解答を送信できます！
            </p>
        )}
    </div>

    {isStarted && (
        <>
        <div className="question">
            <p className="expression">{expression} = ?</p>
        </div>

        <div className="input-container">
            <label className="answer-label" htmlFor="answer">解答：</label>
            <input    
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value.match(/^[0-9.]*$/)) {
                        setAnswer(value);
                    }
                }}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                className="answer-input"
                />
            </div>
        </>
    )}
    </div>
);
}
