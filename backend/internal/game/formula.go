package game

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"github.com/gorilla/websocket"
)

type Formula struct {
	Question string
	Answer   float64
	Point   int
}

func CreateFormula() Formula {
	//式を生成する
	operators := []string{"+", "-", "×", "÷"}

	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)

	randomNumber1 := r.Intn(10) + 1
	randomNumber2 := r.Intn(10) + 1

	operator := operators[r.Intn(len(operators))]

	Question := fmt.Sprintf("%d %s %d", randomNumber1, operator, randomNumber2)

	//生成された式の答えを計算
	Answer := 0.0
	Point := 0
	switch operator {
	case "+":
		Answer = float64(randomNumber1) + float64(randomNumber2)
		Point = 2
	case "-":
		Answer = float64(randomNumber1) - float64(randomNumber2)
		Point = 2
	case "×":
		Answer = float64(randomNumber1) * float64(randomNumber2)
		Point = 5
	case "÷":
		Point = 5
		// 0除算が起こらない前提
		Answer = float64(randomNumber1) / float64(randomNumber2)
	}

	return Formula{
		Question: Question,
		Answer:   Answer,
		Point:    Point,
	}
}

func SendFormula(wsConn *websocket.Conn, formula Formula) error {
	jsonData, err := json.Marshal(formula)
	if err != nil {
		return err
	}
	return wsConn.WriteMessage(websocket.TextMessage, jsonData)
}
