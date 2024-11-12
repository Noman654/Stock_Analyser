from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from datetime import datetime
import os
from enum import Enum
from dataclasses import dataclass
from .base_db import BaseDB


def categorize_market_cap(market_cap):
    if market_cap >= 10_000_000_000:
        return 'Large Cap'
    elif market_cap >= 5_000_000_000:
        return 'Mid Cap'
    return 'Small Cap'


class Exchange(str, Enum):
    BSE = "BSE"
    NSE = "NSE"


@dataclass
class StockInfo:
    symbol: str
    name: str
    industry: str
    sector: str
    market_cap: int
    exchange: Exchange
    market_cap_category: str
    updated_at: datetime = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "symbol": self.symbol,
            "name": self.name,
            "industry": self.industry,
            "sector": self.sector,
            "market_cap": self.market_cap,
            "exchange": self.exchange,
            "market_cap_category": self.market_cap_category,
            "updated_at": self.updated_at or datetime.utcnow()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'StockInfo':
        return cls(
            symbol=data["symbol"],
            name=data["name"],
            industry=data["industry"],
            sector=data["sector"],
            market_cap=data["market_cap"],
            market_cap_category=data["market_cap_category"],
            exchange=Exchange(data["exchange"]),
            updated_at=data.get("updated_at")
        )


class StockMetadataDB(BaseDB):
    def __init__(self, db_name="stock_metadata", storage_dir="stock_data"):
        super().__init__(
            db_name=db_name,
            storage_dir=storage_dir
        )
        self.init_db()

    def init_db(self):
        """Initialize database indexes"""
        self.execute_query("""
            CREATE TABLE IF NOT EXISTS stocks (
                symbol TEXT PRIMARY KEY,
                name TEXT,
                industry TEXT,
                sector TEXT,
                market_cap INTEGER,
                exchange TEXT,
                market_cap_category TEXT,
                updated_at TIMESTAMP
            );
        """)
    
    def save_data(self, stocks_data: List[Dict[str, Any]]):
        """Cache stock information in tables"""
        for stock_dict in stocks_data:
            stock_info = StockInfo.from_dict(stock_dict)
            stock_info.market_cap_category = categorize_market_cap(stock_info.market_cap)
            stock_info.updated_at = datetime.utcnow()

            self.execute_query("""
                INSERT INTO stocks (symbol, name, industry, sector, market_cap, exchange, market_cap_category, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(symbol) DO UPDATE SET
                    name=excluded.name,
                    industry=excluded.industry,
                    sector=excluded.sector,
                    market_cap=excluded.market_cap,
                    exchange=excluded.exchange,
                    market_cap_category=excluded.market_cap_category,
                    updated_at=excluded.updated_at;
            """, stock_info.to_dict())

    def get_stock_info(self, symbol: str) -> Optional[StockInfo]:
        """Get stock information by symbol"""
        result = self.execute_query("SELECT * FROM stocks WHERE symbol = ?", {"symbol": symbol})
        return StockInfo.from_dict(result[0]) if result else None

    def get_stocks(self, industry: Optional[str] = None, sector: Optional[str] = None) -> List[StockInfo]:
        """Get stocks filtered by industry and sector"""
        query = "SELECT * FROM stocks WHERE 1=1"
        params = {}
        if industry and industry != "all":
            query += " AND industry = ?"
            params["industry"] = industry
        if sector and sector != "all":
            query += " AND sector = ?"
            params["sector"] = sector
        
        results = self.execute_query(query, params)
        return [StockInfo.from_dict(result) for result in results]

    def get_all_sectors(self) -> List[str]:
        """Get a list of all sectors"""
        results = self.execute_query("SELECT DISTINCT sector FROM stocks")
        return [row[0] for row in results]

    def get_industries_by_sector(self, sector: Optional[str] = None) -> List[str]:
        """Get a list of industries by sector"""
        query = {}
        if sector and sector != "all":
            query["sector"] = sector
        return self.stock_collection.distinct("industry", query)

    def get_market_cap_by_industry_and_sector(self, industry: Optional[str] = None, sector: Optional[str] = None) -> Optional[int]:
        """Get the market cap for a given industry and sector"""
        query = {}
        if industry and industry != "all":
            query["industry"] = industry
        if sector and sector != "all":
            query["sector"] = sector
        result = self.stock_collection.find_one(query, {"market_cap": 1})
        return result["market_cap"] if result else None

    def get_stocks_by_filters(self, industry: Optional[str] = None, sector: Optional[str] = None) -> List[StockInfo]:
        """Get stocks filtered by industry and sector, and return market cap"""
        query = {}
        if industry and industry != "all":
            query["industry"] = industry
        if sector and sector != "all":
            query["sector"] = sector
        
        results = self.stock_collection.find(query)
        return [StockInfo.from_dict(result) for result in results]
    



def main():
    # Example usage
    import pandas as pd 
    data = pd.read_csv('analysis_v2/data/indian_stocks.csv')
    
    sample_data = data.to_dict(orient="records")
    # Initialize database
    stock_db = StockMetadataDB()
    
    # Cache stock metadata
    stock_db.save_data(sample_data)


if __name__ == "__main__":
    main()