package websocket

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // CORS対応
	},
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// WebSocketにアップグレード
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	// 最初にメッセージ送信
	err = conn.WriteMessage(websocket.TextMessage, []byte("Hello front! by backend"))
	if err != nil {
		log.Println("Send error:", err)
		return
	}

	// メッセージを受信して"Hello back!"を返す
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}
		log.Println("Received:", string(msg))

		// クライアントから受信したら返信
		err = conn.WriteMessage(websocket.TextMessage, []byte("respone backend!"))
		if err != nil {
			log.Println("Write error:", err)
			break
		}
	}
}