from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    thread_id: str = Field(min_length=1)


class ChatResponse(BaseModel):
    message: str


class DecomposedQueries(BaseModel):
    queries: list[str]
