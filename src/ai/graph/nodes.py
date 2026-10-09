from langchain_core.messages import AIMessage, HumanMessage

from src.ai.graph.state import AgentState
from src.ai.knowledge.search import multi_query_search
from src.ai.llm.openai import OpenAIClient
from src.ai.query.decomposer import QueryDecomposer
from src.core.decorators import timer

decomposer = QueryDecomposer()
llm = OpenAIClient()


@timer
async def decompose_node(state: AgentState) -> dict:
    queries = await decomposer.decompose(state["standalone_query"])

    return {"queries": queries}


@timer
async def retrieve_node(
    state: AgentState,
) -> dict:
    chunks = await multi_query_search(
        queries=state["queries"],
        top_k_per_query=3,
    )

    context = "\n\n".join(chunk.content for chunk in chunks)

    return {
        "context": context,
    }


@timer
async def generate_node(
    state: AgentState,
) -> dict:
    answer = await llm.generate(
        question=state["standalone_query"],
        context=state["context"],
    )

    return {
        "answer": answer,
        "messages": [
            AIMessage(content=answer),
        ],
    }


@timer
async def rewrite_query_node(state: AgentState) -> dict:
    history = state.get("messages", [])[:-1]

    if not history:
        return {
            "standalone_query": state["message"],
        }

    history_text = "\n".join(
        f"{'User' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
        for msg in history
        if isinstance(msg, (HumanMessage, AIMessage))
    )

    standalone_query = await llm.rewrite_query(
        question=state["message"],
        history=history_text,
    )

    return {
        "standalone_query": standalone_query,
    }
