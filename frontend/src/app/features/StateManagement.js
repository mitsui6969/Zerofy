class StatePointManagement {

    ID; // プレイヤーID
    point; // プレイヤーのポイント
    Bet; // プレイヤーの直近の回答
    CanBet = false; // プレイヤーの回答が適切かどうか

    // コンストラクタ
    constructor(ID, point) {
        this.ID = ID;
        this.point = point;
    }

    // 回答の記録
    SetBet(Bet) {
        // 全角数字だったら半角にして、いずれも数字として扱えるようにする
        this.Bet = Number(Bet.replace(/[０-９]/g, s => 
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));

        this.Bet = (this.Bet < 1 || 9 < this.Bet || this.Bet % 1 !== 0) ? NaN : this.Bet;

        // 要件にあっていないときfalseをかえす
        if(Number.isNaN(this.Bet)) {
            throw new Error("Not Correctly answer");
        }
    }

    // ポイントの更新
    UpdatePoint(point) {
        this.point = point;
    }

    // 状態の表示
    StatePrint() {
        console.log(`ID      : ${this.ID}`);
        console.log(`point   : ${this.point}`);
        console.log(`Bet     : ${this.Bet}`);
        console.log(`CanBet  : ${this.CanBet}`);
    }
}

// ラウンド全体のプレイヤー管理
class RoundStateManagement {
    myself;
    enemy;

    // インスタンスがStatePointManagementではなかったらエラーを返す
    constructor(myself, enemy) {
        if (myself instanceof StatePointManagement && enemy instanceof StatePointManagement) {
            this.myself = myself;
            this.enemy = enemy;
        } else {
            throw new Error("Not Correctly instances");
        }
    }

    // ポイント更新
    UpdatePoint(myPoint, enPoint) {
        this.myself.point = myPoint;
        this.enemy.point  = enPoint;
    }

    // 回答の記録
    SetBet(myBet, enBet) {
        this.myself.SetBet(myBet);
        this.enemy.SetBet(enBet);
    }

    // 状態表示
    Roundinfo() {
        this.myself.StatePrint();
        this.enemy.StatePrint();
    }
}