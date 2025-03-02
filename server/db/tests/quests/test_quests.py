import pytest
from db.crud import (
	create_user,
	create_quest,
	get_all_quests,
	get_quest_by_id,
	get_quests_by_user_id,
	set_quest_status,
	get_quest_candidates,
	add_quest_candidate,
	get_user_applied_quests,
	DbError
)

def create_test_topics(db):
    topics = ["Tech", "Science", "Art"]
    cursor = db.cursor()

    for topic in topics:
        cursor.execute('SELECT * FROM topics WHERE name = ?', (topic,))
        if cursor.fetchone() is None:
            cursor.execute('INSERT INTO topics (name) VALUES (?)', (topic,))

    db.commit()

def create_test_user(db, username="testuser", password="password123", email="test@example.com"):
	return create_user(db, username, password, email)

def create_test_quest(db, user_id):
	create_test_topics(db)
	return create_quest(db, "Test Quest", "Test Description", ["Tech"], user_id)


def test_create_quest(db):
	create_test_topics(db)
	user = create_test_user(db)
	quest = create_test_quest(db, user["id"])

	assert quest is not None
	assert quest["title"] == "Test Quest"
	assert quest["description"] == "Test Description"
	assert quest["user_id"] == user["id"]
	assert quest["status"] == "open"

def test_get_all_quests(db):
	user = create_test_user(db)
	create_test_quest(db, user["id"])

	quests = get_all_quests(db)
	assert len(quests) == 1
	assert quests[0]["title"] == "Test Quest"

def test_get_quest_by_id(db):
	user = create_test_user(db)
	quest = create_test_quest(db, user["id"])

	retrieved_quest = get_quest_by_id(db, quest["id"])
	assert retrieved_quest is not None
	assert retrieved_quest["id"] == quest["id"]
	assert retrieved_quest["title"] == "Test Quest"

def test_get_quests_by_user_id(db):
	user = create_test_user(db)
	_ = create_test_quest(db, user["id"])
	_ = create_test_quest(db, user["id"])

	quests = get_quests_by_user_id(db, user["id"])
	assert len(quests) == 2
	assert quests[0]["user_id"] == user["id"]
	assert quests[1]["user_id"] == user["id"]

def test_set_quest_status(db):
	user = create_test_user(db)
	quest = create_test_quest(db, user["id"])

	set_quest_status(db, quest["id"], "closed")

	updated_quest = get_quest_by_id(db, quest["id"])
	assert updated_quest["status"] == "closed"
	assert updated_quest["completed_at"] is not None

def test_get_quest_candidates(db):
	user = create_test_user(db)

	quest = create_test_quest(db, user["id"])

	candidates = get_quest_candidates(db, quest["id"])
	assert len(candidates) == 0

def test_add_quest_candidate(db):
	user = create_test_user(db)
	other_user = create_test_user(db, "anotheruser", "password123", "another@example.com")

	quest = create_test_quest(db, user["id"])

	assert other_user["id"] != user["id"]

	_ = add_quest_candidate(db, quest["id"], other_user["id"])

	candidates = get_quest_candidates(db, quest["id"])
	assert len(candidates) == 1
	assert candidates[0]["user_id"] == other_user["id"]

def test_get_user_applied_quests(db):
	user = create_test_user(db)
	user1 = create_test_user(db, "anotheruser", "password123", "another@example.com")
	user2 = create_test_user(db, "yetanotheruser", "password123", "yetanother@example.com")

	assert user1["id"] != user["id"]
	assert user2["id"] != user["id"]
	assert user2["id"] != user1["id"]

	quest1 = create_test_quest(db, user["id"])
	quest2 = create_test_quest(db, user["id"])

	add_quest_candidate(db, quest1["id"], user1["id"])
	add_quest_candidate(db, quest2["id"], user2["id"])

	applied_quests_user = get_user_applied_quests(db, user["id"])
	applied_quests_user1 = get_user_applied_quests(db, user1["id"])
	applied_quests_user2 = get_user_applied_quests(db, user2["id"])

	assert len(applied_quests_user) == 0
	assert len(applied_quests_user1) == 1
	assert len(applied_quests_user2) == 1

	assert applied_quests_user1[0]["user_id"] == user1["id"]
	assert applied_quests_user2[0]["user_id"] == user2["id"]


def test_create_quest_without_user(db):
	try:
		create_test_quest(db, 999)  # Invalid user ID
		pytest.fail("Expected error when creating quest without valid user")
	except ValueError as e:
		assert e.args[0] == DbError.USER_NOT_FOUND_ERROR.value

def test_create_quest_with_creator_as_candidate_invalid(db):
	user = create_test_user(db)
	quest = create_test_quest(db, user["id"])

	try:
		add_quest_candidate(db, quest["id"], user["id"])
		pytest.fail("Expected error when creating quest with creator as candidate")
	except ValueError as e:
		assert e.args[0] == DbError.USER_IS_CREATOR_ERROR.value

def test_set_quest_status_invalid(db):
	user = create_test_user(db)
	quest = create_test_quest(db, user["id"])

	try:
		set_quest_status(db, quest["id"], "invalid_status")
		pytest.fail("Expected error when setting invalid quest status")
	except ValueError as e:
		assert e.args[0] == DbError.INVALID_QUEST_STATUS_ERROR.value

def test_add_quest_candidate_for_invalid_quest(db):
	user = create_test_user(db)

	try:
		add_quest_candidate(db, 999, user["id"])  # Invalid quest ID
		pytest.fail("Expected error when adding candidate for non-existent quest")
	except ValueError as e:
		assert e.args[0] == DbError.QUEST_NOT_FOUND_ERROR.value

def test_add_quest_candidate_for_invalid_user(db):
	user = create_test_user(db)
	quest = create_test_quest(db, user["id"])

	try:
		add_quest_candidate(db, quest["id"], 999)  # Invalid user ID
		pytest.fail("Expected error when adding candidate for non-existent user")
	except ValueError as e:
		assert e.args[0] == DbError.USER_NOT_FOUND_ERROR.value

