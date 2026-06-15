from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
import logging
from datetime import datetime
from backend.database import BookingModel, PlaceModel, UserModel
from backend.services.notification import send_notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BookingService")

async def create_booking(
    db: AsyncSession,
    user: UserModel,
    place_id: int,
    travel_date: str,
    return_date: str = None,
    guests: int = 1
):
    # 1. Fetch the Place
    result = await db.execute(select(PlaceModel).where(PlaceModel.id == place_id))
    place = result.scalars().first()
    if not place:
        return {"success": False, "error": "Place not found"}
        
    # 2. Check Capacity / Slots
    # Count how many guests already booked this place on this date
    # In a simplified version, we check active bookings matching the place ID and travel date
    stmt = select(BookingModel).where(
        and_(
            BookingModel.place_id == place_id,
            BookingModel.travel_date == travel_date,
            BookingModel.status != "Cancelled"
        )
    )
    booked_result = await db.execute(stmt)
    active_bookings = booked_result.scalars().all()
    total_booked_guests = sum(b.guests for b in active_bookings)
    
    if total_booked_guests + guests > place.capacity:
        logger.warning(f"Booking rejected: Capacity exceeded. Available: {place.capacity - total_booked_guests}, requested: {guests}")
        return {"success": False, "error": f"Sorry, only {place.capacity - total_booked_guests} seats/slots left for this date."}
        
    # 3. Create Booking
    # Calculate price: basic flight/package is price * guests. Stays could have duration, but we keep it simple or calculate in detail
    total_price = place.price * guests
    
    new_booking = BookingModel(
        user_id=user.id,
        place_id=place_id,
        travel_date=travel_date,
        return_date=return_date,
        price=total_price,
        guests=guests,
        status="Pending"
    )
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    
    logger.info(f"Booking #{new_booking.id} created in 'Pending' state.")
    
    # 4. Trigger Notification
    notif_msg = f"Your booking #{new_booking.id} for '{place.name}' on {travel_date} has been created. Total: {total_price:,.2f} THB. Please complete your payment."
    await send_notification(
        user_email=user.email,
        username=user.username,
        title="Booking Created",
        message=notif_msg,
        channels=["email", "sms"] # email and SMS for pending
    )
    
    return {
        "success": True,
        "booking": {
            "id": new_booking.id,
            "place_name": place.name,
            "location": place.location,
            "country": place.country,
            "type": place.type,
            "image": place.image,
            "travel_date": new_booking.travel_date,
            "return_date": new_booking.return_date,
            "guests": new_booking.guests,
            "price": new_booking.price,
            "status": new_booking.status,
            "booking_date": new_booking.booking_date.isoformat()
        }
    }

async def confirm_booking_payment(db: AsyncSession, booking_id: int, user: UserModel):
    result = await db.execute(select(BookingModel).where(BookingModel.id == booking_id))
    booking = result.scalars().first()
    if not booking:
        return {"success": False, "error": "Booking not found"}
        
    if booking.user_id != user.id and user.role != "admin":
        return {"success": False, "error": "Unauthorized"}
        
    if booking.status == "Paid":
        return {"success": True, "message": "Booking already paid"}
        
    booking.status = "Paid"
    await db.commit()
    
    # Fetch place name for notification
    place_result = await db.execute(select(PlaceModel).where(PlaceModel.id == booking.place_id))
    place = place_result.scalars().first()
    place_name = place.name if place else "your destination"
    
    logger.info(f"Booking #{booking.id} status updated to 'Paid'.")
    
    # Trigger payment success notifications on all channels (Email, SMS, LINE)
    notif_msg = f"Booking Confirmed! Payment of {booking.price:,.2f} THB received for '{place_name}' (Travel Date: {booking.travel_date}). Safe travels!"
    await send_notification(
        user_email=user.email,
        username=user.username,
        title="Payment Successful & Booking Confirmed",
        message=notif_msg,
        channels=["email", "sms", "line"] # LINE is triggered on confirm/payment!
    )
    
    return {"success": True, "status": "Paid"}

async def get_user_bookings(db: AsyncSession, user_id: int):
    # Retrieve user's bookings joined with place information
    stmt = select(BookingModel, PlaceModel).join(PlaceModel, BookingModel.place_id == PlaceModel.id).where(BookingModel.user_id == user_id).order_by(BookingModel.booking_date.desc())
    result = await db.execute(stmt)
    
    bookings_list = []
    for booking, place in result.all():
        bookings_list.append({
            "id": booking.id,
            "place_id": place.id,
            "place_name": place.name,
            "location": place.location,
            "country": place.country,
            "type": place.type,
            "image": place.image,
            "travel_date": booking.travel_date,
            "return_date": booking.return_date,
            "guests": booking.guests,
            "price": booking.price,
            "status": booking.status,
            "booking_date": booking.booking_date.isoformat()
        })
    return bookings_list
