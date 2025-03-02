import pytest
from db.database import create_tables

def clear_database(db):
	cursor = db.cursor()
	tables = ['users', 'cookies', 'topics', 'quests', 'quest_candidates']
	for table in tables:
		cursor.execute(f"DELETE FROM {table}")
	db.commit()

@pytest.fixture(autouse=True)
def reset_db(db):
	clear_database(db)
	yield
	clear_database(db)

def test_create_tables(db):
	create_tables("test")

	cursor = db.cursor()
	cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
	tables = cursor.fetchall()
	assert tables == [('users',), ('cookies',), ('topics',), ('quests',), ('quest_candidates',)]
