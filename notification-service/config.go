package main

import (
	"fmt"
	"os"
)

type Config struct {
	TelegramBotToken string
	TelegramChatID   string
}

func LoadConfig() (*Config, error) {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		return nil, fmt.Errorf(
			"TELEGRAM_BOT_TOKEN is required",
		)
	}

	chatID := os.Getenv("TELEGRAM_CHAT_ID")
	if chatID == "" {
		return nil, fmt.Errorf(
			"TELEGRAM_CHAT_ID is required",
		)
	}

	return &Config{
		TelegramBotToken: botToken,
		TelegramChatID:   chatID,
	}, nil
}
