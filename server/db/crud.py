from db.pwd_hashing import hash_password

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


def create_user(db, username: str, password: str, email: str):
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
    hashed_password = hash_password(password)
    cursor = db.cursor()

    cursor.execute('''
    INSERT INTO users (username, password, email) VALUES (?, ?, ?)
    ''', (username, hashed_password, email))

    db.commit()

    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    new_user = cursor.fetchone()

    return new_user
