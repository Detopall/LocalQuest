import secrets
from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from db import pwd_hashing
from db.database import get_db_connection
from pymongo import MongoClient
from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from datetime import datetime, timedelta


class Settings(BaseSettings):
    SECRET_KEY: str
    model_config = ConfigDict(env_file=".env", extra="allow")


settings = Settings()

cipher = Fernet(settings.SECRET_KEY.encode())

router = APIRouter()


def generate_encrypted_cookie(username: str) -> str:
    """
    Generate a secure encrypted authentication token.
    """
    token = f"{username}:{secrets.token_hex(32)}"
    encrypted_token = cipher.encrypt(token.encode()).decode()
    return encrypted_token


def decrypt_cookie(encrypted_cookie: str) -> str:
    """
    Decrypt the stored cookie value.
    """
    return cipher.decrypt(encrypted_cookie.encode()).decode()


@router.post("")
async def auth(user: dict, db: MongoClient = Depends(get_db_connection)):
    """
    Endpoint for user authentication.

    Args:
            user (dict): User login data
            db (MongoDB connection): Database connection

    Returns:
            JSONResponse: Authentication response with cookie.
    """
    if not user.get("username") or not user.get("password"):
        raise HTTPException(
            status_code=400, detail="Username and Password are required"
        )

    users_collection = db["users"]
    cookies_collection = db["cookies"]

    db_user = users_collection.find_one({"username": user["username"]})

    if db_user is None:
        if user.get("email") is None:
            raise HTTPException(status_code=404, detail="User not found")
        hashed_pw = pwd_hashing.hash_password(user["password"])
        users_collection.insert_one(
            {
                "username": user["username"],
                "password": hashed_pw,
                "email": user["email"],
                "created_quests": [],
                "applied_quests": [],
            }
        )
        db_user = users_collection.find_one({"username": user["username"]})

    if not pwd_hashing.verify_password(user["password"], db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    encrypted_token = generate_encrypted_cookie(db_user["username"])

    cookies_collection.update_one(
        {"username": db_user["username"]},
        {
            "$set": {
                "cookie": encrypted_token,
                "created_at": datetime.now(),
                "expiration_at": datetime.now() + timedelta(days=7),
            }
        },
        upsert=True,
    )

    response = JSONResponse(
        content={
            "message": "Authentication successful",
            "username": db_user["username"],
            "email": db_user["email"],
        }
    )
    response.set_cookie(
        key="auth_token",
        value=encrypted_token,
        domain="localhost",
        path="/",
        expires=3600,
        secure=False,
        httponly=True,
        samesite="Lax",
    )

    return response


@router.post("/logout")
async def logout(request: Request, db: MongoClient = Depends(get_db_connection)):
    """
    Logout the user by deleting the cookie from the database.
    """
    cookies_collection = db["cookies"]

    auth_token = request.cookies.get("auth_token")
    if not auth_token:
        raise HTTPException(status_code=401, detail="No authentication token found")

    try:
        decrypted_token = decrypt_cookie(auth_token)
        username = decrypted_token.split(":")[0]
    except BaseException:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    db_cookie = cookies_collection.find_one(
        {"username": username, "cookie": auth_token}
    )
    if not db_cookie:
        raise HTTPException(
            status_code=401, detail="Invalid or expired authentication token"
        )

    cookies_collection.delete_one({"username": username, "cookie": auth_token})

    response = JSONResponse(content={"message": "Logout successful"})

    response.delete_cookie("auth_token")

    return response


@router.get("/me")
async def get_me(request: Request, db: MongoClient = Depends(get_db_connection)):
    """
    Check if the cookie of the user is valid

    Args:
            db (MongoDB connection): Database connection

    Returns:
            JSONResponse: Authentication response with the user data.
    """
    cookies_collection = db["cookies"]
    users_collection = db["users"]

    auth_token = request.cookies.get("auth_token")
    print(auth_token)
    if not auth_token:
        raise HTTPException(status_code=401, detail="No authentication token found")

    try:
        decrypted_token = decrypt_cookie(auth_token)
        username = decrypted_token.split(":")[0]
    except BaseException:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    db_cookie = cookies_collection.find_one(
        {"username": username, "cookie": auth_token}
    )
    print(db_cookie)
    if not db_cookie:
        raise HTTPException(
            status_code=401, detail="Invalid or expired authentication token"
        )

    user = users_collection.find_one({"username": username}, {"password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return JSONResponse(
        content={
            "message": "Authentication successful",
            "username": user["username"],
            "email": user.get("email"),
            "_id": str(user["_id"]),
        }
    )
