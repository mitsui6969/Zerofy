package room

import (
	"fmt"
	"math/rand"
	"time"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func init() {
	rand.Seed(time.Now().UnixNano())
}

// 現在のルーム一覧を取得
func (rm *RoomManager) GetAllRooms() []*Room {
    rm.mutex.Lock()
    defer rm.mutex.Unlock()
    rooms := []*Room{}
    for _, r := range rm.rooms {
        rooms = append(rooms, r)
    }
    return rooms
}


// generateRoomID ルームIDを生成（friend==trueなら4桁数字、falseなら5桁英数字）
func GenerateRoomID(friend bool) string {
	if friend {
		// フレンドマッチ用4桁数字
		return fmt.Sprintf("%04d", rand.Intn(10000))
	}

	// ランダムマッチ用5桁英数字
	b := make([]rune, 5)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

// JoinOrCreateRoom ルームID指定なしなら自動割り当て
func (rm *RoomManager) JoinOrCreateRoom(roomID, playerID, playerName string, friend bool) (*Room, error) {
	rm.mutex.Lock()
    defer rm.mutex.Unlock()

    // ルームIDが指定されている場合
    if roomID != "" {
        room, ok := rm.rooms[roomID]
        if !ok {
            // ルームが存在しなければ新規作成
            room = NewRoom(roomID, fmt.Sprintf("Room-%s", roomID))
            rm.rooms[roomID] = room
        }

        // 既存 or 新規ルームに参加
        player := NewPlayer(playerID, playerName)
        if err := room.AddPlayer(player); err != nil {
            return nil, err
        }
        return room, nil
    }

	// 空きルームを探す（ランダムマッチのみ）
	if !friend {
		for _, r := range rm.rooms {
			if r.IsActive && !r.IsFull() && r.GetPlayerCount() == 1 {
				player := NewPlayer(playerID, playerName)
				if err := r.AddPlayer(player); err == nil {
					return r, nil
				}
			}
		}
	}

	// 新規ルーム作成（ランダムマッチまたはフレンドマッチ）
    newRoomID := GenerateRoomID(friend)
    r := NewRoom(newRoomID, fmt.Sprintf("Room-%s", newRoomID))
    rm.rooms[newRoomID] = r

    player := NewPlayer(playerID, playerName)
    if err := r.AddPlayer(player); err != nil {
        return nil, err
    }

    return r, nil
}

// JoinRoom プレイヤーをルームに参加させる
func (rm *RoomManager) JoinRoom(roomID, playerID, playerName string) error {
	// ルームの存在確認
	rm.mutex.RLock()
	room, exists := rm.rooms[roomID]
	rm.mutex.RUnlock()

	if !exists {
		return ErrRoomNotFound
	}

	// ルームの状態チェック
	if !room.IsActive {
		return ErrRoomInactive
	}

	// 満員チェック
	if room.IsFull() {
		return ErrRoomFull
	}

	// 重複参加チェック
	if room.HasPlayer(playerID) {
		return ErrPlayerExists
	}

	// プレイヤーをルームに追加
	player := NewPlayer(playerID, playerName)
	return room.AddPlayer(player)
}

// LeaveRoom プレイヤーがルームから退出する
func (rm *RoomManager) LeaveRoom(roomID, playerID string) error {
	// ルームの存在確認
	rm.mutex.RLock()
	room, exists := rm.rooms[roomID]
	rm.mutex.RUnlock()

	if !exists {
		return ErrRoomNotFound
	}

	// プレイヤーの存在確認
	if !room.HasPlayer(playerID) {
		return ErrPlayerNotFound
	}

	// プレイヤーを削除
	err := room.RemovePlayer(playerID)
	if err != nil {
		return err
	}

	// ルームが空になったらルーム自体を削除
	if room.IsEmpty() {
		rm.mutex.Lock()
		delete(rm.rooms, roomID)
		rm.mutex.Unlock()
	}

	return nil
}

// GetRoom ルーム情報を取得
func (rm *RoomManager) GetRoom(roomID string) (*Room, error) {
	rm.mutex.RLock()
	defer rm.mutex.RUnlock()

	// 指定されたIDのルームを検索
	room, exists := rm.rooms[roomID]
	if !exists {
		return nil, ErrRoomNotFound
	}

	return room, nil
}

// ListRooms アクティブなルーム一覧を取得
func (rm *RoomManager) ListRooms() []*Room {
	rm.mutex.RLock()
	defer rm.mutex.RUnlock()

	// アクティブなルームのみを抽出してスライスに格納
	rooms := make([]*Room, 0, len(rm.rooms))
	for _, room := range rm.rooms {
		if room.IsActive {
			rooms = append(rooms, room)
		}
	}
	return rooms
}

// GetRoomCount 現在のルーム数を取得
func (rm *RoomManager) GetRoomCount() int {
	rm.mutex.RLock()
	defer rm.mutex.RUnlock()
	// 管理中のルーム総数を返す
	return len(rm.rooms)
}
