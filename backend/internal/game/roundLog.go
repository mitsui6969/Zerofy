package game

import "github.com/mitsui6969/Zerofy/backend/internal/matching/room"

type PlayerPoint struct {
	ID    string
	Point int
}

func AddRoundResult(p1 PlayerPoint, p2 PlayerPoint, room *room.Room) {
	room.AddRoundResults(p1.ID, p1.Point, p2.ID, p2.Point)
}
