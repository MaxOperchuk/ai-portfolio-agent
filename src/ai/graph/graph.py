from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph

from src.ai.graph.nodes import (
    decompose_node,
    generate_node,
    retrieve_node,
    rewrite_query_node,
)
from src.ai.graph.state import AgentState

builder = StateGraph(AgentState)

builder.add_node("rewrite_query", rewrite_query_node)
builder.add_node("decompose", decompose_node)
builder.add_node("retrieve", retrieve_node)
builder.add_node("generate", generate_node)

builder.add_edge(START, "rewrite_query")
builder.add_edge("rewrite_query", "decompose")
builder.add_edge("decompose", "retrieve")
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", END)


def create_agent_graph(
    checkpointer: AsyncPostgresSaver,
) -> CompiledStateGraph[AgentState]:
    return builder.compile(
        checkpointer=checkpointer,
    )
