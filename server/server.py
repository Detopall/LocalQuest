from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from endpoints import auth_router, home_router
from db.database import create_tables
from db.database import get_db_connection
from db.crud import authenticate_user


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

create_tables()

@app.middleware("http")
async def authenticate_middleware(request: Request, call_next):
    print(request.cookies)

    if request.url.path.startswith("/auth"):
        return await call_next(request)

    auth_token = request.cookies.get("auth_token")
    print(auth_token)
    if not auth_token:
        return JSONResponse({"error": "No authentication token found"}, status_code=401)

    try:
        with get_db_connection() as db:
            username = authenticate_user(db, auth_token)
            print(username)
            if not username:
                return JSONResponse({"error": "Invalid authentication token"}, status_code=401)
    except Exception as e:
        return JSONResponse({"error": "Internal server error"}, status_code=500)

    return await call_next(request)

app.include_router(auth_router, prefix="/auth")
app.include_router(home_router, prefix="/home")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
