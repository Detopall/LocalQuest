import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from endpoints.api.topics import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

@pytest.fixture(scope="function")
def test_client():
    """Returns a test client for FastAPI."""
    return client


@pytest.fixture(scope="function")
def test_client():
	"""Test client with a clean database for each test."""
	return client

def test_get_topics(test_client):
	"""Test that the /topics endpoint returns a list of topics."""
	response = test_client.get("/topics")
	assert response.status_code == 200
	assert response.json()["message"] == "Topics"
	assert len(response.json()["data"]) > 0
