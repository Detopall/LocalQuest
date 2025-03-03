from db.pwd_hashing import hash_password
from db.errors import DbError

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
