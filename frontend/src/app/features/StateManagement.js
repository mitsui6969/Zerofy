class StateManagement {

    ID; // プレイヤーID
    point; // プレイヤーのポイント
    answer; // プレイヤーの直近の回答
    isAnswer = false; // プレイヤーの回答が適切かどうか

    // コンストラクタ
    constructor(ID, point) {
        this.ID = ID;
        this.point = point;
    }

    // 回答の記録
    Answered(answer) {
        // 全角数字だったら半角にして、いずれも数字として扱えるようにする
        this.answer = Number(answer.replace(/[０-９]/g, s => 
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));

        // 何らかの理由で変換できないときfalseを返す
        this.isAnswer = !(Number.isNaN(this.answer));
    }

    // ポイントの更新
    UpdatePoint(point) {
        this.point = point;
    }

    // 状態の表示（いるかわからんけど）
    StatePrint() {
        console.log(`ID      : ${this.ID}`);
        console.log(`point   : ${this.point}`);
        console.log(`answer  : ${this.answer}`);
        console.log(`isAnswer: ${this.isAnswer}`);
    }
}