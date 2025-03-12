import pytest
from datetime import datetime, timedelta
from bson import ObjectId
from .gen_auth_user_for_tests import generate_cookies_from_user


def test_get_all_quests_no_auth(client):
	"""
	Test get all quests without authentication
	"""
	response = client.get("/api/quests")
	assert response.status_code == 401


def test_get_empty_quests(client, test_db):
	"""
	Test get empty quests, with an empty database
	"""
	generate_cookies_from_user(client, test_db)
	response = client.get("/api/quests")

	assert response.status_code == 200
	assert response.json()["quests"] == []
	assert response.json()["message"] == "No quests found"


def test_get_all_quests(client, test_db):
	"""
	Test get all quests with data in database
	"""
	generate_cookies_from_user(client, test_db)

	# Create topics first
	topic1_id = ObjectId()
	topic2_id = ObjectId()
	test_db["topics"].insert_many([
		{"_id": topic1_id, "name": "topic1"},
		{"_id": topic2_id, "name": "topic2"}
	])

	# Insert test quests
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_many([
		{
			"title": "Quest 1",
			"description": "Test description 1",
			"topics": [topic1_id],
			"longitude": 10.0,
			"latitude": 20.0,
			"deadline": deadline,
			"applicants": [],
			"status": "open"
		},
		{
			"title": "Quest 2",
			"description": "Test description 2",
			"topics": [topic2_id],
			"longitude": 15.0,
			"latitude": 25.0,
			"deadline": deadline,
			"applicants": [],
			"status": "open"
		}
	])

	response = client.get("/api/quests")

	assert response.status_code == 200
	assert len(response.json()["quests"]) == 2
	assert "message" not in response.json()


def test_create_quest_no_auth(client):
	"""
	Test create quest without authentication
	"""
	quest_data = {
		"title": "New Quest",
		"description": "Test description",
		"topics": ["test"],
		"longitude": 10.0,
		"latitude": 20.0,
		"price": 10.0,
		"deadline": (datetime.now() + timedelta(days=30)).isoformat()
	}

	response = client.post("/api/quests", json=quest_data)
	assert response.status_code == 401


def test_create_quest(client, test_db):
	"""
	Test create quest with valid data
	"""
	generate_cookies_from_user(client, test_db)

	# Create a topic first
	test_db["topics"].insert_one({"name": "test"})

	quest_data = {
		"title": "New Quest",
		"description": "Test description",
		"topics": ["test"],
		"longitude": 10.0,
		"latitude": 20.0,
		"price": 10.0,
		"deadline": (datetime.now() + timedelta(days=30)).isoformat()
	}

	response = client.post("/api/quests", json=quest_data)

	assert response.status_code == 201
	assert response.json()["quest"]["title"] == "New Quest"

	# Verify quest was inserted in database with proper fields
	db_quest = test_db["quests"].find_one({"title": "New Quest"})
	assert db_quest is not None
	assert db_quest["description"] == "Test description"
	assert db_quest["longitude"] == 10.0
	assert db_quest["latitude"] == 20.0
	assert "deadline" in db_quest
	assert db_quest["status"] == "open"
	assert isinstance(db_quest["topics"], list)
	assert db_quest["price"] == 10.0
	assert len(db_quest["topics"]) == 1
	assert isinstance(db_quest["topics"][0], ObjectId)


def test_create_quest_invalid_topic(client, test_db):
	"""
	Test create quest with non-existent topic
	"""
	generate_cookies_from_user(client, test_db)

	quest_data = {
		"title": "New Quest",
		"description": "Test description",
		"topics": ["non_existent_topic"],
		"longitude": 10.0,
		"latitude": 20.0,
		"price": 10.0,
		"deadline": (datetime.now() + timedelta(days=30)).isoformat()
	}

	response = client.post("/api/quests", json=quest_data)
	assert response.status_code == 400
	assert response.json()["detail"] == "Failed to create quest"


def test_create_quest_invalid_data(client, test_db):
	"""
	Test create quest with invalid data
	"""
	generate_cookies_from_user(client, test_db)

	# Missing required fields
	quest_data = {
		"description": "Test description"
	}

	response = client.post("/api/quests", json=quest_data)
	assert response.status_code == 422  # Validation error


def test_get_quest_by_id_no_auth(client):
	"""
	Test get quest by ID without authentication
	"""
	response = client.get(f"/api/quests/{str(ObjectId())}")
	assert response.status_code == 401


def test_get_quest_by_id_not_found(client, test_db):
	"""
	Test get quest by ID with non-existent ID
	"""
	generate_cookies_from_user(client, test_db)
	non_existent_id = str(ObjectId())

	response = client.get(f"/api/quests/{non_existent_id}")
	assert response.status_code == 404
	assert response.json()["detail"] == "Quest not found"


def test_get_quest_by_id(client, test_db):
	"""
	Test get quest by ID with valid ID
	"""
	generate_cookies_from_user(client, test_db)

	# Create a topic first
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Insert a test quest
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Test Quest",
		"description": "Test description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"price": 10.0,
		"applicants": [],
		"status": "open"
	})

	response = client.get(f"/api/quests/{quest_id}")

	assert response.status_code == 200
	assert response.json()["quest"]["title"] == "Test Quest"
	assert response.json()["quest"]["_id"] == str(quest_id)


def test_update_quest_no_auth(client):
	"""
	Test update quest without authentication
	"""
	quest_id = str(ObjectId())
	update_data = {
		"title": "Updated Quest",
		"description": "Updated description",
		"topics": ["updated"],
		"longitude": 15.0,
		"latitude": 25.0,
		"price": 15.0,
		"deadline": (datetime.now() + timedelta(days=30)).isoformat()
	}

	response = client.put(f"/api/quests/{quest_id}", json=update_data)
	assert response.status_code == 401


def test_update_quest_not_found(client, test_db):
	"""
	Test update quest with non-existent ID
	"""
	generate_cookies_from_user(client, test_db)
	non_existent_id = str(ObjectId())

	update_data = {
		"title": "Updated Quest",
		"description": "Updated description",
		"topics": ["updated"],
		"longitude": 15.0,
		"latitude": 25.0,
		"price": 15.0,
		"deadline": (datetime.now() + timedelta(days=30)).isoformat()
	}

	response = client.put(f"/api/quests/{non_existent_id}", json=update_data)
	assert response.status_code == 404
	assert response.json()["detail"] == "Quest not found"


def test_update_quest_not_creator(client, test_db):
	"""
	Test update quest when user is not the creator
	"""
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me").json()
	user_id = ObjectId(user_data["user"]["_id"])

	# Create a topic
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Create another user as the creator
	another_user_id = ObjectId()

	# Insert a test quest with another user as creator
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Original Quest",
		"description": "Original description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"price": 10.0,
		"created_by": another_user_id,
		"applicants": [],
		"status": "open"
	})

	update_data = {
		"title": "Updated Quest",
		"description": "Updated description",
		"topics": ["test"],
		"longitude": 15.0,
		"latitude": 25.0,
		"price": 15.0,
		"deadline": (datetime.now() + timedelta(days=30)).isoformat()
	}

	response = client.put(f"/api/quests/{quest_id}", json=update_data)

	# The update should fail because the user is not the creator
	assert response.status_code == 404

	assert "User is not the creator of this quest" in response.json()["detail"]


def test_update_quest(client, test_db):
	"""
	Test update quest with valid ID and data
	"""
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me")

	user_id = ObjectId(user_data.json()["user"]["_id"])

	# Create topics
	old_topic_id = ObjectId()
	new_topic_id = ObjectId()
	test_db["topics"].insert_many([
		{"_id": old_topic_id, "name": "original"},
		{"_id": new_topic_id, "name": "updated"}
	])

	# Insert a test quest with the current user as creator
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Original Quest",
		"description": "Original description",
		"topics": [old_topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"created_by": user_id,
		"price": 10.0,
		"applicants": [],
		"status": "open"
	})

	new_deadline = (datetime.now() + timedelta(days=60)).isoformat()
	update_data = {
		"title": "Updated Quest",
		"description": "Updated description",
		"topics": ["updated"],
		"longitude": 15.0,
		"latitude": 25.0,
		"price": 15.0,
		"deadline": new_deadline
	}

	response = client.put(f"/api/quests/{quest_id}", json=update_data)

	assert response.status_code == 200
	assert response.json()["quest"]["title"] == "Updated Quest"

	# Verify quest was updated in database
	db_quest = test_db["quests"].find_one({"_id": quest_id})
	assert db_quest["title"] == "Updated Quest"
	assert db_quest["description"] == "Updated description"
	assert db_quest["longitude"] == 15.0
	assert db_quest["price"] == 15.0
	assert db_quest["latitude"] == 25.0
	assert len(db_quest["topics"]) == 1
	assert db_quest["topics"][0] == new_topic_id


def test_delete_quest_no_auth(client):
	"""
	Test delete quest without authentication
	"""
	quest_id = str(ObjectId())
	response = client.delete(f"/api/quests/{quest_id}")
	assert response.status_code == 401


def test_delete_quest_not_found(client, test_db):
	"""
	Test delete quest with non-existent ID
	"""
	generate_cookies_from_user(client, test_db)
	non_existent_id = str(ObjectId())

	response = client.delete(f"/api/quests/{non_existent_id}")
	assert response.status_code == 404
	assert response.json()["detail"] == "Quest not found or already deleted"


def test_delete_quest(client, test_db):
	"""
	Test delete quest with valid ID
	"""
	generate_cookies_from_user(client, test_db)

	# Create a topic
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Insert a test quest
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Test Quest",
		"description": "Test description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"applicants": [],
		"status": "open"
	})

	response = client.delete(f"/api/quests/{quest_id}")

	print(response.json())

	assert response.status_code == 200
	assert response.json()["message"] == "Quest deleted"

	# Verify quest was deleted from database
	db_quest = test_db["quests"].find_one({"_id": quest_id})
	assert db_quest is None


def test_filter_quests_no_auth(client):
	"""
	Test filter quests without authentication
	"""
	response = client.get("/api/quests/filter?topics=test")
	assert response.status_code == 401


def test_filter_quests_no_results(client, test_db):
	"""
	Test filter quests with no matching results
	"""
	generate_cookies_from_user(client, test_db)

	# Create topics
	topic1_id = ObjectId()
	topic2_id = ObjectId()
	test_db["topics"].insert_many([
		{"_id": topic1_id, "name": "topic1"},
		{"_id": topic2_id, "name": "topic2"}
	])

	# Insert test quests with different topics
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_many([
		{
			"title": "Quest 1",
			"description": "Test description 1",
			"topics": [topic1_id],
			"longitude": 10.0,
			"latitude": 20.0,
			"deadline": deadline,
			"price": 10.0,
			"applicants": [],
			"status": "open"
		},
		{
			"title": "Quest 2",
			"description": "Test description 2",
			"topics": [topic2_id],
			"longitude": 15.0,
			"latitude": 25.0,
			"price": 15.0,
			"deadline": deadline,
			"applicants": [],
			"status": "open"
		}
	])

	# The filter endpoint should look for topics by name
	response = client.get("/api/quests/filter?topics=non_existent_topic")
	assert response.status_code == 404
	assert response.json()["detail"] == "No quests found"


def test_filter_quests(client, test_db):
	"""
	Test filter quests with matching results
	"""
	generate_cookies_from_user(client, test_db)

	# Create topics
	topic1_id = ObjectId()
	topic2_id = ObjectId()
	topic3_id = ObjectId()
	common_id = ObjectId()
	test_db["topics"].insert_many([
		{"_id": topic1_id, "name": "topic1"},
		{"_id": topic2_id, "name": "topic2"},
		{"_id": topic3_id, "name": "topic3"},
		{"_id": common_id, "name": "common"}
	])

	# Insert test quests with different topics
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_many([
		{
			"title": "Quest 1",
			"description": "Test description 1",
			"topics": [topic1_id, common_id],
			"longitude": 10.0,
			"latitude": 20.0,
			"price": 10.0,
			"deadline": deadline,
			"applicants": [],
			"status": "open"
		},
		{
			"title": "Quest 2",
			"description": "Test description 2",
			"topics": [topic2_id, common_id],
			"longitude": 15.0,
			"price": 15.0,
			"latitude": 25.0,
			"deadline": deadline,
			"applicants": [],
			"status": "open"
		},
		{
			"title": "Quest 3",
			"description": "Test description 3",
			"topics": [topic3_id],
			"longitude": 30.0,
			"price": 30.0,
			"latitude": 40.0,
			"deadline": deadline,
			"applicants": [],
			"status": "open"
		}
	])

	# Filter by single topic
	response = client.get("/api/quests/filter?topics=topic1")
	print(response.json())
	assert response.status_code == 200
	assert len(response.json()["quests"]) == 1
	assert response.json()["quests"][0]["title"] == "Quest 1"

	# Filter by multiple topics
	response = client.get("/api/quests/filter?topics=topic1&topics=common")
	assert response.status_code == 200
	assert len(response.json()["quests"]) == 2

	# Filter by price range
	response = client.get("/api/quests/filter?prices=10.0&prices=15.0")
	assert response.status_code == 200
	assert len(response.json()["quests"]) == 2

	# Filter by price and topics
	response = client.get("/api/quests/filter?topics=topic1&topics=common&prices=10.0&prices=15.0")
	assert response.status_code == 200
	assert len(response.json()["quests"]) == 2


def test_apply_to_quest_no_auth(client):
	"""
	Test apply to quest without authentication
	"""
	quest_id = str(ObjectId())
	response = client.post(f"/api/quests/{quest_id}/apply")
	assert response.status_code == 401


def test_apply_to_quest_not_found(client, test_db):
	"""
	Test apply to quest with non-existent ID
	"""
	generate_cookies_from_user(client, test_db)
	non_existent_id = str(ObjectId())

	response = client.post(f"/api/quests/{non_existent_id}/apply")
	assert response.status_code == 404
	assert "detail" in response.json()


def test_apply_to_quest_creator(client, test_db):
	"""
	Test apply to quest when user is the creator
	"""
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me").json()
	user_id = ObjectId(user_data["user"]["_id"])

	# Create a topic
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Insert a test quest with the current user as creator
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Test Quest",
		"description": "Test description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"created_by": user_id,
		"applicants": [],
		"status": "open"
	})

	response = client.post(f"/api/quests/{quest_id}/apply")

	# Should fail because user is the creator
	assert response.status_code == 404
	assert "User is the creator" in response.json()["detail"]


def test_apply_to_quest(client, test_db):
	"""
	Test apply to quest with valid ID
	"""
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me").json()
	user_id = ObjectId(user_data["user"]["_id"])

	# Create another user as the creator
	another_user_id = ObjectId()

	# Create a topic
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Insert a test quest with another user as creator
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Test Quest",
		"description": "Test description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"created_by": another_user_id,
		"applicants": [],
		"status": "open"
	})

	response = client.post(f"/api/quests/{quest_id}/apply")

	assert response.status_code == 200
	assert response.json()["message"] == "Applied to quest"

	# Verify user was added as applicant in database
	db_quest = test_db["quests"].find_one({"_id": quest_id})
	assert user_id in db_quest["applicants"]


def test_apply_to_quest_already_applied(client, test_db):
	"""
	Test apply to quest when user has already applied
	"""
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me").json()
	user_id = ObjectId(user_data["user"]["_id"])

	# Create another user as the creator
	another_user_id = ObjectId()

	# Create a topic
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Insert a test quest with user already as applicant
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Test Quest",
		"description": "Test description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"created_by": another_user_id,
		"applicants": [user_id],  # User is already an applicant
		"status": "open"
	})

	response = client.post(f"/api/quests/{quest_id}/apply")

	# Should fail because user already applied
	assert response.status_code == 404
	assert "already an applicant" in response.json()["detail"]

def test_close_quest_no_auth(client, test_db):
	"""
	Test close quest without authentication
	"""
	quest_id = str(ObjectId())
	response = client.post(f"/api/quests/{quest_id}/close")
	assert response.status_code == 401


def test_close_quest_not_found(client, test_db):
	"""
	Test close quest with non-existent ID
	"""
	generate_cookies_from_user(client, test_db)
	non_existent_id = str(ObjectId())

	response = client.post(f"/api/quests/{non_existent_id}/close")
	assert response.status_code == 404
	assert response.json()["detail"] == "Quest not found"


def test_close_quest_not_creator(client, test_db):
	"""
	Test close quest when user is not the creator
	"""
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me").json()
	user_id = ObjectId(user_data["user"]["_id"])

	# Create a topic
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Create another user as the creator
	another_user_id = ObjectId()

	# Insert a test quest with another user as creator
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Test Quest",
		"description": "Test description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"created_by": another_user_id,
		"applicants": [],
		"status": "open"
	})

	response = client.post(f"/api/quests/{quest_id}/close")

	# The close should fail because the user is not the creator
	assert response.status_code == 404
	assert "User is not the creator of this quest" in response.json()["detail"]


def test_close_quest(client, test_db):
	"""
	Test close quest with valid ID
	"""
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me").json()
	user_id = ObjectId(user_data["user"]["_id"])

	# Create a topic
	topic_id = ObjectId()
	test_db["topics"].insert_one({"_id": topic_id, "name": "test"})

	# Insert a test quest with the current user as creator
	quest_id = ObjectId()
	deadline = datetime.now() + timedelta(days=30)
	test_db["quests"].insert_one({
		"_id": quest_id,
		"title": "Test Quest",
		"description": "Test description",
		"topics": [topic_id],
		"longitude": 10.0,
		"latitude": 20.0,
		"deadline": deadline,
		"created_by": user_id,
		"applicants": [],
		"status": "open"
	})

	response = client.post(f"/api/quests/{quest_id}/close")

	assert response.status_code == 200
	assert response.json()["message"] == "Quest closed"

	# Verify quest status was updated in database
	db_quest = test_db["quests"].find_one({"_id": quest_id})
	assert db_quest["status"] == "closed"
