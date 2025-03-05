from endpoints.auth import generate_encrypted_cookie
from db import pwd_hashing
import logging

logger = logging.getLogger(__name__)

def generate_cookies_from_user(client, test_db, username="authuser", password="securepassword", email="auth@gmail.com"):
    """
    A helper function to generate cookies from a user.
    """
    test_db["users"].insert_one({
        "username": username,
        "password": pwd_hashing.hash_password(password),
        "email": email
    })

    auth_token = generate_encrypted_cookie(username)

    logger.info(f"Inserting token into cookies collection: {auth_token}")

    test_db["cookies"].insert_one({
        "username": username,
        "cookie": auth_token,
        "created_at": "2024-03-05T00:00:00",
        "expiration_at": "2024-03-12T00:00:00"
    })

    cookie = test_db["cookies"].find_one({"username": username})
    assert cookie, f"No cookie found for user {username}"

    client.cookies["auth_token"] = auth_token
    return auth_token
