import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select
import logging

import backend.config as config
from backend.database import Base, PlaceModel, UserModel, init_db
from backend.services.auth import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseSeeder")

mock_places = [
    # Recommended Stays (ที่พักแนะนำ)
    {
        "name": "Santorini Cliffside Cave House",
        "location": "Oia, Santorini",
        "country": "Greece",
        "description": "Experience breathtaking sunset views from a luxurious white cave dwelling perched high on the cliffs of Santorini.",
        "rating": 4.8,
        "price": 39900.0,
        "type": "stay",
        "image": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
        "capacity": 5,
        "details": "Includes private infinity pool, caldera views, daily Greek breakfast, and airport shuttle service."
    },
    {
        "name": "Kyoto Sakura Zen Temple Lodge",
        "location": "Kyoto",
        "country": "Japan",
        "description": "Stay in a beautifully preserved historic temple lodge surrounded by cherry blossom gardens and quiet zen paths.",
        "rating": 4.9,
        "price": 28900.0,
        "type": "stay",
        "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        "capacity": 8,
        "details": "Authentic tatami rooms, green tea ceremony workshop, traditional multi-course Kaiseki dinner, and garden meditation classes."
    },
    {
        "name": "Swiss Alps Panoramic Glass Igloo",
        "location": "Zermatt, Valais",
        "country": "Switzerland",
        "description": "Sleep under the starry alpine sky with a perfect panoramic view of the majestic Matterhorn peak.",
        "rating": 4.9,
        "price": 49900.0,
        "type": "stay",
        "image": "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
        "capacity": 4,
        "details": "Heated floors, telescope for stargazing, outdoor hot tub, ski-in/ski-out access, and wine cellar privileges."
    },
    
    # Popular Packages (แพ็กเกจยอดนิยม)
    {
        "name": "Iceland Northern Lights Quest",
        "location": "Reykjavik & Golden Circle",
        "country": "Iceland",
        "description": "Chasing the Aurora Borealis through glaciers, black sand beaches, volcanic geysers, and cozy thermal baths.",
        "rating": 4.8,
        "price": 89900.0,
        "type": "package",
        "image": "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=800&q=80",
        "capacity": 10,
        "details": "5 Days 4 Nights. Package includes flights from Bangkok, premium 4x4 guided transport, ice cave tours, and Blue Lagoon entries."
    },
    {
        "name": "Maldives Paradise Escape",
        "location": "Male Atoll",
        "country": "Maldives",
        "description": "Spend a week in an overwater villa floating above pristine coral reefs and turquoise waters.",
        "rating": 4.9,
        "price": 32900.0,
        "type": "package",
        "image": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
        "capacity": 12,
        "details": "4 Days 3 Nights. Package includes flights, all-inclusive luxury resort meals, sunset dolphin cruises, and diving gear rent."
    },
    {
        "name": "New York City Lights & Broadway",
        "location": "Manhattan, New York",
        "country": "United States",
        "description": "Explore the vibrant streets of NYC from Times Square to Central Park, completed with premium Broadway show tickets.",
        "rating": 4.7,
        "price": 49900.0,
        "type": "package",
        "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
        "capacity": 15,
        "details": "6 Days 5 Nights. Package includes hotel in Midtown Manhattan, guided city tour, helicopter skyline ride, and 2 Broadway tickets."
    },

    # Flights (เที่ยวบิน)
    {
        "name": "Bangkok (BKK) to Cappadocia (ASR)",
        "location": "Nevsehir, Cappadocia",
        "country": "Turkey",
        "description": "Fly to the ancient city of hot air balloons, underground caves, and beautiful stone formations.",
        "rating": 4.9,
        "price": 24500.0,
        "type": "flight",
        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        "capacity": 50,
        "details": "Round-trip economy flight with Turkish Airlines, 30kg baggage allowance, and in-flight gourmet meals."
    },
    {
        "name": "Bangkok (BKK) to Tokyo (NRT)",
        "location": "Tokyo",
        "country": "Japan",
        "description": "Premium direct flight to the heart of futuristic architecture, delicious sushi, and cultural shrines.",
        "rating": 4.8,
        "price": 18900.0,
        "type": "flight",
        "image": "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80",
        "capacity": 80,
        "details": "Round-trip direct flight with Japan Airlines, 2x 23kg baggage, and in-flight Wi-Fi access."
    },
    
    # Car Rentals (รถเช่า)
    {
        "name": "Tesla Model Y AWD Auto",
        "location": "Zurich Airport",
        "country": "Switzerland",
        "description": "Cruising through beautiful alpine routes in a fully electric, premium autopilot-equipped SUV.",
        "rating": 4.9,
        "price": 3500.0,
        "type": "car",
        "image": "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
        "capacity": 5,
        "details": "Per day rental, unlimited supercharging, GPS navigation, winter tires, and comprehensive collision protection."
    },
    {
        "name": "Ford Mustang GT Convertible",
        "location": "Los Angeles Airport (LAX)",
        "country": "United States",
        "description": "Feel the ocean breeze driving along the Pacific Coast Highway in a powerful V8 muscle car convertible.",
        "rating": 4.8,
        "price": 4500.0,
        "type": "car",
        "image": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
        "capacity": 3,
        "details": "Per day rental, leather seats, premium sound system, roadside assistance, and airport pick-up/drop-off."
    }
]

async def seed_data():
    await init_db()
    from backend.database import SessionLocal
    
    async with SessionLocal() as db:
        # 1. Seed Default User if not exists
        logger.info("Checking for default user...")
        user_check = await db.execute(select(UserModel).where(UserModel.username == "lunar_traveler"))
        user = user_check.scalars().first()
        
        if not user:
            logger.info("Seeding default user 'lunar_traveler'...")
            default_user = UserModel(
                username="lunar_traveler",
                email="traveler@lunarjourney.com",
                hashed_password=get_password_hash("password123"),
                role="tourist"
            )
            db.add(default_user)
            await db.commit()
            logger.info("Default user seeded.")
        else:
            logger.info("Default user already exists.")
            
        # 2. Seed Places if not exists
        logger.info("Checking for places...")
        places_check = await db.execute(select(PlaceModel).limit(1))
        place_exists = places_check.scalars().first()
        
        if not place_exists:
            logger.info("Seeding mock places catalog...")
            for p in mock_places:
                db_place = PlaceModel(**p)
                db.add(db_place)
            await db.commit()
            logger.info(f"Successfully seeded {len(mock_places)} places.")
        else:
            logger.info("Places catalog already populated.")

if __name__ == "__main__":
    asyncio.run(seed_data())
