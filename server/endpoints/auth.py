import secrets
from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from db import crud, pwd_hashing
from db.database import get_db_connection
import sqlite3
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
	SECRET_KEY: str

	class Config:
		env_file = ".env"

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

@router.post("/")
async def auth(user: dict, db: sqlite3.Connection = Depends(get_db_connection)):
	"""
	Endpoint for user authentication.

	Args:
		user (dict): User login data
		db (SQLite connection): Database connection

	Returns:
		JSONResponse: Authentication response with cookie.
	"""
	if not user.get("username") or not user.get("password"):
		raise HTTPException(status_code=400, detail="Username and Password are required")

	db_user = crud.get_user_by_username(db, username=user["username"])

	if db_user is None:
		if user.get("email") is None:
			raise HTTPException(status_code=404, detail="User not found")
		db_user = crud.create_user(db, username=user["username"], password=user["password"], email=user["email"])

	if not pwd_hashing.verify_password(user["password"], db_user["password"]):
		raise HTTPException(status_code=401, detail="Incorrect password")

	encrypted_token = generate_encrypted_cookie(db_user["username"])

	cursor = db.cursor()
	cursor.execute("INSERT INTO cookies (username, cookie) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET cookie=?",
				(db_user["username"], encrypted_token, encrypted_token))
	db.commit()

	response = JSONResponse(content={"message": "Authentication successful", "username": db_user["username"], "email": db_user["email"]})
	response.set_cookie(
		key="auth_token",
		value=encrypted_token,
		domain="localhost",
		path="/",
		expires=3600,
		secure=True,
		httponly=True,
		samesite="Lax"
	)

	return response

@router.get("/me")
async def auth(request: Request, db: sqlite3.Connection = Depends(get_db_connection)):
	"""
	Check if the cookie of the user is valid

	Args:
		db (SQLite connection): Database connection

	Returns:
		JSONResponse: Authentication response with the user data.
	"""

	user = crud.authenticate_user(db, request.cookies.get("auth_token"))

	if user is None:
		raise HTTPException(status_code=401, detail="Invalid authentication token")

	return JSONResponse(content={"message": "Authentication successful", "username": user["username"], "email": user["email"]})
