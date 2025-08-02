package websocket

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/mitsui6969/Zerofy/backend/internal/matching/player"
	"github.com/mitsui6969/Zerofy/backend/internal/matching/room"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	// 接続直後に最初のメッセージ（JOIN）を受信
	_, msg, err := conn.ReadMessage()
	if err != nil {
		log.Println("Read initial message error:", err)
		conn.Close()
		return
	}

	var joinMsg JoinMessage
	if err := json.Unmarshal(msg, &joinMsg); err != nil {
		log.Println("Invalid join message:", err)
		conn.Close()
		return
	}

	if joinMsg.Type != "JOIN" {
		log.Println("First message must be JOIN")
		conn.Close()
		return
	}

	playerID := player.GeneratePlayerID()
	rm := room.NewRoomManager()

	// ルームID判定
	isFriend := false
	if joinMsg.RoomID == "" {
		// 空ならランダム5文字
		joinMsg.RoomID = room.GenerateRoomID(false)
	} else if len(joinMsg.RoomID) == 4 {
		// 4桁数字ならフレンドマッチ
		isFriend = true
	}

	joinedRoom, err := rm.JoinOrCreateRoom(joinMsg.RoomID, playerID, joinMsg.PlayerName, isFriend)
	if err != nil {
		log.Println("Join room error:", err)
		conn.WriteMessage(websocket.TextMessage, []byte(`{"error":"join_failed"}`))
		conn.Close()
		return
	}

	// Client作成
	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
		room: joinedRoom,
	}

	client.hub.register <- client

	// 読み書きgoroutine開始
	go client.writePump()
	go client.readPump()
}
