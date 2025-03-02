import sqlite3
from typing import Literal

# Define the database file path
DATABASE_URL = "db/app.db"

def get_db_connection(db_type: Literal["production", "test"] = "production"):
    return get_prod_db_connection() if db_type == "production" else get_mem_db_connection()

def get_prod_db_connection():
    conn = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def get_mem_db_connection():
    conn = sqlite3.connect("file:memory:?cache=shared", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables(db_type: Literal["production", "test"] = "production"):
    db = get_db_connection(db_type)
    create_users_table(db)
    create_cookies_table(db)
    create_topics_table(db)
    create_quest_table(db)
    create_quest_candidates_table(db)

def create_users_table(db):
    cursor = db.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    db.commit()

def create_cookies_table(db):
    cursor = db.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cookies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        cookie TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    db.commit()

def create_topics_table(db):
    cursor = db.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
    ''')

    # Insert some default topics
    default_topics = ['Gardening', 'Tech', 'Finance', 'Babysitting', 'Cooking', 'Tutoring', 'Cleaning', 'Dog Walking', 'Pet Sitting', 'Other']
    cursor.executemany('INSERT OR IGNORE INTO topics (name) VALUES (?)', [(topic,) for topic in default_topics])

    db.commit()

def create_quest_table(db):
    cursor = db.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS quests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        topic_id INTEGER,
        user_id INTEGER,
        status TEXT CHECK(status IN ('open', 'closed')) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        deadline TIMESTAMP,
        latitude REAL,
        longitude REAL,
        FOREIGN KEY (topic_id) REFERENCES topics (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    db.commit()

def create_quest_candidates_table(db):
    cursor = db.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS quest_candidates (
        quest_id INTEGER,
        user_id INTEGER,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT CHECK(status IN ('applied', 'accepted', 'rejected')) DEFAULT 'applied',
        accepted_at TIMESTAMP,
        rejected_at TIMESTAMP,
        PRIMARY KEY (quest_id, user_id),
        FOREIGN KEY (quest_id) REFERENCES quests (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    db.commit()
