package game

import (
	"errors"
	"strings"
)

// 引数の情報をPlayerごとにタイプ化
type PlayerPointInfo struct {
	ID    string
	Point int
}

// 戻り値をまとめる。
type RoundResult struct {
	P1Point  int
	P2Point  int
	Winner   string
	Decrease int
	Err      error
}

// 計算式から減点ポイントを決定
func GetDecreasePoint(formula string) int {
	if strings.Contains(formula, "+") || strings.Contains(formula, "-") {
		return 2
	}
	if strings.Contains(formula, "×") || strings.Contains(formula, "*") || strings.Contains(formula, "÷") || strings.Contains(formula, "/") {
		return 5
	}
	return 2 // デフォルト
}

func PointControl(P1 PlayerPointInfo, P2 PlayerPointInfo, winner string, formula string) RoundResult {
	if P1.Point == 0 || P2.Point == 0 {
		return RoundResult{
			P1Point:  P1.Point,
			P2Point:  P2.Point,
			Winner:   winner,
			Decrease: 0,
			Err:      errors.New("Either Point Zero"),
		}
	}

	decrease := GetDecreasePoint(formula)

	if P1.ID == winner {
		P1.Point -= decrease
		if P1.Point < 0 {
			P1.Point = 0
		}
	} else if P2.ID == winner {
		P2.Point -= decrease
		if P2.Point < 0 {
			P2.Point = 0
		}
	} else {
		return RoundResult{
			P1Point:  P1.Point,
			P2Point:  P2.Point,
			Winner:   "",
			Decrease: 0,
			Err:      errors.New("Winner Not Found"),
		}
	}

	return RoundResult{
		P1Point:  P1.Point,
		P2Point:  P2.Point,
		Winner:   winner,
		Decrease: decrease,
		Err:      nil,
	}
}
