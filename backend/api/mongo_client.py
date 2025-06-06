import pymongo
from django.conf import settings
import os

# Attempt to load environment variables if not already done by Django.
# This is more for direct script execution, Django usually handles it.
from dotenv import load_dotenv
load_dotenv()

_mongo_client = None
_db = None

def get_db():
    global _mongo_client, _db
    if _db is None:
        try:
            # Get MongoDB connection settings from Django settings
            mongo_uri = getattr(settings, 'MONGO_DB_URI', 'mongodb://localhost:27017/')
            db_name = getattr(settings, 'MONGO_DB_NAME', 'mydatabase')

            if not mongo_uri:
                raise ValueError("MONGO_DB_URI is not set in Django settings or environment variables.")
            if not db_name:
                raise ValueError("MONGO_DB_NAME is not set in Django settings or environment variables.")

            _mongo_client = pymongo.MongoClient(mongo_uri)

            # Optional: Ping the server to ensure connection before returning the db
            _mongo_client.admin.command('ping')
            print(f"Successfully connected to MongoDB server at {mongo_uri.split('@')[-1] if '@' in mongo_uri else mongo_uri.split('//')[-1]}.")

            _db = _mongo_client[db_name]
            print(f"Using database: {db_name}")

        except pymongo.errors.ConnectionFailure as e:
            print(f"MongoDB connection failed: {e}")
            # Depending on the application's needs, you might exit, raise an error, or return None
            raise ConnectionError(f"Could not connect to MongoDB: {e}") from e
        except ValueError as e:
            print(f"Configuration error: {e}")
            raise ValueError(f"MongoDB configuration error: {e}") from e
        except Exception as e: # Catch any other unexpected errors during init
            print(f"An unexpected error occurred during MongoDB initialization: {e}")
            raise Exception(f"Unexpected error initializing MongoDB: {e}") from e

    return _db

def close_mongo_connection():
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
        _db = None
        print("MongoDB connection closed.")

# It's good practice for some application frameworks to explicitly close resources.
# For Django, this might be tied into application shutdown signals if long-running processes are an issue,
# but for typical request-response cycles, MongoClient's connection pooling is usually sufficient.
# For now, providing an explicit close function is enough.

# Example of how to get the database instance:
# from .mongo_client import get_db
# db = get_db()
# notes_collection = db.notes
