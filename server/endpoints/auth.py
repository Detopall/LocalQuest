from fastapi import APIRouter, Depends, HTTPException
from db import crud, pwd_hashing
from db.models import User
from db.database import get_db_connection
import sqlite3

router = APIRouter()

@router.post("/")
async def auth(user: User, db: sqlite3.Connection = Depends(get_db_connection)):
	"""
	Endpoint for user authentication

	Args:
		user (User): User object
		db (SQLite connection): SQLite database connection

	Returns:
		dict: Response containing username and email
	"""

	if not user.username or not user.password:
		raise HTTPException(status_code=400, detail="Username and Password are required")

	db_user = crud.get_user_by_username(db, username=user.username)

	if db_user is None:
		if user.email is None:
			raise HTTPException(status_code=404, detail="User not found")

		db_user = crud.create_user(db, username=user.username, password=user.password, email=user.email)

	if not pwd_hashing.verify_password(user.password, db_user['password']):
		raise HTTPException(status_code=401, detail="Incorrect password")

	return {"username": db_user['username'], "email": db_user['email']}
