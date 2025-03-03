import pytest
from db.database import get_mem_db_connection, create_tables

@pytest.fixture(scope="session")
def db():
    """Set up an in-memory database for testing."""
    db = get_mem_db_connection()
    create_tables("test")
    yield db
    db.close()

@pytest.fixture(scope="function", autouse=True)
def clear_db(db):
    """Clear all tables before each test function."""
    cursor = db.cursor()
    tables = ['users', 'cookies', 'topics', 'quests', 'quest_candidates']
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
    db.commit()
