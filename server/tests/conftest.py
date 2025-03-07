import pytest
import mongomock
from fastapi.testclient import TestClient
from server import app
from db.database import get_db_connection

@pytest.fixture(scope="function")
def test_db():
    client = mongomock.MongoClient()
    db = client["test_db"]
    yield db
    db.quests.delete_many({})


@pytest.fixture(scope="function")
def client(test_db):
    app.dependency_overrides[get_db_connection] = lambda: test_db
    app.state.db = test_db
    return TestClient(app)
