import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from src.ai.graph.graph import create_agent_graph
from src.api.routes.chat import router as chat_router
from src.api.routes.health import router as health_router
from src.core.config import settings
from src.core.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    async with AsyncPostgresSaver.from_conn_string(
        settings.checkpointer_database_url,
    ) as checkpointer:
        await checkpointer.setup()

        application.state.agent_graph = create_agent_graph(
            checkpointer=checkpointer,
        )

        logger.info("LangGraph initialized with PostgreSQL checkpointer")

        yield

        logger.info("Shutting down LangGraph")


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

app.include_router(health_router)
app.include_router(chat_router, prefix="/api/v1")
