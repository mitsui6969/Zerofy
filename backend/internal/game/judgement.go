package game

import "sync"

var (
	winner string
	mu     sync.Mutex
)

// 正解の変数をCorrectAnswerにしています
func Judgement(ID string, answer int, CorrectAnswer int) string {
	// 排他的処理
	mu.Lock()
	defer mu.Unlock()

	// 正誤判定と一番最初かどうか
	if winner == "" && answer == CorrectAnswer {
		winner = ID
	}

	//勝者を返す。正解者がいなかったら""になる
	return winner
}
