from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from db.database import get_db_connection
import sqlite3
from db import crud

router = APIRouter()

def row_to_dict(row):
    return {key: row[key] for key in row.keys()}

@router.get("/topics")
async def get_topics(db: sqlite3.Connection = Depends(get_db_connection)):
    """
	Get all topics
    """
    topics = crud.get_topics(db)
    if not topics:
        return JSONResponse(content={"message": "Topics not found"}, status_code=404)

    all_topics = [row_to_dict(topic) for topic in topics]
    return JSONResponse(content={"message": "Topics", "data": all_topics})
