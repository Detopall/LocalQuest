from fastapi import APIRouter, Depends, HTTPException, Request, Body, Query
from fastapi.responses import JSONResponse
from db.database import get_db_connection
from pymongo import MongoClient
from db.crud import crud_quests
from db.crud.crud_quests import Quest
from typing import List


router = APIRouter()

@router.get("")
async def get_all_quests(db: MongoClient = Depends(get_db_connection)):
    """
    Get all quests

    Returns:
        JSONResponse: List of quests
    """
    quests = crud_quests.get_quests_db(db)
    if not quests:
        return JSONResponse(status_code=200, content={"quests": [], "message": "No quests found"})
    return JSONResponse(status_code=200, content={"quests": quests})


@router.post("")
async def create_quest(
    request: Request,
    user_quest: Quest = Body(...),
    db: MongoClient = Depends(get_db_connection)
):
    """
    Create a new quest

    Args:
        user_quest (Quest): Quest data

    Returns:
        JSONResponse: Created quest
    """
    quest = crud_quests.create_quest_db(db=db, user_quest=user_quest, request=request)
    if not quest:
        raise HTTPException(status_code=400, detail="Failed to create quest")
    return JSONResponse(status_code=201, content={"quest": quest})


@router.get("/filter")
async def filter_quests(topics: List[str] = Query(None, alias="topics"), prices: List[float] = Query(None, alias="prices"), db: MongoClient = Depends(get_db_connection)):
    if not topics and not prices:
        raise HTTPException(status_code=400, detail="Either topics or prices must be provided")

    if prices and len(prices) != 2:
        raise HTTPException(status_code=400, detail="Prices must be a list of two values")

    filtered_quests = crud_quests.filter_quests_db(db=db, topics=topics, prices=prices)
    if not filtered_quests:
        raise HTTPException(status_code=404, detail="No quests found")
    return JSONResponse(status_code=200, content={"quests": filtered_quests})


@router.get("/{quest_id}")
async def get_quest(quest_id: str, db: MongoClient = Depends(get_db_connection)):
    quest = crud_quests.get_quest_by_id_db(db=db, quest_id=quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    return JSONResponse(status_code=200, content={"quest": quest})


@router.put("/{quest_id}")
async def update_quest(
    quest_id: str,
    request: Request,
    user_quest: Quest = Body(...),
    db: MongoClient = Depends(get_db_connection)
):
    quest, err = crud_quests.put_quest_by_id_db(db=db, quest_id=quest_id, user_quest=user_quest, request=request)
    if not quest:
        raise HTTPException(status_code=404, detail=err)
    return JSONResponse(status_code=200, content={"quest": quest})


@router.delete("/{quest_id}")
async def delete_quest(quest_id: str, db: MongoClient = Depends(get_db_connection)):
    success = crud_quests.delete_quest_by_id_db(db=db, quest_id=quest_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quest not found or already deleted")
    return JSONResponse(status_code=200, content={"message": "Quest deleted"})


@router.post("/{quest_id}/apply")
async def apply_to_quest(quest_id: str, request: Request, db: MongoClient = Depends(get_db_connection)):
    quest, err = crud_quests.add_applicant_to_quest_db(db=db, quest_id=quest_id, request=request)
    if not quest:
        raise HTTPException(status_code=404, detail=str(err))
    return JSONResponse(status_code=200, content={"message": "Applied to quest", "data": quest})

@router.post("/{quest_id}/close")
async def close_quest(quest_id: str, db: MongoClient = Depends(get_db_connection), request: Request = None):
    quest, err = crud_quests.close_quest_db(db=db, quest_id=quest_id, request=request)
    if not quest:
        raise HTTPException(status_code=404, detail=str(err))
    return JSONResponse(status_code=200, content={"message": "Quest closed", "data": quest})
