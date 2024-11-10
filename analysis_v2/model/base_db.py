from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from pymongo.collection import Collection
import logging
from pymongo import MongoClient, DESCENDING
from pymongo.errors import DuplicateKeyError
import os

class BaseDB(ABC):
    """Enhanced base database class with additional features"""
    
    def __init__(
        self,
        connection_string: Optional[str] = None,
        db_name: str = None,
        storage_dir: str = None,
        logger: Optional[logging.Logger] = None
    ):
        """
        Initialize database connection with enhanced features
        
        Args:
            connection_string: MongoDB connection string (optional)
            db_name: Name of the database
            storage_dir: Directory for MontyDB storage
            logger: Optional logger instance
        """
        if not db_name:
            raise ValueError("Database name must be specified")

        self.logger = logger or logging.getLogger(__name__)
        
        try:
            if connection_string:
                self.client = MongoClient(connection_string)
                self.db = self.client[db_name]
                self.logger.info(f"Connected to MongoDB database: {db_name}")
            else:
                from montydb import set_storage, MontyClient
                storage_dir = storage_dir or db_name.lower()
                os.makedirs(storage_dir, exist_ok=True)
                set_storage(storage_dir, storage="flatfile")
                self.client = MontyClient(storage_dir)
                self.db = self.client[db_name]
                self.logger.info(f"Connected to MontyDB database in: {storage_dir}")
        except Exception as e:
            self.logger.error(f"Failed to connect to database: {str(e)}")
            raise

    @abstractmethod
    def init_db(self):
        """Initialize database indexes and collections"""
        pass

    def create_index(self, collection: Collection, index_spec: List[tuple], unique: bool = False):
        """Helper method to safely create indexes"""
        try:
            collection.create_index(index_spec, unique=unique)
        except Exception as e:
            self.logger.error(f"Failed to create index on {collection.name}: {str(e)}")
            raise

    def safe_insert(self, collection: Collection, document: Dict[str, Any], upsert: bool = True):
        """Helper method for safe document insertion"""
        try:
            if upsert:
                return collection.update_one(
                    {"_id": document.get("_id")},
                    {"$set": document},
                    upsert=True
                )
            return collection.insert_one(document)
        except Exception as e:
            self.logger.error(f"Failed to insert document: {str(e)}")
            raise

    def __enter__(self):
        """Context manager support"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Ensure proper cleanup of database connections"""
        try:
            self.client.close()
            self.logger.info("Database connection closed")
        except Exception as e:
            self.logger.error(f"Error closing database connection: {str(e)}")
            raise
