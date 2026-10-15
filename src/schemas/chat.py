from pydantic import BaseModel, Field
from typing import Literal


class ChatRequest(BaseModel):
    message: str
    thread_id: str = Field(min_length=1)


class ChatResponse(BaseModel):
    message: str


class DecomposedQueries(BaseModel):
    queries: list[str]


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class HistoryResponse(BaseModel):
    history: list[HistoryMessage]
