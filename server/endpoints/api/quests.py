from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from db.database import get_db_connection
import sqlite3
from pydantic import BaseModel
from db.crud import quest as quest_crud
from db.crud import user as user_crud
from .auth_user import authenticate_user

router = APIRouter()

class Quest(BaseModel):
	title: str
	description: str
	topics: list[str]
	username: str
	longitude: float
	latitude: float
	deadline: str

def row_to_dict(row):
	return {key: row[key] for key in row.keys()}


@router.get("/quests")
async def get_topics(db: sqlite3.Connection = Depends(get_db_connection)):
	"""
	Get all quests
	"""

	quests = quest_crud.get_all_quests(db)
	if not quests:
		if len(quests) == 0:
			return JSONResponse(content={"message": "No quests found", "data": []})
		return JSONResponse(content={"message": "Quests not found"}, status_code=404)

	all_quests = [row_to_dict(quest) for quest in quests]
	return JSONResponse(content={"message": "Quests", "data": all_quests})

@router.post("/quests")
async def create_quest(user_quest: Quest, request: Request, db: sqlite3.Connection = Depends(get_db_connection)):

	if not authenticate_user(db=db, cookies=request.cookies.get("auth_token"), username=user_quest.username):
		return JSONResponse(content={"message": "Unauthorized"}, status_code=401)

	user = user_crud.get_user_by_username(db, user_quest.username)
	if not user:
		return JSONResponse(content={"message": "User not found"}, status_code=404)

	quest = user_crud.create_quest(db, title=user_quest.title, description=user_quest.description, topic_names=user_quest.topics, user_id=user["id"], longitude=user_quest.longitude, latitude=user_quest.latitude, deadline=user_quest.deadline)

	if not quest:
		return JSONResponse(content={"message": "Failed to create quest"}, status_code=500)

	return JSONResponse(content={"message": "Quest created successfully", "data": row_to_dict(quest)})
