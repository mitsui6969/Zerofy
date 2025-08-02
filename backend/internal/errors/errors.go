package errors

import (
	"fmt"
	"net/http"
	
)

type AppError struct {
	Code    int
	Message string
}

func (e *AppError) Error() string {
	return fmt.Sprintf("Error %d: %s", e.Code, e.Message)
}

func NewAppError(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

var (
	ErrInvalidParameter = NewAppError(http.StatusBadRequest, "Invalid parameter")
	ErrNotFound         = NewAppError(http.StatusNotFound, "Resource not found")
	ErrInternal         = NewAppError(http.StatusInternalServerError, "Internal server error")
)