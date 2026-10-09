from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Portfolio Agent"
    debug: bool = False

    openai_api_key: str
    openai_model: str = "gpt-5-mini"

    openai_embedding_model: str = "text-embedding-3-small"

    database_url: str
    checkpointer_database_url: str

    notification_service_url: str = "http://localhost:8080"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
