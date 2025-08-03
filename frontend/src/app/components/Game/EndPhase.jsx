import React from 'react';

export default function EndPhase() {
    //aaa//
    const roundData = [
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

    return (
        <div id="score-container">
            <h2>Zerofy RESULT</h2>
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