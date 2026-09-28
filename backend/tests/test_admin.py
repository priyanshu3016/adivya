import pytest

pytestmark = pytest.mark.asyncio

APP1_ID = "00000000-0000-0000-0005-000000000001"
APP2_ID = "00000000-0000-0000-0005-000000000002"
APP5_ID = "00000000-0000-0000-0005-000000000005"


async def test_admin_list_applications(client, admin_headers):
    """Verify administrator can retrieve all submitted applications."""
    response = await client.get("/api/v1/admin/applications", headers=admin_headers)
    assert response.status_code == 200
    apps = response.json()
    assert len(apps) >= 5


async def test_non_admin_forbidden(client, auth_headers):
    """Verify regular applicant accounts cannot access admin endpoints."""
    response = await client.get("/api/v1/admin/applications", headers=auth_headers)
    assert response.status_code == 403


async def test_admin_review_approve(client, admin_headers):
    """Verify admin review decision 'approve' updates application status to approved."""
    response = await client.post(
        f"/api/v1/admin/applications/{APP1_ID}/review",
        json={"decision": "approve", "comments": "Eligible ST candidate"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["decision"] == "approve"

    # Verify status changed
    detail = await client.get(f"/api/v1/admin/applications/{APP1_ID}", headers=admin_headers)
    assert detail.json()["status"] == "approved"


async def test_admin_review_reject(client, admin_headers):
    """Verify admin review decision 'reject' updates application status to rejected."""
    response = await client.post(
        f"/api/v1/admin/applications/{APP5_ID}/review",
        json={"decision": "reject", "comments": "Non-ST category"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["decision"] == "reject"

    detail = await client.get(f"/api/v1/admin/applications/{APP5_ID}", headers=admin_headers)
    assert detail.json()["status"] == "rejected"


async def test_trigger_verification(client, admin_headers):
    """Verify administrator can trigger automated verification pipeline."""
    response = await client.post(f"/api/v1/applications/{APP1_ID}/verify", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("verified", "deficient", "approved")
    assert data["total_checks"] > 0
