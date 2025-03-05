from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from db.database import get_db_connection
from pymongo import MongoClient

router = APIRouter()

@router.get("")
async def get_topics(db: MongoClient = Depends(get_db_connection)):
	"""
	Get all topics

	Returns:
		JSONResponse: List of topics
	"""

	topics_collection = db["topics"]
	topics = topics_collection.find()
	if not topics:
		raise HTTPException(status_code=404, detail="Topics not found")
	return JSONResponse(content={"topics": [topic["name"] for topic in topics]})

