from fastapi import Request
from fastapi import HTTPException
from pymongo import MongoClient


def get_user_from_cookie(request: Request, db: MongoClient):
    """
    Get the user from the cookie

    Args:
            request (Request): Request object
            db (MongoClient): Database connection

    Returns:
            User: User object
    """

    cookie = request.cookies.get("auth_token")
    if not cookie:
        raise HTTPException(status_code=401, detail="Unauthorized")

    cookies_collection = db["cookies"]
    db_cookie = cookies_collection.find_one({"cookie": cookie})
    if not db_cookie:
        raise HTTPException(status_code=401, detail="Unauthorized")

    users_collection = db["users"]
    user = users_collection.find_one({"username": db_cookie["username"]})
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user
