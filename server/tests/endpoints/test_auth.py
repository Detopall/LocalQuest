from .gen_auth_user_for_tests import generate_cookies_from_user

def test_create_user(client):
	"""
	Test user registration.
	"""
	username = "testuser"
	password = "testpassword"
	email = "testemail@gmail.com"

	response = client.post("/auth", json={"username": username, "password": password, "email": email})

	assert response.status_code == 200
	assert response.json()["message"] == "Authentication successful"
	assert response.json()["username"] == username
	assert response.json()["email"] == email

def test_login_existing_user(client, test_db):
	"""
	Test login for an existing user.
	"""
	username = "existinguser"
	password = "securepassword"
	email = "user@gmail.com"

	from db import pwd_hashing
	test_db["users"].insert_one({
		"username": username,
		"password": pwd_hashing.hash_password(password),
		"email": email
	})

	response = client.post("/auth", json={"username": username, "password": password})

	assert response.status_code == 200
	assert response.json()["message"] == "Authentication successful"
	assert response.json()["username"] == username

def test_login_with_wrong_password(client, test_db):
	"""
	Test login with incorrect password.
	"""
	username = "wronguser"
	password = "correctpassword"
	wrong_password = "wrongpassword"

	from db import pwd_hashing
	test_db["users"].insert_one({
		"username": username,
		"password": pwd_hashing.hash_password(password),
		"email": "wrong@gmail.com"
	})

	response = client.post("/auth", json={"username": username, "password": wrong_password})

	assert response.status_code == 401
	assert response.json()["detail"] == "Incorrect password"


def test_auth_me_success(client, test_db):
	"""
	Test authenticated user retrieval (/me).
	"""

	generate_cookies_from_user(client, test_db)
	auth_token = client.cookies["auth_token"]
	username = test_db["cookies"].find_one({"cookie": auth_token})["username"]


	response = client.get("/auth/me")

	assert response.status_code == 200
	assert response.json()["message"] == "Authentication successful"
	assert response.json()["username"] == username


def test_auth_me_fail_no_cookie(client):
	"""
	Test authentication failure when no cookie is provided.
	"""
	response = client.get("/auth/me")

	assert response.status_code == 401
	assert response.json()["detail"] == "No authentication token found"

def test_auth_me_invalid_token(client):
	"""
	Test authentication failure with an invalid token.
	"""

	client.cookies["auth_token"] = "invalidtoken"

	response = client.get("/auth/me")

	assert response.status_code == 401
	assert response.json()["detail"] == "Invalid authentication token"


def test_logout(client, test_db):
	"""
	Test logout.
	"""

	generate_cookies_from_user(client, test_db)
	auth_token = client.cookies["auth_token"]
	username = test_db["cookies"].find_one({"cookie": auth_token})["username"]

	response = client.post("/auth/logout")

	assert response.status_code == 200
	assert response.json()["message"] == "Logout successful"

	assert test_db["cookies"].find_one({"username": username, "cookie": auth_token}) is None

def test_logout_no_cookie(client):
	"""
	Test logout when no cookie is provided.
	"""
	response = client.post("/auth/logout")

	assert response.status_code == 401
	assert response.json()["detail"] == "No authentication token found"

def test_logout_invalid_token(client):
	"""
	Test logout with an invalid token.
	"""

	client.cookies["auth_token"] = "invalidtoken"

	response = client.post("/auth/logout")

	assert response.status_code == 401
	assert response.json()["detail"] == "Invalid authentication token"