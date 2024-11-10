import yfinance as yf
import pandas as pd

# Example tickers (you can use any stock list)
tickers = ['TCS.NS', 'INFY.NS', 'SAKSOFT.NS', 'KPITTECH.NS', 'ITC.NS']

# Define weights for each metric (similar to IBD Composite Rating)
weights = {
    'EPS Growth': 0.25,      # Earnings per Share Growth
    'ROE': 0.15,             # Return on Equity
    'Revenue Growth': 0.2,   # Sales Growth
    'P/E Ratio': 0.1,        # Price to Earnings ratio (lower is better)
    'Debt-to-Equity': 0.05,  # Financial stability
    'Profit Margin': 0.1,    # Profitability
    'Relative Strength': 0.1,  # Stock's performance relative to others
    'Accumulation/Distribution': 0.05  # Institutional buying/selling
}


valuation_weights = {
    'P/E Ratio': -0.1,  # Negative weight because lower is better
    'P/B Ratio': -0.1,  # Negative weight for valuation
    'Dividend Yield': 0.05,  # Positive weight for income
    'FCF Yield': 0.1,  # Free cash flow yield
}

# Function to fetch financial data from Yahoo Finance
# Function to fetch financial data from Yahoo Finance
def get_financial_data(ticker):
    stock = yf.Ticker(ticker)
    data = {}

    try:
        # Fetch necessary financial metrics
        data['EPS Growth'] = stock.info.get('earningsGrowth', 0)
        data['ROE'] = stock.info.get('returnOnEquity', 0)
        data['Revenue Growth'] = stock.info.get('revenueGrowth', 0)
        data['P/E Ratio'] = stock.info.get('trailingPE', 0)
        data['P/B Ratio'] = stock.info.get('priceToBook', 0)
        data['Dividend Yield'] = stock.info.get('dividendYield', 0)
        data['Debt-to-Equity'] = stock.info.get('debtToEquity', 0)
        data['Profit Margin'] = stock.info.get('profitMargins', 0)
        
        # Fetch stock price and volume for technical metrics
        data['Relative Strength'] = stock.history(period="1y")['Close'].pct_change().mean()  # Price strength over 1 year
        data['Accumulation/Distribution'] = stock.history(period="1y")['Volume'].diff().mean()  # Volume change as proxy for institutional buying
        data['FCF Yield'] = stock.info.get('freeCashflow', 0) / stock.info.get('marketCap', 1)  # Free cash flow yield
    except KeyError:
        print(f"Error fetching data for {ticker}")
    return data

# Normalize data using Min-Max scaling
def normalize_data(data):
    return (data - data.min()) / (data.max() - data.min())

# Calculate the composite score for each stock
def calculate_composite_scores(df, weights=weights):
    normalized_data = df.apply(normalize_data, axis=0)  # Normalize each column
    df = calculate_valuation_score(normalized_data)
    composite_score = (normalized_data * pd.Series(weights)).sum(axis=1)
    df['Composite Score'] = composite_score
    return df



def calculate_composite_score(ticker, weights=weights):
    data = get_financial_data(ticker['symbol']+'.BO')
    valuation = sum(data[w_key]*valuation_weights[w_key] for w_key in valuation_weights)
    composite_score = sum(data[w_key]*weights[w_key] for w_key in weights)
    return composite_score, valuation


# Calculate the valuation score
def calculate_valuation_score(df):
    normalized_valuation_data = df[list(valuation_weights.keys())].apply(normalize_data, axis=0)  # Normalize valuation metrics
    valuation_score = (normalized_valuation_data * pd.Series(valuation_weights)).sum(axis=1)
    df['Valuation Score'] = valuation_score
    return df

# Calculate the composite score

# Main function to process stocks
def main(tickers):
    stock_data_list = []

    # Fetch data for each stock
    for ticker in tickers:
        stock_data = get_financial_data(ticker)
        if stock_data:
            stock_data_list.append(stock_data)
    
    # Convert the list to DataFrame
    df = pd.DataFrame(stock_data_list, index=tickers)
    
    # Calculate composite score
    df_with_score = calculate_composite_scores(df, weights)
    
    # Sort stocks by composite score
    ranked_stocks = df_with_score.sort_values(by='Composite Score', ascending=False)
    return ranked_stocks
