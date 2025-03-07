from .gen_auth_user_for_tests import generate_cookies_from_user

def test_me_no_auth(client):
	"""
	Test me without authentication
	"""
	response = client.get("/api/me")
	assert response.status_code == 401


def test_me(client, test_db):
	"""
	Test me with authentication
	"""

	_ = generate_cookies_from_user(client, test_db)
	response = client.get("/api/me")

	assert response.status_code == 200
	assert response.json()["user"]["username"] == "authuser"
	assert response.json()["user"]["email"] == "auth@gmail.com"
	assert response.json()["user"]["password"] != "securepassword"
	assert response.json()["user"]["_id"] is not None
