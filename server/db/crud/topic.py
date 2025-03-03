from db.errors import DbError

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
