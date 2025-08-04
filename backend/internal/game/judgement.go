package game

import (
	"sync"
	"github.com/mitsui6969/Zerofy/backend/internal/matching/room")

// 使う変数を構造体にする
type gameState struct {
	winner        string
	mu            sync.Mutex
	currentAnswer int
	Round         int    // ラウンド番号を追跡
	Formula       string // 計算式を保持しておく
}

// 戻り値を構造体にする
type JudgementResult struct {
	winnerID string
}

// 正解の変数をCorrectAnswerにしています
func (g *gameState) Judgement(
		ID string, 
		answer int, 
		CorrectAnswer int, 
		players []*PlayerPoint,
		r *room.Room,
	) (JudgementResult, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	// IDが空文字の場合
	if ID == "" {
		return JudgementResult{}, ErrInvalidParameter
	}

	// プレイヤー検索
	var currentPlayer *PlayerPoint
	found := false
	for _, p := range players {
		if p.ID == ID {
			currentPlayer = p
			found = true
			break
		}
	}
	if !found {
		return JudgementResult{}, ErrInvalidParameter
	}

	// 正答更新
	if g.currentAnswer != CorrectAnswer {
		g.currentAnswer = CorrectAnswer
		g.winner = ""
	}

	// 勝者がまだいない & 正解した場合
	if g.winner == "" && answer == CorrectAnswer {
		g.winner = ID

		// RoundLog作成
		log := NewRoundLog(g.Round, g.Formula, float64(answer), ID)

		// 個人ログに追加
		currentPlayer.RoundLogs = append(currentPlayer.RoundLogs, log)

		// 部屋全体のログに追加
		r.AddRoundLog(log)
	}

	return JudgementResult{winnerID: g.winner}, nil
}
