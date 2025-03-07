from datetime import datetime
from typing import List
from pydantic import BaseModel
from fastapi import Request
from bson import ObjectId
from endpoints.api.user_cookie import get_user_from_cookie
from .serialize import serialize_objectid


class Quest(BaseModel):
	title: str
	description: str
	topics: List[str]
	longitude: float
	latitude: float
	price: float
	deadline: datetime

class Topic(BaseModel):
	name: str

def check_user_is_creator(quest: dict, user: dict):
	"""
	Check if the user is the creator of the quest

	Args:
		quest (Quest): Quest data
		user (User): User data

	Return:
		str: Error message if the user is the creator, otherwise an empty string.
	"""
	if isinstance(quest["created_by"], ObjectId) and isinstance(user["_id"], ObjectId):
		if quest["created_by"] == user["_id"]:
			return "User is the creator of this quest"
	elif str(quest["created_by"]) == str(user["_id"]):
		return "User is the creator of this quest"

	return ""  # User is not the creator, return an empty string


def get_quests_db(db):
	"""
	Get all quests

	Returns:
		List[Quest]: List of quests
	"""
	quests_collection = db["quests"]
	quests = quests_collection.find()
	return [serialize_objectid(quest) for quest in quests]


def create_quest_db(db, user_quest: Quest, request: Request):
	"""
	Create a new quest

	Args:
		user_quest (Quest): Quest data


	Returns:
		Quest: Created quest
	"""
	user = get_user_from_cookie(request, db)

	quests_collection = db["quests"]

	# Convert topic names to ObjectIds
	topics_collection = db["topics"]
	topic_ids = []
	for topic_name in user_quest.topics:
		topic = topics_collection.find_one({"name": topic_name})
		if topic:
			topic_ids.append(topic["_id"])
		else:
			return []

	quest = {
		"title": user_quest.title,
		"description": user_quest.description,
		"topics": topic_ids,
		"created_by": user["_id"],
		"longitude": user_quest.longitude,
		"latitude": user_quest.latitude,
		"deadline": user_quest.deadline,
		"price": user_quest.price,
		"applicants": [],
		"status": "open"
	}
	quests_collection.insert_one(quest)

	return serialize_objectid(quest)


def get_quest_by_id_db(db, quest_id: str):
	"""
	Get a quest by id

	Args:
		quest_id (str): Quest id

	Returns:
		Quest: Quest or None if not found
	"""

	quests_collection = db["quests"]

	try:
		quest_id = ObjectId(quest_id)
	except Exception as e:
		return None

	quest = quests_collection.find_one({"_id": quest_id})

	if not quest:
		return None

	return serialize_objectid(quest)


def put_quest_by_id_db(db, quest_id: str, user_quest: Quest, request: Request):
	"""
	Update a quest by id

	Args:
		quest_id (str): Quest id
		user_quest (Quest): Quest data

	Returns:
		Quest: Updated quest
	"""

	try:
		quest_id = ObjectId(quest_id)
	except Exception as e:
		return None, "Invalid quest ID format"

	user = get_user_from_cookie(request, db)
	quest = get_quest_by_id_db(db, quest_id)

	if not quest:
		return None, "Quest not found"

	error_msg = check_user_is_creator(quest, user)
	if error_msg != "User is the creator of this quest":
		error_msg = "User is not the creator of this quest"
		return None, error_msg

	topics_collection = db["topics"]
	topic_ids = []
	for topic_name in user_quest.topics:
		topic = topics_collection.find_one({"name": topic_name})
		if topic:
			topic_ids.append(topic["_id"])
		else:
			return None, f"Topic '{topic_name}' not found"

	update_data = {}
	for key, value in user_quest.model_dump().items():
		if value != quest.get(key):
			update_data[key] = value

	if topic_ids:
		update_data["topics"] = topic_ids

	if not update_data:
		return None, "No changes to update"

	quests_collection = db["quests"]
	quests_collection.update_one({"_id": quest_id}, {"$set": update_data})
	updated_quest = quests_collection.find_one({"_id": quest_id})

	return serialize_objectid(updated_quest), ""



def delete_quest_by_id_db(db, quest_id: str) -> bool:
	"""
	Delete a quest by id

	Args:
		quest_id (str): Quest id

	Returns:
		bool: True if deleted
	"""
	try:
		quest_id = ObjectId(quest_id)
	except Exception as e:
		return None, "Invalid quest ID format"
	quests_collection = db["quests"]

	if not quests_collection.find_one({"_id": quest_id}):
		return False

	quests_collection.delete_one({"_id": quest_id})

	return True

def filter_quests_db(db, topics: List[str] = None, prices: List[float] = None):
	"""
	Get quests that match the given topics and/or price range.

	Args:
		db: Database connection.
		topics (List[str], optional): List of topic names. Defaults to None.
		prices (List[float], optional): Price range. Defaults to None.

	Returns:
		List[dict]: List of filtered quests.

	Raises:
		ValueError: If neither topics nor prices are provided.
	"""
	if not topics and not prices:
		raise ValueError("Either topics or prices must be provided")

	quests_collection = db["quests"]
	topics_collection = db["topics"]

	query = {}

	if topics:
		query_topic_ids = [
			topic["_id"] for topic in topics_collection.find({"name": {"$in": topics}})
		]
		query["topics"] = {"$in": query_topic_ids}

	if prices:
		if len(prices) != 2:
			raise ValueError("Prices must be a list of two values")
		query["price"] = {"$gte": prices[0], "$lte": prices[1]}

	quests = list(quests_collection.find(query))

	if topics:
		for quest in quests:
			quest["topic_match_count"] = sum(1 for topic_id in quest["topics"] if topic_id in query_topic_ids)
		quests.sort(key=lambda x: x["topic_match_count"], reverse=True)
		for quest in quests:
			quest.pop("topic_match_count", None)

	return [serialize_objectid(quest) for quest in quests]


def add_applicant_to_quest_db(db, quest_id: str, request: Request):
	"""
	Add an applicant to a quest

	Args:
		quest_id (str): Quest id
		request (Request): Request object

	Returns:
		Quest: Updated quest
	"""

	quests_collection = db["quests"]
	user = get_user_from_cookie(request, db)
	quest = quests_collection.find_one({"_id": ObjectId(quest_id)})

	if not quest:
		return None, "Quest not found"

	# Check if the current user is the creator of the quest
	error_msg = check_user_is_creator(quest, user)
	if error_msg:
		return None, error_msg

	applicants = quest.get("applicants", [])

	if user["_id"] in applicants:
		return None, "User is already an applicant for this quest"

	applicants.append(user["_id"])

	quests_collection.update_one({"_id": ObjectId(quest_id)}, {"$set": {"applicants": applicants}})

	updated_quest = quests_collection.find_one({"_id": ObjectId(quest_id)})

	return serialize_objectid(updated_quest), ""
