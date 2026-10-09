import logging

import httpx

logger = logging.getLogger(__name__)


class NotificationClient:
    def __init__(
        self,
        base_url: str,
    ) -> None:
        self._client = httpx.AsyncClient(
            base_url=base_url,
            timeout=3.0,
        )

    async def send_chat_completed(
        self,
        message: str,
        duration_ms: int,
        thread_id: str,
    ) -> None:
        try:
            response = await self._client.post(
                "/notifications",
                json={
                    "event_type": "chat_completed",
                    "message": message,
                    "duration_ms": duration_ms,
                    "thread_id": thread_id,
                },
            )

            response.raise_for_status()

        except httpx.HTTPError:
            logger.exception("Failed to send chat notification")
