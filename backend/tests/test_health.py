import pytest

pytestmark = pytest.mark.asyncio


async def test_health_endpoint(client):
    """Verify that root /health returns 200 with healthy status."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "0.1.0"
    assert data["project"] == "TribalScholar AI"


async def test_api_v1_health_endpoint(client):
    """Verify that /api/v1/health alias returns 200 with matching payload."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


async def test_docs_endpoints(client):
    """Verify OpenAPI and Swagger UI documentation endpoints are accessible."""
    response = await client.get("/docs")
    assert response.status_code == 200
