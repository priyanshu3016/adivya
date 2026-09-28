import pytest

pytestmark = pytest.mark.asyncio

SCHEME_ID = "00000000-0000-0000-0001-000000000001"


async def test_list_schemes(client):
    """Verify schemes listing returns seeded active scholarship."""
    response = await client.get("/api/v1/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 1
    assert schemes[0]["name"] == "Post-Matric Scholarship for ST Students"


async def test_get_scheme_detail(client):
    """Verify scheme detail includes active evaluation rules."""
    response = await client.get(f"/api/v1/schemes/{SCHEME_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Post-Matric Scholarship for ST Students"
    assert len(data["rules"]) == 3


async def test_get_applicant_profile(client, auth_headers):
    """Verify logged-in applicant can retrieve their profile."""
    response = await client.get("/api/v1/applicant/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Sunita Soren"
    assert data["category"] == "ST"


async def test_create_and_submit_application(client, auth_headers):
    """Verify complete application creation, detail retrieval, and submission workflow."""
    # 1. Create draft
    create_res = await client.post(
        "/api/v1/applications",
        json={"scheme_id": SCHEME_ID, "academic_year": "2026-2027"},
        headers=auth_headers,
    )
    assert create_res.status_code == 201
    app_data = create_res.json()
    app_id = app_data["id"]
    assert app_data["status"] == "draft"

    # 2. Retrieve detail
    detail_res = await client.get(f"/api/v1/applications/{app_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == app_id
    assert detail_res.json()["status"] == "draft"

    # 3. Submit application
    submit_res = await client.post(f"/api/v1/applications/{app_id}/submit", headers=auth_headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "submitted"

    # 4. Attempt to submit already submitted application
    resubmit_res = await client.post(f"/api/v1/applications/{app_id}/submit", headers=auth_headers)
    assert resubmit_res.status_code == 400
