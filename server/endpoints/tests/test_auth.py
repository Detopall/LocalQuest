import pytest
from fastapi.testclient import TestClient
from endpoints.auth import router
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)

client = TestClient(app)

@pytest.fixture(scope="function")
def test_client():
    """Returns a test client for FastAPI."""
    return client

def test_auth_missing_fields(test_client):
    response = test_client.post("/")
    assert response.status_code == 422
    assert "detail" in response.json()
    assert response.json()["detail"][0]["msg"] == "Field required"

def test_auth_user_creation(test_client):
    response = test_client.post("/", json={"username": "testuser", "password": "securepass", "email": "test@example.com"})
    assert response.status_code == 200
    assert response.json()["message"] == "Authentication successful"
