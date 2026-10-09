import argparse
import asyncio
import logging

from sqlalchemy import delete, select

from src.ai.embeddings.openai import OpenAIEmbeddingClient
from src.ai.knowledge.loader import load_profile, split_into_chunks
from src.core.logging import setup_logging
from src.db.session import async_session_factory, engine
from src.models.knowledge import KnowledgeChunk

SOURCE = "profile.md"
logger = logging.getLogger(__name__)


async def index_knowledge(force: bool) -> None:
    async with async_session_factory() as session:
        existing_id = await session.scalar(
            select(KnowledgeChunk.id).where(KnowledgeChunk.source == SOURCE).limit(1)
        )

    if existing_id is not None and not force:
        logger.info("Knowledge already indexed: %s; skipping", SOURCE)
        return

    chunks = split_into_chunks(load_profile())
    if not chunks:
        raise ValueError("Knowledge document is empty")

    embedding_client = OpenAIEmbeddingClient()
    records = []

    try:
        for chunk in chunks:
            embedding = await embedding_client.embed(chunk)
            records.append(
                KnowledgeChunk(
                    content=chunk,
                    source=SOURCE,
                    embedding=embedding,
                )
            )
    finally:
        await embedding_client.client.close()

    async with async_session_factory.begin() as session:
        await session.execute(
            delete(KnowledgeChunk).where(KnowledgeChunk.source == SOURCE)
        )
        session.add_all(records)

    logger.info("Indexed %d chunks from %s", len(records), SOURCE)


async def main(force: bool) -> None:
    try:
        await index_knowledge(force)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Index portfolio knowledge")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace existing chunks with freshly generated embeddings",
    )
    args = parser.parse_args()

    setup_logging()
    asyncio.run(main(force=args.force))
