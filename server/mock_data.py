"""
This file contains functions to generate mock data for testing and presentation purposes.
"""

import requests
import random
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"
AUTH_URL = "http://localhost:8000/auth"
USERS = [
    {"username": "Steve", "password": "steve123", "email": "steve@gmail.com"},
    {"username": "Kevin", "password": "kevin123", "email": "kevin@gmail.com"},
    {"username": "Simon", "password": "simon123", "email": "simon@gmail.com"},
    {"username": "Alice", "password": "alice123", "email": "alice@gmail.com"},
    {"username": "Hannah", "password": "hannah123", "email": "hannah@gmail.com"},
]

QUESTS = {
    "Fix the leaking faucet": "Need someone to fix the leaking faucet in the kitchen.",
    "Mow the lawn": "Looking for help to mow the lawn this weekend.",
    "Babysit for an evening": "Need a babysitter for an evening while we go out.",
    "Walk the dog": "Looking for someone to walk my dog in the mornings.",
    "Help with math homework": "Need help with math homework for my child.",
    "Clean the garage": "Looking for help to clean and organize the garage.",
    "Paint the fence": "Need someone to paint the fence in the backyard.",
    "Assemble IKEA furniture": "Looking for help to assemble IKEA furniture.",
    "Organize a closet": "Need help to organize the closet and sort clothes.",
    "Cook a family dinner": "Looking for someone to cook a family dinner for us.",
}


TOPICS = [
    "Technology",
    "Gardening",
    "Finance",
    "Baby Sitting",
    "Pet Sitting",
    "House Sitting",
    "Cooking",
    "Tutoring",
    "Cleaning",
    "Other",
]


def authenticate_user(user):
    response = requests.post(AUTH_URL, json=user)
    response.raise_for_status()
    print(response.json())
    return response.cookies.get("auth_token")


def get_me_id(auth_token):
    response = requests.get(f"{AUTH_URL}/me", cookies={"auth_token": auth_token})
    response.raise_for_status()
    return response.json()["_id"]


def create_quest(auth_token, user_id):
    title, description = random.choice(list(QUESTS.items()))
    quest = {
        "title": title,
        "description": description,
        "topics": random.sample(TOPICS, k=random.randint(1, 3)),
        "price": round(random.uniform(10, 100), 2),
        "created_by": user_id,
        "latitude": round(random.uniform(50.7, 51.4), 6),  # range for West Flanders
        "longitude": round(random.uniform(2.5, 3.0), 6),  # range for West Flanders
        "deadline": (
            datetime.now() + timedelta(days=random.randint(1, 30))
        ).isoformat(),
        "applicants": [],
        "status": "open",
    }

    response = requests.post(
        f"{BASE_URL}/quests", json=quest, cookies={"auth_token": auth_token}
    )
    response.raise_for_status()
    return response.json()["quest"]


def apply_to_quest(auth_token, quest_id):
    response = requests.post(
        f"{BASE_URL}/quests/{quest_id}/apply", cookies={"auth_token": auth_token}
    )
    response.raise_for_status()
    return response.json()


def main():
    user_tokens = {}
    user_quests = {}
    for user in USERS:
        auth_token = authenticate_user(user)
        user_id = user["username"]
        user_tokens[user_id] = auth_token

        created_quests = [
            create_quest(auth_token, user_id) for _ in range(random.randint(2, 4))
        ]
        user_quests[user_id] = created_quests
        time.sleep(1)

    for user in USERS:
        auth_token = authenticate_user(user)
        user_id = get_me_id(auth_token)
        user_tokens[user_id] = auth_token

    # Remove double quotes from token values
    user_tokens = {user: token.strip('"') for user, token in user_tokens.items()}

    first_user_auth_token = next(iter(user_tokens.values()))
    response = requests.get(
        f"{BASE_URL}/quests", cookies={"auth_token": first_user_auth_token}
    )
    response.raise_for_status()
    all_quests = response.json()["quests"]

    for quest in all_quests:
        created_by = str(quest["created_by"])
        if created_by not in user_quests:
            user_quests[created_by] = []
        user_quests[created_by].append(quest)

    for creator_id, quests in user_quests.items():
        available_users = [user for user in user_tokens.keys() if user != creator_id]
        user_id = random.choice(available_users)
        auth_token = user_tokens[user_id]

        for _ in range(random.randint(1, 2)):
            if not quests:
                break
            quest = random.choice(quests)
            apply_to_quest(auth_token, str(quest["_id"]))
            quests.remove(quest)
            time.sleep(1)


if __name__ == "__main__":
    main()
