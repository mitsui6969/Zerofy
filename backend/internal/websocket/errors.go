package websocket

import (
	"errors"
)

var ErrConnectionRefused = errors.New("connection refused")
var ErrConnectionTimeout = errors.New("connection timeout")
var ErrConnectionClosed = errors.New("connection closed")
