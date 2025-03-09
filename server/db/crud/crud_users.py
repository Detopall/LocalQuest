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
	Get user by ID

	Args:
		user_id (str): User ID

	Returns:
		User: User containing the created/applied quests
	"""

	users_collection = db["users"]
	user = users_collection.find_one({"_id": ObjectId(user_id)})

	if not user:
		return None

	# Get all quests from that user
	quests_collection = db["quests"]
	quests = quests_collection.find({"creator": ObjectId(user_id)})
	user["created_quests"] = [serialize_objectid(quest) for quest in quests]

	quests = quests_collection.find({"applicants": ObjectId(user_id)})
	user["applied_quests"] = [serialize_objectid(quest) for quest in quests]

	return serialize_objectid(user)


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

	quests_collection.update_many({"applicants": ObjectId(user_id)}, {
		"$pull": {
			"applicants": ObjectId(user_id)
		}
	})

	users_collection.delete_one({"_id": ObjectId(user_id)})
	return True
