from .topic import get_topic_id_by_name
from .user import get_user_by_id
from db.errors import DbError
from typing import Literal

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
