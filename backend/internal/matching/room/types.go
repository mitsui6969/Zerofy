package room

import (
	"errors"
	"sync"
	"time"
)

type Player struct {
	ID       string
	Name     string
	JoinedAt time.Time
	Ready    bool
}

type RoundResult struct {
	P1 map[string]int
	P2 map[string]int
}

type Room struct {
	ID         string
	Name       string
	MaxPlayers int
	Players    map[string]*Player
	CreatedAt  time.Time
	IsActive   bool
	mutex      sync.RWMutex

	roundResults []RoundResult
}

func (r *Room) AddRoundResults(P1id string, P1po int, P2id string, P2po int) {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	result := RoundResult{
		P1: map[string]int{
			P1id: P1po,
		},
		P2: map[string]int{
			P2id: P2po,
		},
	}

	r.roundResults = append(r.roundResults, result)
}

type RoomManager struct {
	rooms map[string]*Room
	mutex sync.RWMutex
}

var (
	ErrRoomNotFound    = errors.New("room not found")
	ErrPlayerNotFound  = errors.New("player not found")
	ErrRoomFull        = errors.New("room is full")
	ErrPlayerExists    = errors.New("player already exists in room")
	ErrInvalidRoomName = errors.New("invalid room name")
	ErrRoomInactive    = errors.New("room is inactive")
)

const (
	Player_Count      = 2
	MaxRoomNameLength = 50
)

func NewPlayer(id, name string) *Player {
	return &Player{
		ID:       id,
		Name:     name,
		JoinedAt: time.Now(),
		Ready:    false,
	}
}

func NewRoom(id, name string) *Room {
	return &Room{
		ID:         id,
		Name:       name,
		MaxPlayers: Player_Count,
		Players:    make(map[string]*Player),
		CreatedAt:  time.Now(),
		IsActive:   true,
	}
}

func NewRoomManager() *RoomManager {
	return &RoomManager{
		rooms: make(map[string]*Room),
	}
}

func (r *Room) IsFull() bool {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	return len(r.Players) >= r.MaxPlayers
}

func (r *Room) IsEmpty() bool {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	return len(r.Players) == 0
}

func (r *Room) GetPlayerCount() int {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	return len(r.Players)
}

func (r *Room) HasPlayer(playerID string) bool {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	_, exists := r.Players[playerID]
	return exists
}

// AddPlayer プレイヤーをルームに追加
func (r *Room) AddPlayer(player *Player) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if len(r.Players) >= r.MaxPlayers {
		return ErrRoomFull
	}

	if _, exists := r.Players[player.ID]; exists {
		return ErrPlayerExists
	}

	r.Players[player.ID] = player
	return nil
}

// RemovePlayer プレイヤーをルームから削除
func (r *Room) RemovePlayer(playerID string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.Players[playerID]; !exists {
		return ErrPlayerNotFound
	}

	delete(r.Players, playerID)
	return nil
}
