package main

import (
    "log"
    "net/http"
    "github.com/mitsui6969/Zerofy/backend/internal/websocket"
)

func main() {
	http.HandleFunc("/ws", websocket.Handler)
	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
