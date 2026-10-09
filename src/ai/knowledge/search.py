from sqlalchemy import func, select

from src.ai.embeddings.openai import OpenAIEmbeddingClient
from src.db.session import async_session_factory
from src.models.knowledge import KnowledgeChunk


async def search(
    query: str,
    top_k: int = 3,
) -> list[tuple[KnowledgeChunk, float]]:
    embedding_client = OpenAIEmbeddingClient()

    query_embedding = await embedding_client.embed(query)

    distance = KnowledgeChunk.embedding.cosine_distance(query_embedding)

    statement = (
        select(
            KnowledgeChunk,
            distance.label("distance"),
        )
        .order_by(distance)
        .limit(top_k)
    )

    async with async_session_factory() as session:
        result = await session.execute(statement)

        return list(result.all())


async def keyword_search(
    query: str,
    top_k: int = 3,
) -> list[tuple[KnowledgeChunk, float]]:
    document = func.to_tsvector(
        "english",
        KnowledgeChunk.content,
    )

    search_query = func.plainto_tsquery(
        "english",
        query,
    )

    rank = func.ts_rank(
        document,
        search_query,
    ).label("rank")

    statement = (
        select(
            KnowledgeChunk,
            rank,
        )
        .where(document.op("@@")(search_query))
        .order_by(rank.desc())
        .limit(top_k)
    )

    async with async_session_factory() as session:
        result = await session.execute(statement)

        return list(result.all())


def reciprocal_rank_fusion(
    rankings: list[list[KnowledgeChunk]],
    k: int = 60,
) -> list[tuple[KnowledgeChunk, float]]:
    scores: dict[int, float] = {}
    chunks: dict[int, KnowledgeChunk] = {}

    for ranking in rankings:
        for rank, chunk in enumerate(ranking, start=1):
            score = 1 / (k + rank)

            scores[chunk.id] = scores.get(chunk.id, 0) + score
            chunks[chunk.id] = chunk

    sorted_scores = sorted(
        scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    return [(chunks[chunk_id], score) for chunk_id, score in sorted_scores]


async def hybrid_search(
    query: str,
    top_k: int = 3,
    candidate_k: int = 10,
) -> list[tuple[KnowledgeChunk, float]]:
    vector_results = await search(query, top_k=candidate_k)
    keyword_results = await keyword_search(query, top_k=candidate_k)

    vector_chunks = [chunk for chunk, _ in vector_results]

    keyword_chunks = [chunk for chunk, _ in keyword_results]

    ranked_chunks = reciprocal_rank_fusion([vector_chunks, keyword_chunks])

    return ranked_chunks[:top_k]


async def multi_query_search(
    queries: list[str],
    top_k_per_query: int = 3,
) -> list[KnowledgeChunk]:
    chunks: dict[int, KnowledgeChunk] = {}

    for query in queries:
        results = await hybrid_search(
            query=query,
            top_k=top_k_per_query,
        )

        for chunk, _ in results:
            chunks[chunk.id] = chunk

    return list(chunks.values())
