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
	IsFriend   bool
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

// Room情報をクライアント用に整形する構造体
type RoomResponse struct {
	ID      string   `json:"id"`
	Players []string `json:"players"`
	IsFull  bool     `json:"isFull"`
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
		MaxPlayers: 2,
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

// Room -> RoomResponse 変換関数
func ToRoomResponse(r *Room) RoomResponse {
	players := []string{}
	for _, p := range r.Players { // ここは実際のプレイヤー管理に合わせて修正
		players = append(players, p.Name)
	}
	return RoomResponse{
		ID:      r.ID,
		Players: players,
		IsFull:  r.IsFull(),
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

// SetPlayerReady プレイヤーの準備状態を設定
func (r *Room) SetPlayerReady(playerID string, ready bool) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	player, exists := r.Players[playerID]
	if !exists {
		return ErrPlayerNotFound
	}

	player.Ready = ready
	return nil
}

// AreAllPlayersReady 全プレイヤーが準備完了しているかチェック
func (r *Room) AreAllPlayersReady() bool {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	if len(r.Players) == 0 {
		return false
	}

	for _, player := range r.Players {
		if !player.Ready {
			return false
		}
	}
	return true
}

// ResetPlayerReady 全プレイヤーの準備状態をリセット
func (r *Room) ResetPlayerReady() {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	for _, player := range r.Players {
		player.Ready = false
	}
}
