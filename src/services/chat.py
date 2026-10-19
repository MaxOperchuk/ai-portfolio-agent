import time

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph.state import CompiledStateGraph

from src.ai.graph.state import AgentState
from src.integrations.notification import NotificationClient
from src.schemas.chat import HistoryMessage


class ChatService:
    def __init__(
        self,
        agent_graph: CompiledStateGraph,
        notification_client: NotificationClient,
    ) -> None:
        self.agent_graph = agent_graph
        self.notification_client = notification_client

    async def get_history(self, thread_id: str) -> list[HistoryMessage]:
        snapshot = await self.agent_graph.aget_state(
            {
                "configurable": {
                    "thread_id": thread_id,
                },
            }
        )

        messages = snapshot.values.get("messages", [])

        history: list[HistoryMessage] = []

        for message in messages:
            if isinstance(message, HumanMessage):
                role = "user"
            elif isinstance(message, AIMessage):
                role = "assistant"
            else:
                continue

            history.append(
                HistoryMessage(
                    role=role,
                    content=message.text,
                )
            )

        return history

    async def chat(self, message: str, thread_id: str) -> str:
        start = time.perf_counter()

        initial_state: AgentState = {
            "message": message,
            "messages": [
                HumanMessage(content=message),
            ],
        }

        result = await self.agent_graph.ainvoke(
            initial_state,
            config={
                "configurable": {
                    "thread_id": thread_id,
                },
            },
        )

        duration_ms = int((time.perf_counter() - start) * 1000)

        await self.notification_client.send_chat_completed(
            message=message,
            duration_ms=duration_ms,
            thread_id=thread_id,
        )

        return result["answer"]
