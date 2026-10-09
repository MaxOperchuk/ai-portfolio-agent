from src.ai.llm.openai import OpenAIClient


class QueryDecomposer:
    def __init__(self) -> None:
        self.llm = OpenAIClient()

    async def decompose(
        self,
        message: str,
    ) -> list[str]:
        result = await self.llm.decompose(message)

        return result.queries
