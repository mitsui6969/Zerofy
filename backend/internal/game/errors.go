package game

import (
	"errors"
)

var ErrInvalidMove = errors.New("invalid move")
var ErrInvalidCommand = errors.New("invalid command")
var ErrInvalidParameter = errors.New("invalid parameter")
