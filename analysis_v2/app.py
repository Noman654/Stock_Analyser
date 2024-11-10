from flask import Flask, jsonify, request
import pandas as pd
from model import StockMetadataDB
import utils.opt_f as f
from functools import lru_cache
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@lru_cache()
def load_data():
    try:
        stock_db = StockMetadataDB()
        data = stock_db.get_stocks_by_industry("All")
        return data
    except Exception as e:
        return None

def categorize_market_cap(market_cap):
    if market_cap >= 10_000_000_000:
        return 'Large Cap'
    elif market_cap >= 5_000_000_000:
        return 'Mid Cap'
    return 'Small Cap'

@app.route('/sectors', methods=['GET'])
def get_sectors():
    stock_db = StockMetadataDB()
    sectors = stock_db.get_all_sectors()
    return jsonify(sectors)

@app.route('/', methods=['GET'])
def hello_world():
    return "Hello World"

@app.route('/industries', methods=['GET'])
def get_industries():
    sector = request.args.get('sector', 'all')
    stock_db = StockMetadataDB()
    industries = stock_db.get_industries_by_sector(sector)
    return jsonify(industries)

@app.route('/stocks', methods=['GET'])
def get_stocks():
    industry = request.args.get('industry', 'all')
    sector = request.args.get('sector', 'all')
    market_cap_category = request.args.get('market_cap_category', 'all')
    
    stock_db = StockMetadataDB()
    stocks = stock_db.get_stocks_by_filters(industry, sector)
    
    if market_cap_category != 'all' and market_cap_category in ['Large Cap', 'Mid Cap', 'Small Cap']:
        stocks = [stock for stock in stocks if stock.market_cap_category == market_cap_category]
    

    # get all the symbols from stocks 
    symbols_and_name = [(stock.symbol+'.BO', stock.name) for stock in stocks]

    stocks_data = f.main(symbols_and_name)
    
    def clean_nan_values(obj):
        import numpy as np 
        if isinstance(obj, float) and np.isnan(obj):
            return None
        return obj

    import json
    # Convert to records and clean NaN values
    stocks_data.fillna(value="", inplace=True)
    
    stocks_data = stocks_data.reset_index()
    stocks_data.rename(columns={'level_1': 'ticker', 'Company Name': 'name'}, inplace=True)
    stocks_data = stocks_data.to_dict(orient='records')
    cleaned_stocks = json.loads(json.dumps(stocks_data, default=clean_nan_values))
    print("----------------")

    return jsonify(cleaned_stocks)

if __name__ == '__main__':
    app.run(debug=True)