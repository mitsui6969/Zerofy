package api

import (
	"encoding/json"
	"log"
	"net/http"
)

type SomeRequest struct {
	Param string `json:"param"`
}

func SomeAPIHandler(w http.ResponseWriter, r *http.Request) {
	var req SomeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("リクエストデコード失敗:", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.Param == "" {
		log.Println("必須パラメータ不足: Param")
		http.Error(w, "Missing required parameter: Param", http.StatusBadRequest)
		return
	}
	// ...正常処理...
}
