from fastapi import APIRouter, Depends, Request

from src.core.config import settings
from src.integrations.notification import NotificationClient
from src.schemas.chat import ChatRequest, ChatResponse
from src.services.chat import ChatService

router = APIRouter()

notification_client = NotificationClient(
    base_url=settings.notification_service_url,
)


def get_chat_service(request: Request) -> ChatService:
    return ChatService(
        agent_graph=request.app.state.agent_graph,
        notification_client=notification_client,
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    response = await chat_service.chat(
        request.message,
        thread_id=request.thread_id,
    )

    return ChatResponse(message=response)
