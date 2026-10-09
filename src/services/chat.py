import time

from langchain_core.messages import HumanMessage
from langgraph.graph.state import CompiledStateGraph

from src.ai.graph.state import AgentState
from src.integrations.notification import NotificationClient


class ChatService:
    def __init__(
        self,
        agent_graph: CompiledStateGraph,
        notification_client: NotificationClient,
    ) -> None:
        self.agent_graph = agent_graph
        self.notification_client = notification_client

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
