import pytest
from db.database import get_mem_db_connection, create_tables

@pytest.fixture(scope="function", autouse=True)
def clear_db(db):
    cursor = db.cursor()
    tables = ['users', 'cookies', 'topics', 'quests', 'quest_candidates']
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
    db.commit()

@pytest.fixture(scope="session")
def db():
    db = get_mem_db_connection()
    create_tables("test")
    yield db
    db.close()
