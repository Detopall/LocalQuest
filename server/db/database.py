from typing import Literal
from db.connect_db import uri
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def get_db_connection(db_type: Literal["production", "test"] = "production"):
    client = MongoClient(uri, server_api=ServerApi('1'))
    db = client["local_quest"]
    return db

def create_tables(db_type: Literal["production", "test"] = "production"):
    db = get_db_connection(db_type)
    create_users_table(db)
    create_cookies_table(db)
    create_topics_table(db)
    create_quest_table(db)
    create_quest_candidates_table(db)

def create_users_table(db):
    users = db["users"]
    users.create_collection("users", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["username", "password", "email", "created_quests", "applied_quests"],
            "properties": {
                "username": {
                    "bsonType": "string",
                    "minLength": 5,
                    "description": "Must be a string with at least 5 characters"
                },
                "password": {
                    "bsonType": "string",
                    "minLength": 8,
                    "description": "Must be a string with at least 8 characters"
                },
                "email": {
                    "bsonType": "string",
                    "pattern": "^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$",
                    "description": "Must be a valid email address"
                },
                "created_quests": {
                    "bsonType": "array",
                    "items": {"bsonType": "objectId"},
                    "description": "List of quests created by the user"
                },
                "applied_quests": {
                    "bsonType": "array",
                    "items": {"bsonType": "objectId"},
                    "description": "List of quests the user applied to"
                }
            }
        }
    })
    users.create_index("username", unique=True)
    users.create_index("email", unique=True)

def create_cookies_table(db):
    cookies = db["cookies"]
    cookies.create_collection("cookies", validator={
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
    cookies.create_index("created_at")
    cookies.create_index("expiration_at", expireAfterSeconds=60 * 60 * 24 * 7)  # 7 days auto-delete

def create_topics_table(db):
    topics = db["topics"]
    topics.create_collection("topics", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name"],
            "properties": {
                "name": {
                    "bsonType": "string",
                    "minLength": 2,
                    "description": "Topic name must be at least 2 characters long"
                }
            }
        }
    })
    topics.create_index("name", unique=True)

def create_quest_table(db):
    quests = db["quests"]
    quests.create_collection("quests", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["title", "description", "topics", "created_by", "longitude", "latitude", "deadline", "applicants", "status"],
            "properties": {
                "title": {
                    "bsonType": "string",
                    "minLength": 5,
                    "description": "Title must be at least 5 characters long"
                },
                "description": {
                    "bsonType": "string",
                    "minLength": 10,
                    "description": "Description must be at least 10 characters long"
                },
                "topics": {
                    "bsonType": "array",
                    "items": {"bsonType": "objectId"},
                    "description": "List of related topics"
                },
                "created_by": {
                    "bsonType": "objectId",
                    "description": "User who created the quest"
                },
                "longitude": {"bsonType": "double"},
                "latitude": {"bsonType": "double"},
                "deadline": {"bsonType": "date"},
                "applicants": {
                    "bsonType": "array",
                    "items": {"bsonType": "objectId"},
                    "description": "List of users who applied"
                },
                "status": {
                    "enum": ["open", "processing", "closed"],
                    "description": "Status of the quest"
                }
            }
        }
    })
    quests.create_index("title")
    quests.create_index("created_by")
    quests.create_index("status")
    quests.create_index("topics")
    quests.create_index([("longitude", 1), ("latitude", 1)])  # Geo index for location-based queries

def create_quest_candidates_table(db):
    quest_candidates = db["quest_candidates"]
    quest_candidates.create_collection("quest_candidates", validator={
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["quest_id", "user_id"],
            "properties": {
                "quest_id": {"bsonType": "objectId"},
                "user_id": {"bsonType": "objectId"}
            }
        }
    })
    quest_candidates.create_index("quest_id")
    quest_candidates.create_index("user_id")
