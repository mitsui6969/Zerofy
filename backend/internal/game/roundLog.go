package game

import "github.com/mitsui6969/Zerofy/backend/internal/matching/room"

type PlayerPoint struct {
	ID        string
	Point     int
	RoundLogs []room.RoundLog
}

func NewRoundLog(round int, formula string, answer float64, answeredBy string) room.RoundLog {
	return room.RoundLog{
		Round:      round,
		Formula:    formula,
		Answer:     answer,
		AnsweredBy: answeredBy,
	}
}

func AddRoundResult(p1 PlayerPoint, p2 PlayerPoint, room *room.Room) {
	room.AddRoundResults(p1.ID, p1.Point, p2.ID, p2.Point)
}
