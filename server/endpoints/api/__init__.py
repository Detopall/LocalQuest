from .users import router as users_router
from .me import router as me_router
from .quests import router as quests_router
from .topics import router as topics_router
from fastapi import APIRouter

router = APIRouter()


router.include_router(topics_router, prefix="/topics")
router.include_router(quests_router, prefix="/quests")
router.include_router(me_router, prefix="/me")
router.include_router(users_router, prefix="/users")
