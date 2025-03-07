from fastapi import APIRouter

router = APIRouter()

from .topics import router as topics_router
from .quests import router as quests_router
from .me import router as me_router

router.include_router(topics_router, prefix="/topics")
router.include_router(quests_router, prefix="/quests")
router.include_router(me_router, prefix="/me")
