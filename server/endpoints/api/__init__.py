from fastapi import APIRouter

router = APIRouter()

from .topics import router as topics_router
from .quests import router as quests_router

router.include_router(topics_router, prefix="/topics")
router.include_router(quests_router, prefix="/quests")
