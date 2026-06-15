import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Text
from datetime import datetime
from typing import List
import backend.config as config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Database")

# Setup DB engine dynamically
engine = None
SessionLocal = None

class Base(DeclarativeBase):
    pass

# User Model
class UserModel(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(20), default="tourist")  # tourist, admin
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

# Place Model (Flight, Stay, Package, Car Rental)
class PlaceModel(Base):
    __tablename__ = "places"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    location: Mapped[str] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    price: Mapped[float] = mapped_column(Float)
    type: Mapped[str] = mapped_column(String(20))  # flight, stay, package, car
    image: Mapped[str] = mapped_column(String(500), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=10)
    details: Mapped[str] = mapped_column(Text, nullable=True)  # JSON or text details

# Booking Model
class BookingModel(Base):
    __tablename__ = "bookings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    place_id: Mapped[int] = mapped_column(Integer, ForeignKey("places.id"))
    booking_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    travel_date: Mapped[str] = mapped_column(String(50))
    return_date: Mapped[str] = mapped_column(String(50), nullable=True)
    price: Mapped[float] = mapped_column(Float)
    guests: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(20), default="Pending")  # Pending, Paid, Cancelled

async def init_db():
    global engine, SessionLocal
    # Try connecting to PostgreSQL
    try:
        logger.info("Attempting to connect to PostgreSQL...")
        test_engine = create_async_engine(config.DATABASE_URL, echo=False)
        # Quick test connection
        async with test_engine.connect() as conn:
            await conn.execute(Base.metadata.tables[list(Base.metadata.tables.keys())[0]].select().limit(1))
        engine = test_engine
        config.USE_SQLITE = False
        logger.info("Successfully connected to PostgreSQL database.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite.")
        engine = create_async_engine(
            config.SQLITE_URL,
            connect_args={"check_same_thread": False},
            echo=False
        )
        config.USE_SQLITE = True
        logger.info(f"SQLite database initialized at {config.SQLITE_URL}")

    SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created.")

async def get_db():
    if SessionLocal is None:
        await init_db()
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
