"""
Clerk Authentication Service
"""
import os
import httpx
import jwt
import structlog
from fastapi import Request
from clerk_backend_api import Clerk

logger = structlog.get_logger(__name__)

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "sk_test_placeholder")
CLERK_PUBLISHABLE_KEY = os.getenv("VITE_CLERK_PUBLISHABLE_KEY", "pk_test_placeholder")

clerk_client = Clerk(bearer_auth=CLERK_SECRET_KEY)

# Cache JWKS
_jwks_client = jwt.PyJWKClient(
    "https://api.clerk.com/v1/jwks",
    headers={
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "User-Agent": "NEXO-Backend/1.0"
    }
)

def verify_clerk_token(token: str) -> str:
    """Verifies the Clerk JWT token and returns the clerk_user_id (sub)."""
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk audience is usually the frontend URL
        )
        return data["sub"]
    except Exception as e:
        logger.error("failed_to_verify_clerk_token", error=str(e))
        raise ValueError("Invalid authentication token")

async def fetch_clerk_user_info(clerk_user_id: str):
    """Fetch user details from Clerk."""
    try:
        # The clerk-backend-api Python SDK has strict Pydantic validation that crashes
        # if the Clerk API returns null for certain OAuth fields (like attempts or expire_at).
        # We use a direct HTTP request to bypass this parsing bug.
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"https://api.clerk.com/v1/users/{clerk_user_id}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
            )
            response.raise_for_status()
            user_data = response.json()
            
            email = ""
            if user_data.get("email_addresses"):
                email = user_data["email_addresses"][0].get("email_address", "")
                
            first_name = user_data.get("first_name") or ""
            last_name = user_data.get("last_name") or ""
            full_name = f"{first_name} {last_name}".strip()
            
            return {
                "email": email,
                "full_name": full_name or email
            }
    except Exception as e:
        logger.error("failed_to_fetch_clerk_user", error=str(e), clerk_user_id=clerk_user_id)
        return {
            "email": f"{clerk_user_id}@placeholder.com",
            "full_name": "Unknown User"
        }
