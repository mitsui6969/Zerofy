package game

import (
	"fmt"
	"math/rand"
	"time"
)

type Formula struct {
	Question string
	Answer   int
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
	Answer := 0
	switch operator {
	case "+":
		Answer = randomNumber1 + randomNumber2
	case "-":
		Answer = randomNumber1 - randomNumber2
	case "×":
		Answer = randomNumber1 * randomNumber2
	case "÷":
		// 0除算が起こらない前提
		Answer = randomNumber1 / randomNumber2
	}

	return Formula{
		Question: Question,
		Answer:   Answer,
	}
}
