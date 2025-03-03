from fastapi import Depends, HTTPException, Request
from db.database import get_db_connection
from db import crud
import sqlite3

def authenticate_user(username: str, cookies: str, db: sqlite3.Connection = Depends(get_db_connection)):
    """
	Validate the authentication token to make sure the user is performing the actions on their own account
    """

    if not cookies:
        raise HTTPException(status_code=401, detail="No authentication token found")

    try:
        authenticated_user = crud.authenticate_user(db, cookies)
        if not authenticated_user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

    if username != authenticated_user["username"]:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    return authenticated_user
