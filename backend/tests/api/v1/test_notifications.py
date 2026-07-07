import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

async def test_create_and_fetch_notifications(async_client: AsyncClient, normal_user_token_headers: dict):
    # Fetch notifications (should be empty initially for a new user in test DB)
    response = await async_client.get(
        "/api/v1/notifications", headers=normal_user_token_headers
    )
    assert response.status_code == 200
    # We can't guarantee 0 if other tests created some, but we can verify it's a valid list.
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)

    # For now, since we don't have a direct API to *create* notifications (only internal service),
    # we'll just test the mark-all-read endpoint to ensure the router works.
    response = await async_client.post(
        "/api/v1/notifications/read-all", headers=normal_user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["success"] == True
