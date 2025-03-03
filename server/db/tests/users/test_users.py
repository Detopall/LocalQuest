import pytest
from db.crud.user import create_user, get_user_by_username, authenticate_user
from db.errors import DbError

def test_create_user(db):
	user = create_user(db, "testuser", "password123", "test@example.com")
	assert user is not None
	assert user["username"] == "testuser"


def test_get_user_by_username(db):
	create_user(db, "testuser", "password123", "test@example.com")
	user = get_user_by_username(db, "testuser")
	assert user is not None
	assert user["email"] == "test@example.com"

def test_authenticate_user(db):
	create_user(db, "testuser", "password123", "test@example.com")
	cursor = db.cursor()
	cursor.execute("INSERT INTO cookies (username, cookie) VALUES (?, ?)", ("testuser", "valid_token"))
	db.commit()

	user = authenticate_user(db, "valid_token")
	assert user is not None
	assert user["username"] == "testuser"

	assert authenticate_user(db, "invalid_token") is None

def test_create_user_with_existing_username_invalid(db):
	create_user(db, "testuser", "password123", "test@example.com")
	try:
		create_user(db, "testuser", "password123", "test@example.com")
		pytest.fail("Expected error when creating user with existing username")
	except ValueError as e:
		assert e.args[0] == DbError.USER_ALREADY_EXISTS_ERROR.value


def test_create_user_with_existing_email_invalid(db):
	create_user(db, "testuser", "password123", "test@example.com")
	try:
		create_user(db, "anotheruser", "password123", "test@example.com")
		pytest.fail("Expected error when creating user with existing email")
	except ValueError as e:
		assert e.args[0] == DbError.EMAIL_ALREADY_EXISTS_ERROR.value
