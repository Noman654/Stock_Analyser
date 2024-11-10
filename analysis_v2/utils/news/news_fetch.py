from urllib.parse import quote
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import json
from pymongo import MongoClient, DESCENDING
from pymongo.errors import DuplicateKeyError
import os

from model.news_db import NewsDatabase

from .decoder import decode_all_urls
from model.stocks_db import StockMetadataDB

import feedparser
import newspaper

# Define the sources to filter
RELIABLE_SOURCE = [
    "Reuters",
    "Mint",
    "Business Standard",
    "Moneycontrol",
    "CNBCTV18",
    "ET Now",
    "The Hindu",
    "BusinessLine",
    "Business Today"
]

# Constants for cache management
UPDATE_INTERVAL = timedelta(minutes=30)  # Check for updates every 30 minutes
CACHE_DURATION = timedelta(days=3)       # Keep articles for 3 days


def filter_news(feed, start_date=None, end_date=None, sources=None, date_filter=True):
    filtered_entries = []
    for entry in feed.entries:
        entry_date = datetime(*entry.published_parsed[:6])
        if date_filter:
            if start_date and entry_date < start_date:
                continue
            if end_date and entry_date > end_date:
                continue
        if sources and entry.source.title not in sources:
            continue
        filtered_entries.append(entry)
    return filtered_entries

def extract_text(url: str) -> Dict[str, Any]:
    """Extracts the main text content from a given URL."""
    try:
      article = newspaper.article(url)
    
    except newspaper.ArticleBinaryDataException:
        article = newspaper.article(url, allow_binary_content=True)

    except newspaper.ArticleException as e:
        print(f"Error extracting text from {url}: {str(e)}")
        return None
    

    
    return {
        'text': article.text,
        'title': article.title,
        'metadata': article.meta_data
    }

def fetch_fresh_news(
    name: str,
    symbol: str,
    last_day: int = 3,
    top_n: int = 12,
    start_date: datetime = None
) -> List[Dict[str, Any]]:
    """Fetch fresh news from Google News"""
    encoded_stock_symbol = name.replace('.', '').replace(' ', '+')
    
    # Use a shorter time window for immediate news
    recent_window = "1h" if start_date else f"{last_day}d"
    
    feed_url = f'https://news.google.com/rss/search?q=stock+{encoded_stock_symbol}+when:{recent_window}&hl=en-IN&gl=IN&ceid=IN:en'
    feed = feedparser.parse(feed_url)

    filtered_articles = filter_news(feed, start_date=start_date, sources=RELIABLE_SOURCE)
    articles = {
        entry.link: {
            'title': entry.title,
            'pubDate': datetime(*entry.published_parsed[:6]),
            'source': entry.source
        }
        for entry in filtered_articles
    }

    news_data = []
    decode_urls = decode_all_urls([article.link for article in filtered_articles[:top_n]])

    for url in decode_urls:
        data = extract_text(url['original_url'])
        if data:
            try:
                google_rss_url = url['google_news_url']
                news_item = {
                    'google_url': google_rss_url,
                    'url': url['original_url'],
                    'text': data['text'],
                    'date': articles[google_rss_url]['pubDate'],
                    'metadata': data['metadata'],
                    'keywords_name': [symbol],
                    'company_name': name,
                    'source': articles[google_rss_url]['source'],
                    'title': data['title']
                }
                news_data.append(news_item)
            except Exception as e:
                print(f"Error processing article: {str(e)}")

    return news_data

def fetch_stock_news(
    symbol: str,
    top_n: int = 12,
    last_day: int = 5,
    force_refresh: bool = False
) -> List[Dict[str, Any]]:
    """
    Smart fetch of stock news with frequent updates
    """
    
    db = NewsDatabase()
    name = StockMetadataDB().get_stock_info(symbol=symbol).name
    # Get cache status
    cached_news, latest_date, needs_update, latest_date = db.get_cache_status(symbol)
    
    if force_refresh:
        print(f"Force refreshing news for {symbol}")
        fresh_news = fetch_fresh_news(name, symbol, last_day, top_n)
        if fresh_news:
            db.save_news(fresh_news, symbol)
        return fresh_news
    
    if not cached_news:
        print(f"No cached news found for {symbol}, fetching fresh data")
        fresh_news = fetch_fresh_news(name, symbol, last_day, top_n)
        if fresh_news:
            db.save_news(fresh_news, symbol)
        return fresh_news
    

    # UPDATE_INTERVAL.minutes//60
    if needs_update:
        print(f"Checking for new articles for {symbol} (last update > {UPDATE_INTERVAL.seconds//60} minutes ago)")
        # Fetch only newer articles using a shorter time window
        latest_date = latest_date if latest_date else datetime.now() - timedelta(days=last_day)
        # Determine the number of days to fetch news based on the last update
        days_to_fetch = (datetime.now() - latest_date).days if latest_date else last_day 
        days_to_fetch = min(days_to_fetch+1, last_day) 
        fresh_news = fetch_fresh_news(
            name, 
            symbol, 
            last_day, 
            top_n,
            start_date=days_to_fetch
        )
        
        if fresh_news:
            print(f"Found {len(fresh_news)} new articles")
            db.save_news(fresh_news, symbol)
            # Combine with existing cache, ensuring no duplicates by URL
            existing_urls = {article['url'] for article in cached_news}
            new_articles = [
                article for article in fresh_news 
                if article['url'] not in existing_urls
            ]
            cached_news.extend(new_articles)
        else:
            print("No new articles found")
            db.update_last_checked(symbol)  # Update timestamp even if no new articles
    else:
        print(f"Using cached news for {symbol} (last checked: {latest_date})")
    
    return sorted(
        cached_news, 
        key=lambda x: x['published_date'], 
        reverse=True
    )[:top_n]

def main():
    db = NewsDatabase()
    
    import pandas as pd
    # data = pd.read_csv('indian_stocks.csv')
    data = pd.read_csv('/Users/mohd.nauman/Downloads/StockAdvisor/analysis_v1/data/indian_stocks.csv')

    stock_symbols = data[['name', 'symbol']].to_dict('records')
    
    for stock in stock_symbols[:2]:
        name = stock['name']
        symbol = stock['symbol']
        print(f'\nProcessing {name} ({symbol})')
        
        news = fetch_stock_news(
            symbol=symbol,
            top_n=5
        )
        print(f'Found {len(news)} articles')
        for article in news:
            print(f"- {article['published_date'].strftime('%Y-%m-%d %H:%M')}: {article['title']}")

    # Clear old cache entries
    # db.clear_old_cache(days=30)

if __name__ == "__main__":
    main()