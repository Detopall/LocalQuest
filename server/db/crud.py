from typing import Literal
from enum import Enum
from db.pwd_hashing import hash_password

class DbError(Enum):
    USER_NOT_FOUND_ERROR = "User not found"
    EMAIL_ALREADY_EXISTS_ERROR = "Email already exists"
    TOPIC_NOT_FOUND_ERROR = "Topic not found"
    INVALID_QUEST_STATUS_ERROR = "Invalid quest status"
    USER_ALREADY_APPLIED_ERROR = "User already applied to this quest"
    QUEST_NOT_FOUND_ERROR = "Quest not found"
    USER_ALREADY_EXISTS_ERROR = "User already exists"
    USER_IS_CREATOR_ERROR = "User is the creator of this quest"


def get_user_by_username(db, username: str) -> dict:
    """
    Get a user by username

    Args:
        db (sqlite3.Connection): SQLite database connection
        username (str): Username

    Returns:
        dict: User data or None if not found
    """
    cursor = db.cursor()

    cursor.execute('''
    SELECT * FROM users WHERE username = ?
    ''', (username,))

    user = cursor.fetchone()

    return user

def get_user_by_id(db, id: int) -> dict:
    """
    Get a user by ID

    Args:
        db (sqlite3.Connection): SQLite database connection
        id (int): User ID

    Returns:
        dict: User data or None if not found
    """
    cursor = db.cursor()

    cursor.execute('''
    SELECT * FROM users WHERE id = ?
    ''', (id,))

    user = cursor.fetchone()

    return user


def create_user(db, username: str, password: str, email: str) -> dict:
    """
    Create a new user in the database

    Args:
        db (sqlite3.Connection): SQLite database connection
        username (str): Username
        password (str): Password
        email (str): Email address

    Returns:
        dict: Newly created user data
    """
    cursor = db.cursor()

    if get_user_by_username(db, username):
        raise ValueError(DbError.USER_ALREADY_EXISTS_ERROR.value)

    cursor.execute('''
    SELECT * FROM users WHERE email = ?
    ''', (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        raise ValueError(DbError.EMAIL_ALREADY_EXISTS_ERROR.value)

    hashed_password = hash_password(password)

    cursor.execute('''
    INSERT INTO users (username, password, email) VALUES (?, ?, ?)
    ''', (username, hashed_password, email))

    db.commit()

    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    new_user = cursor.fetchone()

    return new_user

def authenticate_user(db, auth_token: str) -> dict:
    """
    Validate the authentication token.

    Args:
        db (SQLite connection): Database connection.
        auth_token (str): Encrypted token from cookies.

    Returns:
        User: Authenticated user
    """

    cursor = db.cursor()
    cursor.execute("SELECT username FROM cookies WHERE cookie = ?", (auth_token,))
    result = cursor.fetchone()

    if result:
        return get_user_by_username(db, result["username"])
    return None

def get_topics(db) -> list:
    """
    Get all topics from the database.

    Args:
        db (sqlite3.Connection): SQLite database connection.

    Returns:
        list: List of topics.
    """

    cursor = db.cursor()
    cursor.execute("SELECT * FROM topics")
    return cursor.fetchall()

def get_topic_by_names(db, names: list[str]) -> list[dict]:
    """
    Get all topics by names.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        names (list[str]): List of topic names.

    Returns:
        list[dict]: Topic data or raises ValueError if not found.
    """

    cursor = db.cursor()

    if not names:
        raise ValueError(DbError.TOPIC_NOT_FOUND_ERROR.value)

    cursor.execute('''
    SELECT * FROM topics WHERE name IN ({})
    '''.format(','.join('?' * len(names))), names)

    result = cursor.fetchall()

    if not result:
        raise ValueError(DbError.TOPIC_NOT_FOUND_ERROR.value)

    return result

def get_topic_id_by_name(db, name: str) -> int:
    """
    Get the topic ID by name.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        name (str): Topic name.

    Returns:
        int: Topic ID.
    """

    cursor = db.cursor()
    cursor.execute("SELECT id FROM topics WHERE name = ?", (name,))

    result = cursor.fetchone()

    if not result:
        raise ValueError(DbError.TOPIC_NOT_FOUND_ERROR.value)

    return result["id"]

def create_quest(db, title: str, description: str, topic_names: list[str], user_id: int, longitude: float, latitude: float, deadline: str) -> dict:
    """
    Create a new quest in the database.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        title (str): Quest title.
        description (str): Quest description.
        topic_names (list[str]): Topic names.
        user_id (int): User ID.
        longitude (float): Quest longitude.
        latitude (float): Quest latitude.
        deadline (str): Quest deadline.

    Returns:
        dict: Newly created quest data.
    """

    cursor = db.cursor()

    if not get_user_by_id(db, user_id):
        raise ValueError(DbError.USER_NOT_FOUND_ERROR.value)

    if not topic_names:
        raise ValueError(DbError.TOPIC_NOT_FOUND_ERROR.value)

    topic_ids = [get_topic_id_by_name(db, name) for name in topic_names]

    cursor.execute('''
    INSERT INTO quests (title, description, topic_id, user_id, longitude, latitude, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (title, description, topic_ids[0], user_id, longitude, latitude, deadline))

    db.commit()

    cursor.execute('''
                   SELECT * FROM quests WHERE id = (SELECT MAX(id) FROM quests)
                   ''')

    return cursor.fetchone()

def get_all_quests_by_topics(db, topic_ids: list[int]) -> list:
    """
    Get all quests by topics.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        topic_ids (list[int]): List of Topic IDs.

    Returns:
        list: List of quests.
    """

    cursor = db.cursor()

    if not topic_ids:
        raise ValueError(DbError.TOPIC_NOT_FOUND_ERROR.value)

    cursor.execute('''
    SELECT * FROM quests WHERE topic_id IN ({})
    '''.format(','.join('?' * len(topic_ids))), topic_ids)

    return cursor.fetchall()

def get_all_quests(db) -> list:
    """
    Get all quests from the database.

    Args:
        db (sqlite3.Connection): SQLite database connection.

    Returns:
        list: List of quests.
    """

    cursor = db.cursor()
    cursor.execute("SELECT * FROM quests")
    return cursor.fetchall()

def get_all_quests_by_price_range(db, min_price: int, max_price: int) -> list:
    """
    Get all quests by price range.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        min_price (int): Minimum price.
        max_price (int): Maximum price.

    Returns:
        list: List of quests.
    """

    cursor = db.cursor()
    cursor.execute("SELECT * FROM quests WHERE price BETWEEN ? AND ?", (min_price, max_price))
    return cursor.fetchall()


def get_quest_by_id(db, id: int) -> dict:
    """
    Get a quest by id.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        id (int): Quest ID.

    Returns:
        dict: Quest data or None if not found.
    """

    cursor = db.cursor()
    cursor.execute("SELECT * FROM quests WHERE id = ?", (id,))
    return cursor.fetchone()

def get_quests_by_user_id(db, user_id: int) -> list:
    """
    Get all quests by user id.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        user_id (int): User ID.

    Returns:
        list: List of quests.
    """

    if not get_user_by_id(db, user_id):
        raise ValueError(DbError.USER_NOT_FOUND_ERROR.value)

    cursor = db.cursor()
    cursor.execute("SELECT * FROM quests WHERE user_id = ?", (user_id,))
    return cursor.fetchall()

def set_quest_status(db, quest_id: int, status: Literal["open", "closed"]):
    """
    Set the status of a quest.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        quest_id (int): Quest ID.
        status (str): Status of the quest (open, closed).
    """

    if status not in ["open", "closed"]:
        raise ValueError(DbError.INVALID_QUEST_STATUS_ERROR.value)

    cursor = db.cursor()
    cursor.execute("UPDATE quests SET status = ? WHERE id = ?", (status, quest_id))
    cursor.execute("UPDATE quests SET completed_at = CURRENT_TIMESTAMP WHERE id = ?", (quest_id,))
    cursor.execute("DELETE FROM quest_candidates WHERE quest_id = ?", (quest_id,))
    db.commit()

def get_quest_candidates(db, quest_id: int) -> list:
    """
    Get all candidates for a quest.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        quest_id (int): Quest ID.

    Returns:
        list: List of candidates.
    """

    cursor = db.cursor()
    cursor.execute("SELECT * FROM quest_candidates WHERE quest_id = ?", (quest_id,))
    return cursor.fetchall()

def add_quest_candidate(db, quest_id: int, user_id: int) -> dict:
    """
    Add a candidate to a quest.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        quest_id (int): Quest ID.
        user_id (int): User ID.

    Returns:
        dict: Quest data.
    """

    quest = get_quest_by_id(db, quest_id)
    if not quest:
        raise ValueError(DbError.QUEST_NOT_FOUND_ERROR.value)

    if quest["user_id"] == user_id:
        raise ValueError(DbError.USER_IS_CREATOR_ERROR.value)

    if not get_user_by_id(db, user_id):
        raise ValueError(DbError.USER_NOT_FOUND_ERROR.value)

    cursor = db.cursor()
    cursor.execute("SELECT * FROM quest_candidates WHERE quest_id = ? AND user_id = ?", (quest_id, user_id))
    if cursor.fetchone():
        raise ValueError(DbError.USER_ALREADY_APPLIED_ERROR.value)

    cursor.execute("INSERT INTO quest_candidates (quest_id, user_id) VALUES (?, ?)", (quest_id, user_id))
    db.commit()

    return get_quest_by_id(db, quest_id)


def get_user_applied_quests(db, user_id: int) -> list:
    """
    Get all quests that a user has applied for.

    Args:
        db (sqlite3.Connection): SQLite database connection.
        user_id (int): User ID.

    Returns:
        list: List of quests.
    """

    if not get_user_by_id(db, user_id):
        raise ValueError(DbError.USER_NOT_FOUND_ERROR.value)

    cursor = db.cursor()
    cursor.execute("SELECT * FROM quest_candidates WHERE user_id = ?", (user_id,))
    return cursor.fetchall()
