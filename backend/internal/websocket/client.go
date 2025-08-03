package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/mitsui6969/Zerofy/backend/internal/game"
	"github.com/mitsui6969/Zerofy/backend/internal/matching/room"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	room     *room.Room
	playerID string
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.room.RemovePlayer(c.playerID)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			log.Printf("read error: %T %v", err, err)
			break
		}

		log.Printf("[WS] 受け取ったよ roomID: %s, playerID: %s\n", string(c.room.ID), string(c.playerID))

		// メッセージを解析
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("JSON parse error: %v", err)
			continue
		}

		// メッセージタイプに応じた処理
		if msgType, ok := msg["type"].(string); ok {
			switch msgType {
			case "START_GAME":
				// ゲーム開始時に問題を生成して送信
				formula := game.CreateFormula()
				if err := game.SendFormula(c.conn, formula); err != nil {
					log.Printf("Failed to send formula: %v", err)
				}
				log.Printf("Sent formula: %s", formula.Question)
			default:
				// その他のメッセージはブロードキャスト
				c.hub.broadcast <- Broadcast{
					RoomID:  c.room.ID,
					Message: message,
				}
			}
		} else {
			// タイプがない場合はブロードキャスト
			c.hub.broadcast <- Broadcast{
				RoomID:  c.room.ID,
				Message: message,
			}
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Hubがチャネルを閉じた
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// バッファの残りも書き出す
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
