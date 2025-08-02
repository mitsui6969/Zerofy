package websocket

import "log"

type JoinMessage struct {
    Type       string `json:"type"`       // "JOIN"
    RoomID     string `json:"roomID"`     // ルームID
    PlayerName string `json:"playerName"` // プレイヤー名
    Friend     bool   `json:"friend"`     // フレンド対戦かどうか
}

type Broadcast struct {
	RoomID  string
	Message []byte
}

type Hub struct {
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan Broadcast
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan Broadcast),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if client == nil {
				log.Println("clientがnilです。")
				continue
			}
			if client.room == nil {
				log.Println("client.roomがnilです。")
				continue
			}
			roomID := client.room.ID
			if h.rooms[roomID] == nil {
				h.rooms[roomID] = make(map[*Client]bool)
			}
			h.rooms[roomID][client] = true

		case client := <-h.unregister:
			roomID := client.room.ID
			if _, ok := h.rooms[roomID][client]; ok {
				delete(h.rooms[roomID], client)
				close(client.send)
				// ルームが空なら削除
				if len(h.rooms[roomID]) == 0 {
					delete(h.rooms, roomID)
				}
			}

		case b := <-h.broadcast:
			clients := h.rooms[b.RoomID]
			for client := range clients {
				select {
				case client.send <- b.Message:
				default:
					close(client.send)
					delete(clients, client)
				}
			}
		}
	}
}
