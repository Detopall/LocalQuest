from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from endpoints import auth_router
from db.database import create_users_table

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

create_users_table()

app.include_router(auth_router, prefix="/auth")

if __name__ == "__main__":
	uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
