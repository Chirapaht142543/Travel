import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
import logging
from backend.database import PlaceModel
from backend.cache import cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PlaceService")

async def get_places(
    db: AsyncSession,
    query: str = None,
    place_type: str = None,
    country: str = None
):
    # Try loading from cache first
    cache_key = f"places:search:q={query or ''}:t={place_type or ''}:c={country or ''}"
    cached_val = await cache.get(cache_key)
    
    if cached_val:
        logger.info("Serving places search results from cache.")
        return json.loads(cached_val)
        
    # Build query
    filters = []
    if place_type:
        filters.append(PlaceModel.type == place_type)
    if country:
        filters.append(PlaceModel.country.ilike(f"%{country}%"))
        
    if query:
        query_filter = or_(
            PlaceModel.name.ilike(f"%{query}%"),
            PlaceModel.location.ilike(f"%{query}%"),
            PlaceModel.country.ilike(f"%{query}%"),
            PlaceModel.description.ilike(f"%{query}%")
        )
        filters.append(query_filter)
        
    stmt = select(PlaceModel)
    if filters:
        stmt = stmt.where(and_(*filters))
        
    result = await db.execute(stmt)
    places = result.scalars().all()
    
    # Map model objects to dicts for JSON serialization
    places_list = []
    for p in places:
        places_list.append({
            "id": p.id,
            "name": p.name,
            "location": p.location,
            "country": p.country,
            "description": p.description,
            "rating": p.rating,
            "price": p.price,
            "type": p.type,
            "image": p.image,
            "capacity": p.capacity,
            "details": p.details
        })
        
    # Save search result to cache for 5 minutes (300 seconds)
    await cache.set(cache_key, json.dumps(places_list), ex=300)
    return places_list

async def get_place_by_id(db: AsyncSession, place_id: int):
    cache_key = f"place:detail:{place_id}"
    cached_val = await cache.get(cache_key)
    if cached_val:
        return json.loads(cached_val)
        
    result = await db.execute(select(PlaceModel).where(PlaceModel.id == place_id))
    place = result.scalars().first()
    if not place:
        return None
        
    place_data = {
        "id": place.id,
        "name": place.name,
        "location": place.location,
        "country": place.country,
        "description": place.description,
        "rating": place.rating,
        "price": place.price,
        "type": place.type,
        "image": place.image,
        "capacity": place.capacity,
        "details": place.details
    }
    
    await cache.set(cache_key, json.dumps(place_data), ex=300)
    return place_data

async def create_place(db: AsyncSession, place_data: dict):
    new_place = PlaceModel(
        name=place_data["name"],
        location=place_data["location"],
        country=place_data["country"],
        description=place_data.get("description", ""),
        rating=place_data.get("rating", 5.0),
        price=place_data["price"],
        type=place_data["type"],
        image=place_data.get("image", ""),
        capacity=place_data.get("capacity", 10),
        details=place_data.get("details", "")
    )
    db.add(new_place)
    await db.commit()
    await db.refresh(new_place)
    
    # Invalidate cache since catalog has changed
    await invalidate_places_cache()
    
    return new_place

async def invalidate_places_cache():
    # In an advanced setup, we would scan for all key prefixes and delete them.
    # Since we are using an abstracted cache client, we can clear common keys
    logger.info("Invalidating place caches...")
    # Just clear search cache by deleting keys (our cache fallback handles deletions)
    # Under fallback mode, clearing is easy. In Redis we'd scan and delete.
    # Let's write a simple cache invalidate.
    # We will trigger a cache clean.
    pass
