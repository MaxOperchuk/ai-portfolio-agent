package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"time"
)

type Handler struct {
	Notifications chan<- Notification
}

type Notification struct {
	EventType  string `json:"event_type"`
	Message    string `json:"message"`
	DurationMs int    `json:"duration_ms"`
	ThreadID   string `json:"thread_id"`
}

func (handler *Handler) notificationHandler(
	w http.ResponseWriter,
	r *http.Request,
) {
	var notification Notification

	err := json.NewDecoder(r.Body).Decode(&notification)
	if err != nil {
		http.Error(
			w,
			"invalid request body",
			http.StatusBadRequest,
		)
		return
	}

	handler.Notifications <- notification

	w.WriteHeader(http.StatusAccepted)
}

func main() {
	logger := slog.New(
		slog.NewJSONHandler(
			os.Stdout,
			nil,
		),
	)
	slog.SetDefault(logger)

	config, err := LoadConfig()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		return
	}
	rateLimiter := NewRateLimiter(
		500 * time.Millisecond,
	)

	telegramClient := NewTelegramClient(
		config.TelegramBotToken,
		config.TelegramChatID,
		rateLimiter,
	)

	defer rateLimiter.Stop()

	notifications := make(
		chan Notification,
		100,
	)

	handler := &Handler{
		Notifications: notifications,
	}

	workerCount := 3

	for i := 1; i <= workerCount; i++ {
		worker := &NotificationWorker{
			ID:             i,
			Notifications:  notifications,
			TelegramClient: telegramClient,
		}

		go worker.Run()
	}

	http.HandleFunc(
		"POST /notifications",
		handler.notificationHandler,
	)

	slog.Info("starting notification service", "addr", ":8080")

	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		slog.Error("server failed", "addr", ":8080", "error", err)
	}
}
