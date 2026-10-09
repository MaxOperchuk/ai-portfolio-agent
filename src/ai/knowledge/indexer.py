from dataclasses import dataclass

from src.ai.embeddings.openai import OpenAIEmbeddingClient
from src.ai.knowledge.loader import load_profile, split_into_chunks


@dataclass
class EmbeddedChunk:
    text: str
    embedding: list[float]


async def build_index() -> list[EmbeddedChunk]:
    document = load_profile()
    chunks = split_into_chunks(document)

    embedding_client = OpenAIEmbeddingClient()

    result = []

    for chunk in chunks:
        embedding = await embedding_client.embed(chunk)

        result.append(
            EmbeddedChunk(
                text=chunk,
                embedding=embedding,
            )
        )

    return result
