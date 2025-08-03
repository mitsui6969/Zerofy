package game

import (
	"sync"
	"github.com/mitsui6969/Zerofy/backend/internal/matching/room"
)

// 使う変数を構造体にする
type GameState struct {
	WinnerID        string
	mu            sync.Mutex
	currentAnswer float64
}

// 戻り値を構造体にする
type JudgementResult struct {
	WinnerID string
}

// 正解の変数をCorrectAnswerにしています
func (g *GameState) Judgement(ID string, answer float64, currentFormula *room.Formula, players []string) (JudgementResult, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	// IDが空文字の場合
	if ID == "" {
		return JudgementResult{}, ErrInvalidParameter
	}

	if g.currentAnswer != float64(currentFormula.Answer) {
		g.currentAnswer = float64(currentFormula.Answer)
		g.WinnerID = ""
	}
	if g.WinnerID == "" && answer == float64(currentFormula.Answer) {
		g.WinnerID = ID
	}

	return JudgementResult{WinnerID: g.WinnerID}, nil
}
