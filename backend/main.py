from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uvicorn
import logging
from datetime import timedelta

import backend.config as config
from backend.database import get_db, init_db, UserModel, PlaceModel
from backend.services.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user
)
import backend.services.place as place_service
import backend.services.booking as booking_service
import backend.services.payment as payment_service
import backend.services.notification as notification_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Main")

app = FastAPI(
    title="LUNAR JOURNEY API",
    description="Travel booking API with PostgreSQL, Redis Cache, and Mock Payment/Notification services",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing services on startup...")
    await init_db()

# STATUS / HEALTH CHECK
@app.get("/api/status")
async def get_status():
    return {
        "status": "healthy",
        "database": "SQLite (Fallback)" if config.USE_SQLITE else "PostgreSQL",
        "cache": "Local Memory (Fallback)" if config.USE_IN_MEMORY_CACHE else "Redis",
        "sqlite_enabled": config.USE_SQLITE,
        "redis_fallback_enabled": config.USE_IN_MEMORY_CACHE
    }

# AUTHENTICATION ENDPOINTS
@app.post("/api/auth/register")
async def register(user_data: dict, db: AsyncSession = Depends(get_db)):
    username = user_data.get("username")
    email = user_data.get("email")
    password = user_data.get("password")
    
    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="Missing required fields")
        
    # Check if username or email already exists
    result = await db.execute(select(UserModel).where(UserModel.username == username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")
        
    result = await db.execute(select(UserModel).where(UserModel.email == email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = UserModel(
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
        role="tourist"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Generate token
    access_token = create_access_token(data={"sub": new_user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.username == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: UserModel = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat()
    }

# PLACES CATALOG ENDPOINTS
@app.get("/api/places")
async def get_places_list(
    query: Optional[str] = None,
    type: Optional[str] = None,
    country: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await place_service.get_places(db, query=query, place_type=type, country=country)

@app.get("/api/places/{place_id}")
async def get_place_details(place_id: int, db: AsyncSession = Depends(get_db)):
    place = await place_service.get_place_by_id(db, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place

# BOOKING ENDPOINTS
@app.post("/api/bookings")
async def book_place(
    booking_data: dict,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    place_id = booking_data.get("place_id")
    travel_date = booking_data.get("travel_date")
    return_date = booking_data.get("return_date")
    guests = booking_data.get("guests", 1)
    
    if not place_id or not travel_date:
        raise HTTPException(status_code=400, detail="Missing required booking details")
        
    result = await booking_service.create_booking(
        db=db,
        user=current_user,
        place_id=place_id,
        travel_date=travel_date,
        return_date=return_date,
        guests=guests
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return result

@app.get("/api/bookings")
async def list_bookings(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await booking_service.get_user_bookings(db, user_id=current_user.id)

@app.post("/api/bookings/{booking_id}/pay")
async def pay_booking(
    booking_id: int,
    payment_data: dict,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve booking
    user_bookings = await booking_service.get_user_bookings(db, current_user.id)
    booking = next((b for b in user_bookings if b["id"] == booking_id), None)
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or unauthorized")
        
    card_number = payment_data.get("card_number", "")
    card_holder = payment_data.get("card_holder", "")
    cvc = payment_data.get("cvc", "")
    provider = payment_data.get("provider", "Stripe")
    
    # Process simulated payment
    pay_result = await payment_service.process_payment(
        booking_id=booking_id,
        amount=booking["price"],
        card_number=card_number,
        card_holder=card_holder,
        cvc=cvc,
        provider=provider
    )
    
    if not pay_result["success"]:
        raise HTTPException(status_code=400, detail=pay_result["error"])
        
    # Update booking status
    confirm_result = await booking_service.confirm_booking_payment(
        db=db,
        booking_id=booking_id,
        user=current_user
    )
    
    return {
        "payment": pay_result,
        "booking_status": confirm_result
    }

# NOTIFICATION LOGS ENDPOINT (FEED)
@app.get("/api/notifications")
async def list_notifications():
    return notification_service.get_notification_logs()

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
