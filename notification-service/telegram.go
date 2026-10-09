package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type TelegramError struct {
	StatusCode int
}

func (err *TelegramError) Error() string {
	return fmt.Sprintf(
		"telegram returned status %d",
		err.StatusCode,
	)
}

type TelegramClient struct {
	BotToken    string
	ChatID      string
	HTTPClient  *http.Client
	RateLimiter *RateLimiter
}

type TelegramMessage struct {
	ChatID string `json:"chat_id"`
	Text   string `json:"text"`
}

func NewTelegramClient(
	botToken string,
	chatID string,
	rateLimiter *RateLimiter,
) *TelegramClient {
	return &TelegramClient{
		BotToken:    botToken,
		ChatID:      chatID,
		RateLimiter: rateLimiter,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (client *TelegramClient) SendNotification(
	notification Notification,
) error {
	message := TelegramMessage{
		ChatID: client.ChatID,
		Text: fmt.Sprintf(
			"🤖 New Portfolio Agent request\n\nThread id: %s\nQuestion: %s\nDuration: %d ms",
			notification.ThreadID,
			notification.Message,
			notification.DurationMs,
		),
	}

	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	url := fmt.Sprintf(
		"https://api.telegram.org/bot%s/sendMessage",
		client.BotToken,
	)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		url,
		bytes.NewBuffer(body),
	)
	if err != nil {
		return err
	}

	client.RateLimiter.Wait()

	req.Header.Set("Content-Type", "application/json")

	response, err := client.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return &TelegramError{
			StatusCode: response.StatusCode,
		}
	}

	return nil
}
