package websocket

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// CORS制限回避（本番は適切に制限すべき）
		return true
	},
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		http.Error(w, "WebSocket upgrade failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

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
