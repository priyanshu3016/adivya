import os
import sys
import uuid
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Ensure backend directory is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.db.models import Base
from app.db.session import get_db
from app.db.seed import seed_database
from app.core.security import create_access_token

TEST_DB_FILE = os.path.join(backend_dir, "test_api.db")
TEST_ASYNC_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"
TEST_SYNC_URL = f"sqlite:///{TEST_DB_FILE}"


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create and seed a test SQLite database before running API tests, and tear down afterwards."""
    # Remove any existing test db
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

    sync_engine = create_engine(TEST_SYNC_URL, echo=False)
    Base.metadata.create_all(bind=sync_engine)

    with Session(sync_engine) as session:
        seed_database(session)
        session.commit()

    sync_engine.dispose()

    yield

    # Cleanup after test session
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass


@pytest_asyncio.fixture(loop_scope="function")
async def async_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide an isolated AsyncSession connected to the test database."""
    async_engine = create_async_engine(TEST_ASYNC_URL, echo=False)
    async_session = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
    await async_engine.dispose()


@pytest_asyncio.fixture(loop_scope="function")
async def client(async_db) -> AsyncGenerator[AsyncClient, None]:
    """HTTP client configured with dependency override for get_db."""
    async def override_get_db():
        yield async_db

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token() -> str:
    """Pre-computed JWT access token for demo admin user."""
    return create_access_token(
        data={
            "sub": "admin@tribalscholar.demo",
            "role": "admin",
            "id": "a0000000-0000-0000-0000-000000000001",
        }
    )


@pytest.fixture
def auth_token() -> str:
    """Pre-computed JWT access token for Scenario 1 applicant (Sunita Soren)."""
    return create_access_token(
        data={
            "sub": "sunita.soren@tribalscholar.demo",
            "role": "applicant",
            "id": "00000000-0000-0000-0003-000000000001",
        }
    )


@pytest.fixture
def admin_headers(admin_token) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def auth_headers(auth_token) -> dict:
    return {"Authorization": f"Bearer {auth_token}"}
