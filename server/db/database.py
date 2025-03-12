from typing import Callable
from db.connect_db import uri
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def get_db_connection():
    client = MongoClient(uri, server_api=ServerApi('1'))
    db = client["local_quest"]
    return db

def collection_exists(db, collection_name: str) -> bool:
    """Check if a collection already exists in the database."""
    return collection_name in db.list_collection_names()

def create_users_table(db):
    db.create_collection("users", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["username", "password", "email"],
            "properties": {
                "username": {"bsonType": "string", "minLength": 5},
                "password": {"bsonType": "string", "minLength": 8},
                "email": {
                    "bsonType": "string",
                    "pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                }
            }
        }
    })
    users = db["users"]
    users.create_index("username", unique=True)
    users.create_index("email", unique=True)

def create_cookies_table(db):
    db.create_collection("cookies", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["username", "cookie", "created_at", "expiration_at"],
            "properties": {
                "username": {"bsonType": "string"},
                "cookie": {"bsonType": "string"},
                "created_at": {"bsonType": "date"},
                "expiration_at": {"bsonType": "date"}
            }
        }
    })
    cookies = db["cookies"]
    cookies.create_index("created_at")
    cookies.create_index("expiration_at", expireAfterSeconds=60 * 60 * 24 * 7)

def create_topics_table(db):
    db.create_collection("topics", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name"],
            "properties": {
                "name": {"bsonType": "string", "minLength": 2}
            }
        }
    })

    topics = db["topics"]
    topics.create_index("name", unique=True)
    initial_topics = [
        {"name": "Technology"}, {"name": "Gardening"}, {"name": "Finance"},
        {"name": "Baby Sitting"}, {"name": "Pet Sitting"}, {"name": "House Sitting"},
        {"name": "Cooking"}, {"name": "Tutoring"}, {"name": "Cleaning"}, {"name": "Other"}
    ]
    topics.insert_many(initial_topics)

def create_quest_table(db):
    db.create_collection("quests", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["title", "description", "topics", "created_by", "longitude", "price", "latitude", "deadline", "applicants", "status"],
            "properties": {
                "title": {"bsonType": "string", "minLength": 5},
                "description": {"bsonType": "string", "minLength": 10},
                "topics": {"bsonType": "array", "items": {"bsonType": "objectId"}},
                "price": {"bsonType": "double", "minimum": 0},
                "created_by": {"bsonType": "objectId"},
                "longitude": {"bsonType": "double"},
                "latitude": {"bsonType": "double"},
                "deadline": {"bsonType": "date"},
                "applicants": {"bsonType": "array", "items": {"bsonType": "objectId"}},
                "status": {"enum": ["open", "processing", "closed"]}
            }
        }
    })
    quests = db["quests"]
    quests.create_index("title")
    quests.create_index("created_by")
    quests.create_index("status")
    quests.create_index("topics")
    quests.create_index([("longitude", 1), ("latitude", 1)])


def create_tables():
    db = get_db_connection()

    # Dictionary of collections and their corresponding creation functions
    tables: dict[str, Callable] = {
        "users": create_users_table,
        "cookies": create_cookies_table,
        "topics": create_topics_table,
        "quests": create_quest_table
    }

    for collection_name, create_function in tables.items():
        if not collection_exists(db, collection_name):
            create_function(db)
