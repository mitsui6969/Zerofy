package game

import "github.com/mitsui6969/Zerofy/backend/internal/matching/room"

type playerPoint struct {
	id    string
	point int
}

func AddRoundResult(p1 playerPoint, p2 playerPoint, room *room.Room) {
	room.AddRoundResults(p1.id, p1.point, p2.id, p2.point)
}
