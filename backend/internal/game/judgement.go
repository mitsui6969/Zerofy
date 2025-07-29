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
func (g *gameState) Judgement(ID string, answer int, CorrectAnswer int) JudgementResult {
	// 排他的処理
	g.mu.Lock()
	defer g.mu.Unlock()

	// 答えが変わったらwinnerをリセットする
	if g.currentAnswer != CorrectAnswer {
		g.currentAnswer = CorrectAnswer
		g.winner = ""
	}

	// 正誤判定と一番最初かどうか
	if g.winner == "" && answer == CorrectAnswer {
		g.winner = ID
	}

	//勝者を返す。正解者がいなかったら""になる
	return JudgementResult{winnerID: g.winner}
}
