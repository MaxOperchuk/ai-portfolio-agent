import asyncio

from sqlalchemy import delete

from src.ai.embeddings.openai import OpenAIEmbeddingClient
from src.ai.knowledge.loader import load_profile, split_into_chunks
from src.db.session import async_session_factory
from src.models.knowledge import KnowledgeChunk

SOURCE = "profile.md"


async def main() -> None:
    document = load_profile()
    chunks = split_into_chunks(document)

    embedding_client = OpenAIEmbeddingClient()

    async with async_session_factory() as session:
        await session.execute(
            delete(KnowledgeChunk).where(KnowledgeChunk.source == SOURCE)
        )

        for chunk in chunks:
            embedding = await embedding_client.embed(chunk)

            session.add(
                KnowledgeChunk(
                    content=chunk,
                    source=SOURCE,
                    embedding=embedding,
                )
            )

        await session.commit()

    print(f"Indexed {len(chunks)} chunks from {SOURCE}")


if __name__ == "__main__":
    asyncio.run(main())
