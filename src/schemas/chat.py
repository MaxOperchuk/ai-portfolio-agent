from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    thread_id: str = Field(min_length=1)

    @field_validator("message")
    @classmethod
    def validate_message(cls, message: str) -> str:
        message = message.strip()

        if not message:
            raise ValueError("Message must not be blank")

        return message


class ChatResponse(BaseModel):
    message: str


class DecomposedQueries(BaseModel):
    queries: list[str]


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class HistoryResponse(BaseModel):
    history: list[HistoryMessage]
