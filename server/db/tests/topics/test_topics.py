import pytest
from db.crud import get_topics, get_topic_by_names, get_topic_id_by_name, get_topic_by_names, DbError

def create_test_topics(db):
	topics = ["Tech", "Science", "Art"]
	cursor = db.cursor()

	for topic in topics:
		cursor.execute('SELECT * FROM topics WHERE name = ?', (topic,))
		if cursor.fetchone() is None:
			cursor.execute('INSERT INTO topics (name) VALUES (?)', (topic,))

	db.commit()

def test_get_topics(db):
    cursor = db.cursor()
    cursor.execute("INSERT INTO topics (name) VALUES ('Topic 1')")
    db.commit()
    topics = get_topics(db)
    assert len(topics) == 1
    assert topics[0]["name"] == "Topic 1"

def test_get_topic_by_names(db):
    cursor = db.cursor()
    cursor.execute("INSERT INTO topics (name) VALUES ('Topic 1'), ('Topic 2')")
    db.commit()
    topics = get_topic_by_names(db, ["Topic 1", "Topic 2"])
    assert len(topics) == 2


def test_get_topics_id_by_name(db):
	create_test_topics(db)
	topic_id_tech = get_topic_id_by_name(db, "Tech")
	print(f"Retrieved ID for 'Tech': {topic_id_tech}")
	assert topic_id_tech is not None, "Failed to retrieve ID for 'Tech'"

	topic_id_science = get_topic_id_by_name(db, "Science")
	print(f"Retrieved ID for 'Science': {topic_id_science}")
	assert topic_id_science is not None, "Failed to retrieve ID for 'Science'"


def test_get_topic_by_names_invalid(db):
    try:
        get_topic_by_names(db, ["Topic 99"])
        pytest.fail("Expected DbError.TOPIC_NOT_FOUND_ERROR")
    except ValueError as e:
        assert e.args[0] == DbError.TOPIC_NOT_FOUND_ERROR.value
