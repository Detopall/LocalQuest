from datetime import datetime
from typing import List
from pydantic import BaseModel
from fastapi import Request
from bson import ObjectId
from endpoints.api.user_cookie import get_user_from_cookie


class Quest(BaseModel):
	title: str
	description: str
	topics: List[str]
	longitude: float
	latitude: float
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



def serialize_objectid(obj):
	"""
	Recursively converts ObjectId to string in a dict or list.
	"""
	if isinstance(obj, ObjectId):
		return str(obj)
	elif isinstance(obj, dict):
		return {key: serialize_objectid(value) for key, value in obj.items()}
	elif isinstance(obj, list):
		return [serialize_objectid(item) for item in obj]
	elif isinstance(obj, datetime):
		return obj.isoformat()
	else:
		return obj


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

	# Ensure the quest_id is a valid ObjectId
	try:
		quest_id = ObjectId(quest_id)
	except Exception as e:
		return None, "Invalid quest ID format"

	user = get_user_from_cookie(request, db)
	quest = get_quest_by_id_db(db, quest_id)

	# If quest is None, it means no quest was found in the database
	if not quest:
		return None, "Quest not found"

	# Check if the current user is the creator of the quest
	error_msg = check_user_is_creator(quest, user)
	if error_msg != "User is the creator of this quest":
		return None, error_msg

	# Convert topic names in user_quest to ObjectIds
	topics_collection = db["topics"]
	topic_ids = []
	for topic_name in user_quest.topics:
		topic = topics_collection.find_one({"name": topic_name})
		if topic:
			topic_ids.append(topic["_id"])
		else:
			return None, f"Topic '{topic_name}' not found"

	# Prepare the data to update the quest
	update_data = {}
	for key, value in user_quest.model_dump().items():
		if value != quest.get(key):
			update_data[key] = value

	# If the topics were changed, update the topics field
	if topic_ids:
		update_data["topics"] = topic_ids

	if not update_data:
		return None, "No changes to update"

	quests_collection = db["quests"]
	quests_collection.update_one({"_id": quest_id}, {"$set": update_data})
	updated_quest = quests_collection.find_one({"_id": quest_id})

	# Serialize the updated quest before returning
	return serialize_objectid(updated_quest), ""



def delete_quest_by_id_db(db, quest_id: str):
	"""
	Delete a quest by id

	Args:
		quest_id (str): Quest id
	"""
	try:
		quest_id = ObjectId(quest_id)
	except Exception as e:
		return None, "Invalid quest ID format"
	quests_collection = db["quests"]
	quests_collection.delete_one({"_id": quest_id})


def filter_quests_db(db, topics: List[Topic], request: Request):
	"""
	Get all quests

	Returns:
		List[Quest]: List of quests
	"""
	user = get_user_from_cookie(request, db)
	quests_collection = db["quests"]
	topics_collection = db["topics"]

	query_topics = [topic.name for topic in topics]

	query_topic_ids = []
	for topic_name in query_topics:
		topic = topics_collection.find_one({"name": topic_name})
		if topic:
			query_topic_ids.append(topic["_id"])

	# No topics found, return an empty list
	if not query_topic_ids:
		return []

	pipeline = [
		{"$match": {"created_by": user["_id"]}},
		{"$addFields": {
			"topic_match_count": {
				"$size": {
					"$setIntersection": ["$topics", query_topic_ids]
				}
			}
		}},
		{"$sort": {"topic_match_count": -1}}
	]

	quests = quests_collection.aggregate(pipeline)

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
	user = get_user_from_cookie(request, db)  # This retrieves the user object
	quest = quests_collection.find_one({"_id": ObjectId(quest_id)})

	if not quest:
		return None, "Quest not found"

	# Check if the current user is the creator of the quest
	error_msg = check_user_is_creator(quest, user)
	if error_msg:
		return None, error_msg

	applicants = quest.get("applicants", [])

	# Only append the ObjectId of the user, not the entire user object
	if user["_id"] in applicants:
		return None, "User is already an applicant for this quest"

	applicants.append(user["_id"])

	# Update the applicants list in the database
	quests_collection.update_one({"_id": ObjectId(quest_id)}, {"$set": {"applicants": applicants}})

	# Re-fetch the updated quest and serialize it
	updated_quest = quests_collection.find_one({"_id": ObjectId(quest_id)})

	# Only serialize the ObjectId fields, not the entire user object in the applicants list
	return serialize_objectid(updated_quest), ""
