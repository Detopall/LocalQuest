import re
from bson import ObjectId
from fastapi import Request
from .serialize import serialize_objectid
from endpoints.api.user_cookie import get_user_from_cookie


def get_users_db(db):
    """
    Get all users

    Args:
            db (MongoClient): Database connection

    Returns:
            List[Users]: List of users
    """
    users_collection = db["users"]
    users = users_collection.find()
    return [serialize_objectid(user) for user in users]


def get_user_by_id_db(db, user_id: str):
    """
    Get user by ID or username

    Args:
        user_id (str): User ID or username

    Returns:
        User: User containing the created/applied quests
    """

    users_collection = db["users"]
    quests_collection = db["quests"]
    topics_collection = db["topics"]

    # Check if the user_id is a valid ObjectId
    if validate_object_id(user_id):
        user = users_collection.find_one({"_id": ObjectId(user_id)})
    else:
        # Check if the user_id is a valid username
        if not check_if_valid_user_id_or_name(user_id, users_collection):
            return None
        user = users_collection.find_one({"username": user_id})

    if not user:
        return None

    # Fetch created quests
    created_quests = list(quests_collection.find({"created_by": user["_id"]}))
    for quest in created_quests:
        quest["topics"] = [fetch_topic(topics_collection, topic_id) for topic_id in quest.get("topics", [])]
        quest["applicants"] = [fetch_user(users_collection, applicant_id) for applicant_id in quest.get("applicants", [])]

    # Fetch applied quests
    applied_quests = list(quests_collection.find({"applicants": user["_id"]}))
    for quest in applied_quests:
        quest["topics"] = [fetch_topic(topics_collection, topic_id) for topic_id in quest.get("topics", [])]
        quest["applicants"] = [fetch_user(users_collection, applicant_id) for applicant_id in quest.get("applicants", [])]

    user["created_quests"] = [serialize_objectid(quest) for quest in created_quests]
    user["applied_quests"] = [serialize_objectid(quest) for quest in applied_quests]

    return serialize_objectid(user)


def check_if_valid_user_id_or_name(user_id: str, users_collection) -> bool:
    """
    Checks if the given string is a valid user ID or username.

    Args:
        user_id (str): The string to validate
        users_collection (Collection): The users collection

    Returns:
        bool: True if the string is a valid user ID or username, False otherwise
    """
    return bool(users_collection.find_one({"username": user_id}))


def validate_object_id(id_string: str) -> bool:
    """
    Validates if the given string is a valid ObjectId.

    Args:
        id_string (str): The string to validate

    Returns:
        bool: True if the string is a valid ObjectId, False otherwise
    """
    return bool(re.match(r"^[a-fA-F0-9]{24}$", str(id_string)))


def fetch_topic(topics_collection, topic_id):
    """Fetches topic details by ID."""
    topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
    return topic["name"] if topic else "Unknown Topic"


def fetch_user(users_collection, user_id):
    """Fetches user details by ID."""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return (
        {"_id": str(user["_id"]), "username": user.get("username", "Unknown User")}
        if user
        else {"_id": str(user_id), "username": "Unknown User"}
    )


def delete_user_by_id_db(db, request: Request, user_id: str):
    """
    Delete user by ID

    Args:
            user_id (str): User ID
            request (Request): Request object

    Returns:
            bool: True if user was deleted, False otherwise
    """

    users_collection = db["users"]
    quests_collection = db["quests"]

    user = get_user_from_cookie(db=db, request=request)

    print(user["_id"] == ObjectId(user_id))

    if user["_id"] != ObjectId(user_id):
        return False

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return False

    quests_collection.delete_many({"created_by": ObjectId(user_id)})

    quests_collection.update_many(
        {"applicants": ObjectId(user_id)}, {"$pull": {"applicants": ObjectId(user_id)}}
    )

    users_collection.delete_one({"_id": ObjectId(user_id)})
    return True
