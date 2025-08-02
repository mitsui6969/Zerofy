package game

import "errors"

// 引数の情報をPlayerごとにタイプ化
type PlayerPointInfo struct {
	ID    string
	Point int
	Bet   int
}

// 戻り値をまとめる。
type RoundResult struct {
	P1Point int
	P2Point int
	Err     error
}

func pointControl(P1 PlayerPointInfo, P2 PlayerPointInfo, winner string) RoundResult {

	if P1.Point == 0 || P2.Point == 0 {
		return RoundResult{
			P1Point: P1.Point,
			P2Point: P2.Point,
			Err:     errors.New("Either Point Zero"),
		}
	}

	// winner（勝者）のほうにBetを渡す
	if P1.ID == winner {
		P1.Point -= P1.Bet
		if P1.Point < 0 {
			P1.Point = 0
		}
	} else if P2.ID == winner {
		P2.Point -= P2.Bet
		if P2.Point < 0 {
			P2.Point = 0
		}
	} else {
		// 何らかの理由で勝者が見つからない場合Errを返す
		return RoundResult{
			P1Point: P1.Point,
			P2Point: P2.Point,
			Err:     errors.New("Winner Not Found"),
		}
	}

	// 構造体で返す
	return RoundResult{
		P1Point: P1.Point,
		P2Point: P2.Point,
		Err:     nil,
	}
}
