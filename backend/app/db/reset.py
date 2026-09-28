"""Database Reset and Re-seeding Utility for TribalScholar AI.

Usage:
    python -m app.db.reset

DANGER: This script will drop all existing tables and re-populate fresh demo data.
"""

import sys
import os

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.db.session import sync_engine, SyncSessionLocal
from app.db.models import Base
from app.db.seed import seed_database


def reset_database():
    """Drops all tables, recreates schema, and seeds standard demo scenarios."""
    print("WARNING: Resetting TribalScholar AI database...")
    
    # Drop all tables in dependency order
    Base.metadata.drop_all(bind=sync_engine)
    print("✓ Dropped all existing tables.")

    # Recreate all tables
    Base.metadata.create_all(bind=sync_engine)
    print("✓ Recreated all 12 database tables.")

    # Re-seed demo data
    with SyncSessionLocal() as session:
        seed_database(session)
    print("✓ Successfully completed clean database reset & demo seed.")


if __name__ == "__main__":
    reset_database()
