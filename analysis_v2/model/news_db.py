from typing import List, Dict, Any, Tuple
import json
from pymongo import MongoClient, DESCENDING
from pymongo.errors import DuplicateKeyError
import os

from datetime import datetime, timedelta


CACHE_DURATION = timedelta(days=3)       # Keep articles for 3 days
UPDATE_INTERVAL = timedelta(minutes=30)  # Check for updates every 30 minutes

class NewsDatabase:
    def __init__(self, connection_string=None):
        if connection_string:
            self.client = MongoClient(connection_string)
            self.db = self.client.stock_news
        else:
            from montydb import set_storage, MontyClient
            storage_dir = "stock_data"
            os.makedirs(storage_dir, exist_ok=True)
            set_storage(storage_dir, storage="flatfile")
            self.client = MontyClient(storage_dir)
            self.db = self.client.stock_news

        self.news_collection = self.db.news_articles
        self.metadata_collection = self.db.cache_metadata
        self.init_db()

    def init_db(self):
        """Initialize database indexes and collections"""
        # News articles indexes
        self.news_collection.create_index([
            ("symbol", DESCENDING),
            ("published_date", DESCENDING)
        ])
        
        self.news_collection.create_index([
            ("symbol", DESCENDING),
            ("url", DESCENDING)
        ], unique=True)

        # Cache metadata indexes
        self.metadata_collection.create_index([
            ("symbol", DESCENDING)
        ], unique=True)

    def get_cache_status(self, symbol: str) -> Tuple[List[Dict[str, Any]], datetime, bool]:
        """
        Get cached news and determine if update is needed
        
        Returns:
            Tuple containing:
            - List of cached articles
            - Latest article date
            - Boolean indicating if update is needed
        """
        now = datetime.now()
        cutoff_date = now - CACHE_DURATION
        
        # Get cached articles
        cached_articles = list(self.news_collection.find({
            "symbol": symbol,
            "published_date": {"$gte": cutoff_date}
        }).sort("published_date", DESCENDING))

        # Get last update time from metadata
        metadata = self.metadata_collection.find_one({"symbol": symbol})
        last_update = metadata.get('last_update') if metadata else None

        if not cached_articles:
            return [], None, True, None

        # Get latest article date
        latest_article_date = cached_articles[0]['published_date']
        
        # Check if we need an update (if last update was more than UPDATE_INTERVAL ago)
        needs_update = (
            not last_update or 
            now - last_update > UPDATE_INTERVAL
        )
        return cached_articles, latest_article_date, needs_update, last_update

    def update_last_checked(self, symbol: str):
        """Update the last check timestamp for a symbol"""
        self.metadata_collection.update_one(
            {"symbol": symbol},
            {
                "$set": {
                    "last_update": datetime.now(),
                    "symbol": symbol
                }
            },
            upsert=True
        )

    def save_news(self, news_data: List[Dict[str, Any]], symbol: str):
        """Save news articles to the database"""
        for article in news_data:
            try:
                if isinstance(article['date'], str):
                    article['published_date'] = datetime.fromisoformat(article['date'])
                else:
                    article['published_date'] = article['date']

                document = {
                    "symbol": symbol,
                    "company_name": article.get('company_name', ''),
                    "title": article['title'],
                    "url": article['url'],
                    "google_url": article['google_url'],
                    "text": article['text'],
                    "published_date": article['published_date'],
                    "source": article['source'].title,
                    "metadata": article.get('metadata', {}),
                    "created_at": datetime.utcnow()
                }

                self.news_collection.update_one(
                    {
                        "symbol": document["symbol"],
                        "url": document["url"]
                    },
                    {"$set": document},
                    upsert=True
                )
            except DuplicateKeyError:
                continue
            except Exception as e:
                print(f"Error saving article: {str(e)}")

        # Update last check timestamp
        self.update_last_checked(symbol)

    def clear_old_cache(self, days: int = 30):
        """Clear cache entries older than specified days"""
        cutoff_date = datetime.now() - timedelta(days=days)
        self.news_collection.delete_many({
            "created_at": {"$lt": cutoff_date}
        })
