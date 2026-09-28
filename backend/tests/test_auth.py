import pytest

pytestmark = pytest.mark.asyncio


async def test_login_success(client):
    """Verify that valid credentials return a JWT access token."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@tribalscholar.demo", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@tribalscholar.demo"
    assert data["user"]["role"] == "admin"


async def test_login_invalid_password(client):
    """Verify that incorrect passwords return HTTP 401."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@tribalscholar.demo", "password": "incorrect_password"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


async def test_login_nonexistent_user(client):
    """Verify that an unknown email returns HTTP 401."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "unknown@domain.com", "password": "anypassword"},
    )
    assert response.status_code == 401


async def test_get_me_authenticated(client, auth_headers):
    """Verify that authenticated requests retrieve current user profile."""
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "sunita.soren@tribalscholar.demo"
    assert data["full_name"] == "Sunita Soren"


async def test_get_me_unauthenticated(client):
    """Verify that requests missing a bearer token are rejected with 401."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
