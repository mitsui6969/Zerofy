package game

import (
	"sync"
)

type RoundState int

const (
	StateBetting RoundState = iota
	StateQuestion
	StateAnswering
	StateResult
)

type Round struct {
	mu      sync.RWMutex
	id      string
	state   RoundState
	players []string
	bets    map[string]int
	answers map[string]int
}

func NewRound(id string) *Round {
	return &Round{
		id:      id,
		state:   StateBetting,
		players: []string{},
		bets:    make(map[string]int),
		answers: make(map[string]int),
	}
}

// 現在の状態を取得
func (r *Round) GetState() RoundState {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.state
}

// 次の状態へ自動遷移
func (r *Round) NextState() {
	r.mu.Lock()
	defer r.mu.Unlock()

	switch r.state {
	case StateBetting:
		r.state = StateQuestion
	case StateQuestion:
		r.state = StateAnswering
	case StateAnswering:
		r.state = StateResult
	}
}
