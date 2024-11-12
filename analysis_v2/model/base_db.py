from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
import logging
import duckdb
import os

class BaseDB(ABC):
    """Enhanced base database class with additional features"""
    
    def __init__(
        self,
        db_name: str,
        storage_dir: str = None,
        logger: Optional[logging.Logger] = None
    ):
        """
        Initialize database connection with enhanced features
        
        Args:
            db_name: Name of the database
            storage_dir: Directory for DB storage
            logger: Optional logger instance
        """
        if not db_name:
            raise ValueError("Database name must be specified")

        self.logger = logger or logging.getLogger(__name__)
        
        storage_path = os.path.join(storage_dir or ".", f"{db_name}.duckdb")
        self.conn = duckdb.connect(database=storage_path, read_only=False)
        self.logger.info(f"Connected to DuckDB database at: {storage_path}")

    @abstractmethod
    def init_db(self):
        """Initialize database indexes and collections"""
        pass

    def execute_query(self, query: str, params: Optional[Dict[str, Any]] = None):
        """Helper method to execute a SQL query safely"""
        try:
            if params:
                return self.conn.execute(query, params).fetchall()
            return self.conn.execute(query).fetchall()
        except Exception as e:
            self.logger.error(f"Failed to execute query: {str(e)}")
            raise

    def close(self):
        """Close the DuckDB connection"""
        try:
            self.conn.close()
            self.logger.info("Database connection closed")
        except Exception as e:
            self.logger.error(f"Error closing database connection: {str(e)}")
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
