import logging
import time
import json
import redis.asyncio as aioredis
import backend.config as config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Cache")

class InMemoryCache:
    def __init__(self):
        self._cache = {}
        logger.info("Initialized In-Memory local cache fallback.")

    def _clean_expired(self):
        now = time.time()
        expired = [k for k, v in self._cache.items() if v["expires_at"] < now]
        for k in expired:
            del self._cache[k]

    async def get(self, key: str):
        self._clean_expired()
        item = self._cache.get(key)
        if item:
            logger.info(f"Local Cache HIT for key: {key}")
            return item["value"]
        logger.info(f"Local Cache MISS for key: {key}")
        return None

    async def set(self, key: str, value: str, ex: int = 300):
        self._clean_expired()
        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + ex
        }
        logger.info(f"Local Cache SET key: {key} (Expires in {ex}s)")
        return True

    async def delete(self, key: str):
        if key in self._cache:
            del self._cache[key]
            logger.info(f"Local Cache DEL key: {key}")
            return True
        return False

# Dynamic Cache Manager
class CacheManager:
    def __init__(self):
        self.redis_client = None
        self.local_cache = None

    async def init_cache(self):
        try:
            logger.info("Attempting to connect to Redis...")
            # Create redis client and ping
            client = aioredis.from_url(config.REDIS_URL, decode_responses=True)
            await client.ping()
            self.redis_client = client
            config.USE_IN_MEMORY_CACHE = False
            logger.info("Successfully connected to Redis Cache server.")
        except Exception as e:
            logger.warning(f"Redis connection failed ({e}). Falling back to local in-memory cache.")
            self.local_cache = InMemoryCache()
            config.USE_IN_MEMORY_CACHE = True

    async def get(self, key: str):
        if self.redis_client is None and self.local_cache is None:
            await self.init_cache()
            
        if not config.USE_IN_MEMORY_CACHE and self.redis_client:
            try:
                val = await self.redis_client.get(key)
                if val:
                    logger.info(f"Redis Cache HIT for key: {key}")
                else:
                    logger.info(f"Redis Cache MISS for key: {key}")
                return val
            except Exception as e:
                logger.error(f"Redis get failed ({e}), falling back to local cache.")
                if not self.local_cache:
                    self.local_cache = InMemoryCache()
                config.USE_IN_MEMORY_CACHE = True
                
        if self.local_cache:
            return await self.local_cache.get(key)
        return None

    async def set(self, key: str, value: str, ex: int = 300):
        if self.redis_client is None and self.local_cache is None:
            await self.init_cache()
            
        if not config.USE_IN_MEMORY_CACHE and self.redis_client:
            try:
                await self.redis_client.set(key, value, ex=ex)
                logger.info(f"Redis Cache SET key: {key} (Expires in {ex}s)")
                return True
            except Exception as e:
                logger.error(f"Redis set failed ({e}), falling back to local cache.")
                if not self.local_cache:
                    self.local_cache = InMemoryCache()
                config.USE_IN_MEMORY_CACHE = True
                
        if self.local_cache:
            return await self.local_cache.set(key, value, ex=ex)
        return False

    async def delete(self, key: str):
        if self.redis_client is None and self.local_cache is None:
            await self.init_cache()
            
        if not config.USE_IN_MEMORY_CACHE and self.redis_client:
            try:
                await self.redis_client.delete(key)
                logger.info(f"Redis Cache DEL key: {key}")
                return True
            except Exception as e:
                logger.error(f"Redis delete failed ({e}), falling back to local cache.")
                if not self.local_cache:
                    self.local_cache = InMemoryCache()
                config.USE_IN_MEMORY_CACHE = True
                
        if self.local_cache:
            return await self.local_cache.delete(key)
        return False

cache = CacheManager()
