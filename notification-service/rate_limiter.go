package main

import "time"

type RateLimiter struct {
	ticker *time.Ticker
}

func NewRateLimiter(
	interval time.Duration,
) *RateLimiter {
	return &RateLimiter{
		ticker: time.NewTicker(interval),
	}
}

func (limiter *RateLimiter) Wait() {
	<-limiter.ticker.C
}

func (limiter *RateLimiter) Stop() {
	limiter.ticker.Stop()
}
