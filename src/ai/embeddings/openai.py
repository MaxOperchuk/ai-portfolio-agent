from openai import AsyncOpenAI

from src.core.config import settings


class OpenAIEmbeddingClient:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key,
        )

    async def embed(self, text: str) -> list[float]:
        response = await self.client.embeddings.create(
            model=settings.openai_embedding_model,
            input=text,
        )

        return response.data[0].embedding
