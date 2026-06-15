import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/travel_db")
# Fallback database settings
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite+aiosqlite:///./travel.db")
USE_SQLITE = True  # We will test connection to Postgres and toggle this

# Redis Config
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
USE_IN_MEMORY_CACHE = True  # We will test connection to Redis and toggle this

# Security
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-lunar-journey-key-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
