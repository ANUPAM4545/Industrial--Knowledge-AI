#!/usr/bin/env python3
"""
NEXO — Database Seed Script
Creates initial admin user and sample data.
"""
import asyncio
import sys
import os

# Add parent directory to path for app imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def seed():
    """Run seed data creation."""
    print("╔═══════════════════════════════════╗")
    print("║   NEXO — Seeding DB       ║")
    print("╚═══════════════════════════════════╝")
    print()

    # TODO: Implement seed logic once auth service is built
    # from app.db.session import AsyncSessionLocal
    # from app.core.security import hash_password
    # from app.models.user import User, UserRole, UserStatus

    # async with AsyncSessionLocal() as session:
    #     admin = User(
    #         email="admin@nexo.ai",
    #         username="admin",
    #         full_name="Platform Admin",
    #         hashed_password=hash_password("Admin@1234"),
    #         role=UserRole.ADMIN,
    #         status=UserStatus.ACTIVE,
    #         is_verified=True,
    #     )
    #     session.add(admin)
    #     await session.commit()
    #     print(f"  ✓ Admin user created: admin@nexo.ai")

    print("  ⚠  Seed logic not yet implemented.")
    print("  ✓  Run after implementing the auth service.")
    print()


if __name__ == "__main__":
    asyncio.run(seed())
