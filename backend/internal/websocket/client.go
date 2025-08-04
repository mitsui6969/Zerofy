package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/mitsui6969/Zerofy/backend/internal/matching/room"
	"github.com/mitsui6969/Zerofy/backend/internal/game"
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
	roomM    *room.RoomManager
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
				// プレイヤーの準備状態を設定
				if err := c.room.SetPlayerReady(c.playerID, true); err != nil {
					log.Printf("Failed to set player ready: %v", err)
					continue
				}

				// 準備完了メッセージを全員に送信
				readyMsg := map[string]interface{}{
					"type":     "PLAYER_READY",
					"playerID": c.playerID,
				}
				readyData, _ := json.Marshal(readyMsg)
				c.hub.broadcast <- Broadcast{
					RoomID:  c.room.ID,
					Message: readyData,
				}

				// 全プレイヤーが準備完了したら計算式を送信
				if c.room.AreAllPlayersReady() {
					// 少し待ってから計算式を送信（確実に準備完了メッセージが先に送信されるように）
					go func() {
						time.Sleep(100 * time.Millisecond)

						// 新しいラウンドなので必ず新しい計算式を生成
						c.room.GenerateFormula()
						formula := c.room.GetFormula()

						// 計算式を全員に送信
						formulaMsg := map[string]interface{}{
							"type":     "FORMULA",
							"Question": formula.Question,
							"Answer":   formula.Answer,
							"Points":   formula.Points,
						}
						formulaData, _ := json.Marshal(formulaMsg)
						c.hub.broadcast <- Broadcast{
							RoomID:  c.room.ID,
							Message: formulaData,
						}

						// 準備状態をリセット
						c.room.ResetPlayerReady()

						log.Printf("Sent formula to all players: %s", formula.Question)
					}()
				}
			case "QUESTION":
				// ベットメッセージの処理
				if bet, ok := msg["QUESTION"].(float64); ok {
					err := c.room.SetPlayerBet(c.playerID, int(bet))
					if err != nil {
						log.Printf("Error setting bet: %v", err)
					} else {
						log.Printf("Player %s bet: %d", c.playerID, int(bet))
					}
				}
				// RoundLogを作成して記録
				formula := c.room.GetFormula()
				roundLog := room.RoundLog{
					Round:      len(c.room.RoundLogs) +1,
					Formula:    formula.Question,
					Answer:     formula.Answer,
					AnsweredBy: c.playerID,
				}
				c.room.AddRoundLog(roundLog)
				// ベットメッセージもブロードキャスト
				c.hub.broadcast <- Broadcast{
					RoomID:  c.room.ID,
					Message: message,
				}
				
			case "Answer":
				// 回答メッセージの処理
				if answer, ok := msg["Answer"].(float64); ok {
					if time, ok := msg["Time"].(float64); ok {
						if points, ok := msg["Points"].(float64); ok {
							log.Printf("Player %s answered: %v, Time: %.2fs, Points: %.0f",
								c.playerID, answer, time, points)
						} else {
							log.Printf("Player %s answered: %v, Time: %.2fs",
								c.playerID, answer, time)
						}
					}
				}

				// 勝敗判定後
				if answer, ok := msg["Answer"].(float64); ok {
					winner, err := c.room.ProcessAnswer(c.playerID, float64(answer))
					if err != nil {
						log.Printf("Error processing answer: %v", err)
					} else if winner != "" {
						// プレイヤー情報取得
						p1 := c.room.GetPlayer1()
						p2 := c.room.GetPlayer2()
						formula := c.room.GetFormula()

						// ポイント計算
						result := game.PointControl(
							game.PlayerPointInfo{ID: p1.ID, Point: p1.Point},
							game.PlayerPointInfo{ID: p2.ID, Point: p2.Point},
							winner,
							formula.Question,
						)

						// ポイントをroomのプレイヤーに反映
						c.room.Players[p1.ID].Point = result.P1Point
						c.room.Players[p2.ID].Point = result.P2Point

						// ラウンドログを残す
						game.AddRoundResult(
							game.PlayerPoint{ID: p1.ID, Point: result.P1Point},
							game.PlayerPoint{ID: p2.ID, Point: result.P2Point},
							c.room,
						)

						// 勝敗結果を全員に送信
						resultMsg := map[string]interface{}{
							"roundLogs": c.room.RoundLogs,
							"type":   "RESULT",
							"winner": winner,
							"answer": float64(answer),
							"winnerPoint": func() int {
								if winner == p1.ID {
									return result.P1Point
								}
								return result.P2Point
							}(),
							"decrease": result.Decrease,
						}
						resultData, _ := json.Marshal(resultMsg)
						c.hub.broadcast <- Broadcast{
							RoomID:  c.room.ID,
							Message: resultData,
						}

						// client.go の勝敗処理後
						if result.P1Point == 0 || result.P2Point == 0 {
							// ゲーム終了メッセージ
							endMsg := map[string]interface{}{
								"type":      "END",
								"winner":    winner,
								"roundLogs": c.room.RoundLogs,
							}
							res, _ := json.Marshal(endMsg)
							c.hub.broadcast <- Broadcast{
								RoomID:  c.room.ID,
								Message: res,
							}
						}

						c.room.ResetPlayerReady()
					}
				}

				// 回答メッセージもブロードキャスト
				c.hub.broadcast <- Broadcast{
					RoomID:  c.room.ID,
					Message: message,
				}
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

			// 各メッセージを個別に送信
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
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
