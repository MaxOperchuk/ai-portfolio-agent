# AI Portfolio Agent

AI assistant that answers questions about Maksym Operchuk's
experience using a portfolio knowledge base.

## Stack

- Python 3.11, FastAPI, LangGraph, OpenAI
- PostgreSQL with pgvector
- Go notification service and Telegram Bot API
- Docker Compose

## Architecture

```text
Client → FastAPI → LangGraph → OpenAI + PostgreSQL
             ↓
       Go notification service → Telegram
```

PostgreSQL stores knowledge embeddings and conversation checkpoints.
The client supplies a `thread_id` to identify a conversation.

## Requirements

- Docker with Docker Compose
- OpenAI API key with available API credit
- Telegram bot token and chat ID

## Configuration

The environment template is intended for Docker Compose.
Database and notification service URLs are configured in docker-compose.yml.

Copy the environment template:

```bash
cp .env.example .env
```

Set these values in `.env`:

```dotenv
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
POSTGRES_PASSWORD=your_generated_database_password
```

Do not commit `.env`.

Compose overrides database and notification service URLs
with addresses on its internal network.

## Run

From the repository root:

```bash
docker compose up -d --build
```

Startup order:

1. PostgreSQL passes its healthcheck.
2. The `init` service applies Alembic migrations.
3. If no profile chunks exist, it generates embeddings and saves them.
4. FastAPI starts after `init` completes successfully.

Initial indexing makes billable OpenAI API requests.
Existing profile chunks are skipped on subsequent initialization runs.

Check service status and initialization logs:

```bash
docker compose ps -a
docker compose logs --tail=50 init
```

The `init` container should show `Exited (0)`.

## Test

Healthcheck:

```bash
curl -f http://localhost:8001/health
```

API documentation: http://localhost:8001/docs

Send a chat request:

```bash
curl -f http://localhost:8001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What Python experience does Maksym have?","thread_id":"demo-1"}'
```

Chat requests make billable OpenAI API calls.
Reuse `thread_id` for follow-up questions; use a new ID for a new conversation.

Successful chats trigger a Telegram notification.
Notification delivery errors are logged without failing the chat response.

## Update the Knowledge Base

Edit `src/ai/knowledge/profile.md`, rebuild the API image,
then explicitly replace the stored chunks:

```bash
docker compose build api
docker compose run --rm --no-deps init \
  python -m src.scripts.index_knowledge --force
```

Keep PostgreSQL running while executing this command.
Reindexing makes billable embedding requests.

## Logs and Shutdown

Follow logs:

```bash
docker compose logs -f api notification-service
```

Stop and remove containers:

```bash
docker compose down
```

PostgreSQL data remains in the named volume.
`docker compose down -v` also deletes the database volume.

## Local Database Access

```text
Host: localhost
Port: 5434
Database: ai_portfolio
User: postgres
Password: the POSTGRES_PASSWORD value from .env
```

## Current Scope

The project currently provides a backend and notification service.
Frontend and public deployment are planned.

The Compose configuration is intended for local development.