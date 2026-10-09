import logging
import time
from collections.abc import Callable
from functools import wraps

logger = logging.getLogger(__name__)


def timer(func: Callable):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()

        try:
            return await func(*args, **kwargs)
        finally:
            duration = time.perf_counter() - start

            logger.info(
                "%s completed in %.3fs",
                func.__name__,
                duration,
            )

    return wrapper
