from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from datetime import datetime
import os
from enum import Enum
from pymongo import DESCENDING
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
    def __init__(self, connection_string=None):
        super().__init__(
            connection_string=connection_string,
            db_name="stock_metadata",
            storage_dir="stock_data"
        )
        self.stock_collection = self.db.stocks
        self.init_db()

    def init_db(self):
        """Initialize database indexes using helper method"""
        self.stock_collection.create_index([("symbol", DESCENDING)], unique=True)
        self.stock_collection.create_index([("sector", DESCENDING)])
        self.stock_collection.create_index([("industry", DESCENDING)])
        self.stock_collection.create_index([("market_cap", DESCENDING)])

    def save_data(self, stocks_data: List[Dict[str, Any]]):
        """Cache stock information"""
        for stock_dict in stocks_data:
            try:
                # Create a new dictionary for the update
                update_dict = stock_dict.copy()
                
                # Convert market_cap to int if it's a string
                if isinstance(update_dict["market_cap"], str):
                    update_dict["market_cap"] = int(float(update_dict["market_cap"]))
                
                # Calculate market_cap_category
                update_dict["market_cap_category"] = categorize_market_cap(update_dict["market_cap"])
                
                # Add timestamp
                update_dict["updated_at"] = datetime.utcnow()
                
                # Perform the update
                self.stock_collection.replace_one(
                    {"symbol": update_dict["symbol"]},
                    update_dict,
                    upsert=True
                )
            except (ValueError, TypeError) as e:
                print(f"Error processing stock {stock_dict.get('symbol')}: {str(e)}")
                continue

    def get_stock_info(self, symbol: str) -> Optional[StockInfo]:
        """Get stock information by symbol"""
        result = self.stock_collection.find_one({"symbol": symbol})
        return StockInfo.from_dict(result) if result else None

    def get_stocks(self, industry: Optional[str] = None, sector: Optional[str] = None) -> List[StockInfo]:
        """Get stocks filtered by industry and sector"""
        query = {}
        if industry and industry != "all":
            query["industry"] = industry
        if sector and sector != "all":
            query["sector"] = sector
        
        results = self.stock_collection.find(query)
        return [StockInfo.from_dict(result) for result in results]

    def get_all_sectors(self) -> List[str]:
        """Get a list of all sectors"""
        return self.stock_collection.distinct("sector")

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
    data = pd.read_csv('/Users/mohd.nauman/Downloads/StockAdvisor/analysis_v2/data/indian_stocks.csv')
    
    sample_data = data.to_dict(orient="records")
    # Initialize database
    stock_db = StockMetadataDB()
    
    # Cache stock metadata
    stock_db.save_data(sample_data)


if __name__ == "__main__":
    main()