package player

import (
	"crypto/rand"
	"encoding/hex"
)

func GeneratePlayerID() string {
	bytes := make([]byte, 8)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
