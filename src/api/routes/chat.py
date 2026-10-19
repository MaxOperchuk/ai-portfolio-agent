from fastapi import APIRouter, Depends, Request
from fastapi import Query

from src.core.config import settings
from src.integrations.notification import NotificationClient
from src.schemas.chat import ChatRequest, ChatResponse, HistoryResponse
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


@router.get("/get-history", response_model=HistoryResponse)
async def get_history(
    thread_id: str = Query(min_length=1),
    chat_service: ChatService = Depends(get_chat_service),
) -> HistoryResponse:
    history = await chat_service.get_history(thread_id)

    return HistoryResponse(history=history)
