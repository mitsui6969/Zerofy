package game

import "sync"

// 使う変数を構造体にする
type gameState struct {
	winner        string
	mu            sync.Mutex
	currentAnswer int
}

// 戻り値を構造体にする
type JudgementResult struct {
	winnerID string
}

// 正解の変数をCorrectAnswerにしています
func (g *gameState) Judgement(ID string, answer int, CorrectAnswer int, players []string) (JudgementResult, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	// IDが空文字の場合
	if ID == "" {
		return JudgementResult{}, ErrInvalidParameter
	}

	// 未登録プレイヤーの場合
	found := false
	for _, p := range players {
		if p == ID {
			found = true
			break
		}
	}
	if !found {
		return JudgementResult{}, ErrInvalidParameter
	}

	if g.currentAnswer != CorrectAnswer {
		g.currentAnswer = CorrectAnswer
		g.winner = ""
	}
	if g.winner == "" && answer == CorrectAnswer {
		g.winner = ID
	}

	return JudgementResult{winnerID: g.winner}, nil
}
