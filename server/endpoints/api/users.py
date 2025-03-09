from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from db.database import get_db_connection
from db.crud import crud_users
from pymongo import MongoClient

router = APIRouter()

@router.get("")
async def get_users(db: MongoClient = Depends(get_db_connection)):
	users = crud_users.get_users_db(db)
	if not users:
		return JSONResponse(status_code=404, content={"users": [], "message": "No users found"})
	return JSONResponse(status_code=200, content={"users": users})


@router.get("/{user_id}")
async def get_user(user_id: str, db: MongoClient = Depends(get_db_connection)):
	user = crud_users.get_user_by_id_db(db=db, user_id=user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	return JSONResponse(status_code=200, content={"user": user})


@router.delete("/{user_id}")
async def delete_user(user_id: str, request: Request, db: MongoClient = Depends(get_db_connection)):
	success = crud_users.delete_user_by_id_db(db=db, user_id=user_id, request=request)
	if not success:
		raise HTTPException(status_code=404, detail="User not found or already deleted")
	return JSONResponse(status_code=200, content={"message": "User deleted"})
