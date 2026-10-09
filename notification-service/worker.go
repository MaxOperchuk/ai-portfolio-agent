package main

import (
	"errors"
	"log/slog"
	"math/rand/v2"
	"net/http"
	"time"
)

type NotificationWorker struct {
	ID             int
	Notifications  <-chan Notification
	TelegramClient *TelegramClient
}

func (worker *NotificationWorker) Run() {
	for notification := range worker.Notifications {
		slog.Info(
			"processing notification",
			"worker_id", worker.ID,
			"event_type", notification.EventType,
		)

		err := worker.sendWithRetry(notification)
		if err != nil {
			slog.Error(
				"failed to send notification",
				"worker_id", worker.ID,
				"event_type", notification.EventType,
				"error", err,
			)
			continue
		}

		slog.Info(
			"notification sent successfully",
			"worker_id", worker.ID,
			"event_type", notification.EventType,
		)
	}
}

func isRetryable(err error) bool {
	var telegramErr *TelegramError

	if errors.As(err, &telegramErr) {
		return telegramErr.StatusCode == http.StatusTooManyRequests ||
			telegramErr.StatusCode >= 500
	}

	return true
}

const (
	maxAttempts = 3
	baseDelay   = time.Second
)

func retryDelay(attempt int) time.Duration {
	backoff := baseDelay * time.Duration(1<<(attempt-1))

	jitter := time.Duration(
		rand.IntN(500),
	) * time.Millisecond

	return backoff + jitter
}

func (worker *NotificationWorker) sendWithRetry(
	notification Notification,
) error {
	var lastErr error

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err := worker.TelegramClient.SendNotification(notification)

		if err == nil {
			return nil
		}

		lastErr = err

		if !isRetryable(err) {
			return err
		}

		if attempt == maxAttempts {
			break
		}

		delay := retryDelay(attempt)

		slog.Warn(
			"notification delivery failed, retrying",
			"worker_id", worker.ID,
			"attempt", attempt,
			"delay", delay,
			"error", err,
		)

		time.Sleep(delay)
	}

	return lastErr
}
