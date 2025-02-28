from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from db.database import get_db_connection
import sqlite3

router = APIRouter()

@router.get("/")
async def home(request: Request, db: sqlite3.Connection = Depends(get_db_connection)):
	response = {"message": "Hello from FastAPI!"}

	return response
