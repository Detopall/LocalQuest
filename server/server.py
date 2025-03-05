from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from endpoints.auth import router as auth_router
from endpoints.api import router as api_router
from db.database import create_tables, get_db_connection
from contextlib import asynccontextmanager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield
    client = get_db_connection()
    client.client.close()
    logger.info("MongoDB client closed.")

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

def authenticate_user(db, auth_token:str) -> str | None:
    """
    Authenticate a user based on the provided authentication token.

    Args:
        db (MongoDB connection): Database connection
        auth_token (str): Authentication token

    Returns:
        str | None: Username if authenticated, None otherwise
    """
    cookies_collection = db["cookies"]
    db_cookie = cookies_collection.find_one({"cookie": auth_token})
    if not db_cookie:
        return None
    return db_cookie["username"]

@app.middleware("http")
async def authenticate_middleware(request: Request, call_next):
    if request.url.path.startswith("/auth"):
        return await call_next(request)

    auth_token = request.cookies.get("auth_token")

    if not auth_token:
        logger.error("No authentication token found")
        return JSONResponse({"error": "No authentication token found"}, status_code=401)
    try:
        db = get_db_connection()
        username = authenticate_user(db, auth_token)
        logger.info(f"Authenticated user: {username}")
        if not username:
            logger.error("Invalid authentication token")
            return JSONResponse({"error": "Invalid authentication token"}, status_code=401)
    except Exception as e:
        logger.exception("Error occurred during authentication middleware:")
        return JSONResponse({"error": f"Internal server error: {e}"}, status_code=500)

    return await call_next(request)


app.include_router(auth_router, prefix="/auth")
app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
