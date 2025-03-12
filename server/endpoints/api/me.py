from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from db.database import get_db_connection
from pymongo import MongoClient
from .user_cookie import get_user_from_cookie
from db.crud.serialize import serialize_objectid


router = APIRouter()


@router.get("")
async def get_me(request: Request, db: MongoClient = Depends(get_db_connection)):
    """
    Get me

    Returns:
            JSONResponse: User
    """

    user = get_user_from_cookie(request, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return JSONResponse(content={"user": serialize_objectid(user)})
