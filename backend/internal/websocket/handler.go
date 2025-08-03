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

func ServeWs(hub *Hub, rm *room.RoomManager, w http.ResponseWriter, r *http.Request) {
	log.Println("New WebSocket connection request") // ★追加

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		http.Error(w, "WebSocket upgrade failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	log.Println("WebSocket connected")

	// 接続直後に最初のメッセージ（JOIN）を受信
	_, msg, err := conn.ReadMessage()
	if err != nil {
		log.Println("Read initial message error:", err)
		conn.Close()
		return
	}
	log.Printf("message: %s",msg);

	var joinMsg JoinMessage
	if err := json.Unmarshal(msg, &joinMsg); err != nil {
		log.Println("Invalid join message:", err)
		conn.Close()
		return
	}
	log.Printf("Received JOIN message: %+v\n", joinMsg) // ここまで成功

	if joinMsg.Type != "JOIN" {
		log.Println("First message must be JOIN")
		conn.Close()
		return
	}

	playerID := player.GeneratePlayerID()

	// ルームID判定
	isFriend := false
	if joinMsg.RoomID == "" {
		// 空なら、まず1人だけの既存ルームを探す
		var singleRoom *room.Room
		for _, r := range rm.GetAllRooms() { // RoomManagerに全ルーム取得メソッドが必要
			if !r.IsFull() && len(r.Players) == 1 && !r.IsFriend {
				singleRoom = r
				break
			}
		}

		if singleRoom != nil {
			joinMsg.RoomID = singleRoom.ID
		} else {
			// 見つからなければ新規作成
			joinMsg.RoomID = room.GenerateRoomID(false)
		}
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


	// ★参加成功のメッセージをクライアントに返す
    // これにより、フロントエンドはページ遷移のタイミングを知ることができる
    joinSuccessMsg := map[string]interface{}{
        "type": "JOIN_SUCCESS",
        "room": room.ToRoomResponse(joinedRoom), // ルーム情報を返す
    }
    res, _ := json.Marshal(joinSuccessMsg)
    conn.WriteMessage(websocket.TextMessage, res)

	// Client作成
	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
		room: joinedRoom,
		playerID: playerID,
	}

	client.hub.register <- client

	// ★2人そろったらゲーム開始通知を全員に送信
	if joinedRoom.IsFull() {
		// 式がまだ生成されていない場合のみ生成
		if !joinedRoom.HasFormula() {
			joinedRoom.GenerateFormula()
		}
		formula := joinedRoom.GetFormula()
		
		startMsg := map[string]interface{}{
			"type": "QUESTION",
			"room": room.ToRoomResponse(joinedRoom), // ルーム情報を整形
			"formula": formula, // 生成された式を追加
		}
		res, _ := json.Marshal(startMsg)

		// このルームにいる全員に送信
		hub.broadcast <- Broadcast{
            RoomID:  joinedRoom.ID,
            Message: res,
        }
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				// panic発生時にクラッシュを防ぐ
			}
		}()
		client.writePump()
	}()
	go func() {
		defer func() {
			if r := recover(); r != nil {
				// panic発生時にクラッシュを防ぐ
			}
		}()
		client.readPump()
	}()
}