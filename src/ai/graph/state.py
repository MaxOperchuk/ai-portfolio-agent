from typing import Annotated, TypedDict

from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    message: str
    messages: Annotated[list[AnyMessage], add_messages]
    standalone_query: str
    queries: list[str]
    context: str
    answer: str
