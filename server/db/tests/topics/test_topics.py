import pytest
from db.crud import get_topics, get_topic_by_names, DbError

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

def test_get_topic_by_names_invalid(db):
    try:
        get_topic_by_names(db, ["Topic 99"])
        pytest.fail("Expected DbError.TOPIC_NOT_FOUND_ERROR")
    except ValueError as e:
        assert e.args[0] == DbError.TOPIC_NOT_FOUND_ERROR.value
