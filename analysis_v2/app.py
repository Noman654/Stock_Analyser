from flask import Flask, jsonify, request
import pandas as pd
from model import StockMetadataDB
import utils.opt_f as f
from functools import lru_cache
from flask_cors import CORS
from utils import analyse as an
from flasgger import Swagger

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

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
    """
    Get all sectors
    ---
    responses:
      200:
        description: A list of sectors
        schema:
          type: array
          items:
            type: string
    """
    stock_db = StockMetadataDB()
    sectors = stock_db.get_all_sectors()
    return jsonify(sectors)

@app.route('/', methods=['GET'])
def hello_world():
    """
    Hello World endpoint
    ---
    responses:
      200:
        description: Returns a hello world message
        schema:
          type: string
    """
    return "Hello World"

@app.route('/industries', methods=['GET'])
def get_industries():
    """
    Get industries by sector
    ---
    parameters:
      - name: sector
        in: query
        type: string
        required: false
        default: all
    responses:
      200:
        description: A list of industries
        schema:
          type: array
          items:
            type: string
    """
    sector = request.args.get('sector', 'all')
    stock_db = StockMetadataDB()
    industries = stock_db.get_industries_by_sector(sector)
    return jsonify(industries)

@app.route('/stocks', methods=['GET'])
def get_stocks():
    """
    Get stocks by filters
    ---
    parameters:
      - name: industry
        in: query
        type: string
        required: false
        default: all
      - name: sector
        in: query
        type: string
        required: false
        default: all
      - name: market_cap_category
        in: query
        type: string
        required: false
        default: all
    responses:
      200:
        description: A list of stocks
        schema:
          type: array
          items:
            type: object
            properties:
              ticker:
                type: string
              name:
                type: string
              market_cap:
                type: number
              market_cap_category:
                type: string
              pe_ratio:
                type: number
              pb_ratio:
                type: number
              dividend_yield:
                type: number
    """
    industry = request.args.get('industry', 'all')
    sector = request.args.get('sector', 'all')
    market_cap_category = request.args.get('market_cap_category', 'all')
    
    stock_db = StockMetadataDB()
    stocks = stock_db.get_stocks_by_filters(industry, sector)
    
    if market_cap_category != 'all' and market_cap_category in ['Large Cap', 'Mid Cap', 'Small Cap']:
        stocks = [stock for stock in stocks if stock.market_cap_category == market_cap_category]
    
    symbols_and_name = [(stock.symbol+'.BO', stock.name) for stock in stocks]
    stocks_data = f.main(symbols_and_name)
    
    def clean_nan_values(obj):
        import numpy as np 
        if isinstance(obj, float) and np.isnan(obj):
            return None
        return obj

    import json
    stocks_data.fillna(value="", inplace=True)
    stocks_data = stocks_data.reset_index()
    stocks_data = stocks_data.to_dict(orient='records')
    cleaned_stocks = json.loads(json.dumps(stocks_data, default=clean_nan_values))
    print("----------------")

    return jsonify(cleaned_stocks)

@app.route('/stock_analysis', methods=['POST'])
def stock_analysis():
    """
    Analyze stocks
    ---
    parameters:
      - name: symbols
        in: body
        type: array
        items:
          type: string
        required: true
    responses:
      200:
        description: Analysis result
        schema:
          type: object
          properties:
            result:
              type: object
      400:
        description: No symbols provided
        schema:
          type: object
          properties:
            error:
              type: string
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    symbols = request.json.get('symbols', [])
    if not symbols:
        return jsonify({"error": "No symbols provided"}), 400
    
    try:
        analysis_result = an.analysis_stocks(symbols)
        return jsonify({"result": analysis_result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)