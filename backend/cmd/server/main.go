package main

import (
	"log"
	"net/http"

	"github.com/mitsui6969/Zerofy/backend/internal/matching/room"
	"github.com/mitsui6969/Zerofy/backend/internal/websocket"
)

func main() {
	hub := websocket.NewHub()
	roomManager := room.NewRoomManager() // ★一度だけ生成
	go hub.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(hub, roomManager, w, r)
	})

	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
