from pymongo import AsyncMongoClient
from app.core.config import settings

client: AsyncMongoClient | None = None


def connect_to_mongo():
    global client
    client = AsyncMongoClient(settings.MONGODB_URL)


async def close_mongo_connection():
    global client
    if client:
        await client.close()


def get_db():
    if client is None:
        connect_to_mongo()
    return client[settings.DATABASE_NAME]