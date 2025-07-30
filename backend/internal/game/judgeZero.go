package game

import "errors"

// 戻り値のタイプ化
type gameWinner struct {
	winner string
	err    error
}

func judgeZero(P1 PlayerPointInfo, P2 PlayerPointInfo) gameWinner {

	// ゼロになったら勝者決定
	if P1.Point == 0 {
		return gameWinner{
			winner: P1.ID,
			err:    nil,
		}
	} else if P2.Point == 0 {
		return gameWinner{
			winner: P2.ID,
			err:    nil,
		}
	}

	// ゼロがいなかったらエラーを返す
	return gameWinner{
		winner: "",
		err:    errors.New("Cannot Find Zero"),
	}
}
