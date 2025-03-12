from bson import ObjectId
from datetime import datetime, timedelta
from .gen_auth_user_for_tests import generate_cookies_from_user

def create_quests(test_db, creator_id=None, applicants=None):
	"""
	Create test quests with customizable creator and applicants.

	Args:
		test_db (MongoClient): The test database connection.
		creator_id (ObjectId, optional): The creator ID for the quests.
		applicants (list[ObjectId], optional): List of user IDs applying to quests.

	Returns:
		tuple: (quest1_id, quest2_id)
	"""
	if creator_id is None:
		creator_id = ObjectId()

	if applicants is None:
		applicants = []

	topic1_id, topic2_id = ObjectId(), ObjectId()
	test_db["topics"].insert_many([
		{"_id": topic1_id, "name": "topic1"},
		{"_id": topic2_id, "name": "topic2"}
	])

	deadline = datetime.now() + timedelta(days=30)

	quests = [
		{
			"_id": ObjectId(),
			"title": "Quest 1",
			"description": "Test description 1",
			"topics": [topic1_id],
			"longitude": 10.0,
			"latitude": 20.0,
			"deadline": deadline,
			"applicants": applicants,
			"created_by": creator_id,
			"status": "open"
		},
		{
			"_id": ObjectId(),
			"title": "Quest 2",
			"description": "Test description 2",
			"topics": [topic2_id],
			"longitude": 15.0,
			"latitude": 25.0,
			"deadline": deadline,
			"applicants": applicants,
			"created_by": creator_id,
			"status": "open"
		}
	]

	test_db["quests"].insert_many(quests)

	return quests[0]["_id"], quests[1]["_id"]


def test_get_users_unauthenticated(client):
	response = client.get("/api/users")
	assert response.status_code == 401


def test_get_users(client, test_db):
	generate_cookies_from_user(client, test_db)

	user1_id, user2_id = ObjectId(), ObjectId()
	test_db["users"].insert_many([
		{"_id": user1_id, "name": "User 1", "email": "user1@example.com"},
		{"_id": user2_id, "name": "User 2", "email": "user2@example.com"},
	])

	response = client.get("/api/users")
	assert response.status_code == 200
	assert len(response.json()["users"]) == 3  # Includes authenticated user

def test_get_user_by_username(client, test_db):
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me").json()
	auth_user_id = ObjectId(user_data["user"]["_id"])

	response = client.get(f"/api/users/{user_data['user']['username']}")
	assert response.status_code == 200
	assert response.json()["user"]["_id"] == str(auth_user_id)


def test_get_user_not_found(client, test_db):
	generate_cookies_from_user(client, test_db)
	non_existent_user = str(ObjectId())

	response = client.get(f"/api/users/{non_existent_user}")
	assert response.status_code == 404
	assert response.json()["detail"] == "User not found"


def test_get_user(client, test_db):
	generate_cookies_from_user(client, test_db)
	user_data = client.get("/api/me")
	user_id = ObjectId(user_data.json()["user"]["_id"])

	response = client.get(f"/api/users/{user_id}")
	assert response.status_code == 200
	assert response.json()["user"]["username"] == "authuser"
	assert response.json()["user"]["email"] == "auth@gmail.com"


def test_delete_user_not_found(client, test_db):
	generate_cookies_from_user(client, test_db)

	response = client.delete(f"/api/users/{ObjectId()}")
	assert response.status_code == 404
	assert response.json()["detail"] == "User not found or already deleted"


def test_delete_user(client, test_db):
	generate_cookies_from_user(client, test_db)

	user_data = client.get("/api/me").json()
	auth_user_id = ObjectId(user_data["user"]["_id"])

	response = client.delete(f"/api/users/{auth_user_id}")

	assert response.status_code == 200
	assert response.json()["message"] == "User deleted"

	response = client.get(f"/api/users/{auth_user_id}")
	assert response.status_code == 404


def test_delete_user_removes_created_quests(client, test_db):
	generate_cookies_from_user(client, test_db)

	user_data = client.get("/api/me").json()
	auth_user_id = ObjectId(user_data["user"]["_id"])
	quest1_id, quest2_id = create_quests(test_db, creator_id=auth_user_id)

	response = client.delete(f"/api/users/{auth_user_id}")
	assert response.status_code == 200

	assert test_db["quests"].find_one({"_id": quest1_id}) is None
	assert test_db["quests"].find_one({"_id": quest2_id}) is None


def test_delete_user_removes_applicant_from_quests(client, test_db):
	generate_cookies_from_user(client, test_db)

	user_data = client.get("/api/me").json()
	auth_user_id = ObjectId(user_data["user"]["_id"])

	user_id = ObjectId()
	test_db["users"].insert_one({"_id": user_id, "name": "Test User", "email": "test@example"})

	quest1_id, quest2_id = create_quests(test_db, applicants=[auth_user_id], creator_id=user_id)

	response = client.delete(f"/api/users/{auth_user_id}")
	assert auth_user_id != user_id
	assert response.status_code == 200

	quest1 = test_db["quests"].find_one({"_id": quest1_id})
	quest2 = test_db["quests"].find_one({"_id": quest2_id})

	assert auth_user_id not in quest1["applicants"]
	assert auth_user_id not in quest2["applicants"]


def test_delete_user_unauthorized(client, test_db):
	generate_cookies_from_user(client, test_db)

	user_data = client.get("/api/me").json()
	auth_user_id = ObjectId(user_data["user"]["_id"])

	user_id = ObjectId()
	test_db["users"].insert_one({"_id": user_id, "name": "Test User", "email": "test@example"})

	before_unauthorized_delete = test_db["users"].find_one({"_id": user_id})
	response = client.delete(f"/api/users/{user_id}")
	after_unauthorized_delete = test_db["users"].find_one({"_id": user_id})

	assert before_unauthorized_delete is not None
	assert after_unauthorized_delete is not None

	assert auth_user_id != user_id
	assert response.status_code == 404
