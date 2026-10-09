FROM golang:1.27.1-bookworm AS builder

WORKDIR /app

COPY go.mod .
RUN go mod download

COPY *.go .

RUN CGO_ENABLED=0 go build -o /app/notification-service .

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/notification-service ./notification-service

RUN useradd --create-home appuser
USER appuser

EXPOSE 8080

CMD ["./notification-service"]
