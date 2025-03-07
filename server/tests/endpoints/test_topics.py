from .gen_auth_user_for_tests import generate_cookies_from_user

def test_get_topics_no_auth(client):
	"""
	Test get topics without authentication
	"""

	response = client.get("/api/topics")

	print(response.json())

	assert response.status_code == 401


def test_get_empty_topics(client, test_db):
	"""
	Test get empty topics, with an empty database
	"""

	_ = generate_cookies_from_user(client, test_db)
	response = client.get("/api/topics")

	assert response.status_code == 200
	print(response.json())
	assert response.json()["topics"] == []


def test_get_topics(client, test_db):
	"""
	Test get (self inserted) topics
	"""

	_ = generate_cookies_from_user(client, test_db)
	test_db["topics"].insert_one({"name": "testtopic"})

	response = client.get("/api/topics")

	assert response.status_code == 200
	assert response.json()["topics"] == ["testtopic"]
