from fastapi import APIRouter
from .topics import router as topics_router
from .quests import router as quests_router

api_router = APIRouter()
api_router.include_router(topics_router)
api_router.include_router(quests_router)
