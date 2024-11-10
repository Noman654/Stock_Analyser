import yfinance as yf
import pandas as pd
import numpy as np
import logging
import multiprocessing as mp
import matplotlib.pyplot as plt

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Example tickers (you can use any stock list)
tickers = ['TCS.NS', 'INFY.NS', 'SAKSOFT.NS', 'KPITTECH.NS', 'ITC.NS']

# Define default weights for each metric (similar to IBD Composite Rating)
default_weights = {
    'EPS Growth': 0.25,
    'ROE': 0.15,
    'Revenue Growth': 0.2,
    'P/E Ratio': 0.1,
    'Debt-to-Equity': 0.05,
    'Profit Margin': 0.1,
    'Relative Strength': 0.1,
    'Accumulation/Distribution': 0.05
}

# Define weights for valuation metrics
valuation_weights = {
    'P/E Ratio': -0.1,        # Inverted for lower is better
    'P/B Ratio': -0.1,        # Inverted for lower is better
    'Dividend Yield': 0.05,   # Higher is better
    'FCF Yield': 0.1          # Higher is better
}

def get_financial_data(ticker):
    """Fetch financial data for a given ticker from Yahoo Finance."""
    stock = yf.Ticker(ticker)
    data = {}

    try:
        # Fetch necessary financial metrics
        data['EPS Growth'] = stock.info.get('earningsGrowth', np.nan)
        data['ROE'] = stock.info.get('returnOnEquity', np.nan)
        data['Revenue Growth'] = stock.info.get('revenueGrowth', np.nan)
        data['P/E Ratio'] = stock.info.get('trailingPE', np.nan)
        data['P/B Ratio'] = stock.info.get('priceToBook', np.nan)
        data['Dividend Yield'] = stock.info.get('dividendYield', np.nan)
        data['Debt-to-Equity'] = stock.info.get('debtToEquity', np.nan)
        data['Profit Margin'] = stock.info.get('profitMargins', np.nan)

        # Fetch technical metrics from historical data
        history = stock.history(period="1y")
        data['Relative Strength'] = history['Close'].pct_change().mean()  # Price strength over 1 year
        data['Accumulation/Distribution'] = history['Volume'].diff().mean()  # Volume change as proxy for institutional buying
        data['FCF Yield'] = stock.info.get('freeCashflow', 0) / stock.info.get('marketCap', 1)  # Free cash flow yield

        logging.info(f"Successfully fetched data for {ticker}")
    except Exception as e:
        logging.error(f"Error fetching data for {ticker}: {e}")

    return data

def z_score_normalization(data):
    """Normalize the given data using Z-score normalization."""
    return (data - np.mean(data)) / np.std(data)

def calculate_composite_scores(df, weights=default_weights):
    """Calculate composite scores based on normalized financial metrics."""
    df.set_index(['Company Name', df.index], inplace=True)
    normalized_data = df.apply(z_score_normalization, axis=0)  # Normalize each column
    composite_score = (normalized_data * pd.Series(weights)).sum(axis=1)
    df['Composite Score'] = composite_score
    return df

def calculate_valuation_score(df):
    """Calculate the valuation score based on normalized valuation metrics."""
    # Invert metrics where lower is better
    if df.empty:
        return df
    inverted_valuation_data = {
        'P/E Ratio': -df['P/E Ratio'],
        'P/B Ratio': -df['P/B Ratio'],
        'Dividend Yield': df['Dividend Yield'],
        'FCF Yield': df['FCF Yield']
    }
    
    # Create a DataFrame for inverted metrics
    inverted_df = pd.DataFrame(inverted_valuation_data)


    # Normalize the valuation metrics
    normalized_valuation_data = inverted_df.apply(z_score_normalization, axis=0)  
    valuation_score = (normalized_valuation_data * pd.Series(valuation_weights)).sum(axis=1)
    
    df['Valuation Score'] = valuation_score
    return df

def assign_ratings(df):
    """Assign ratings on a scale of 1 to 100 based on percentile ranks."""
    df['Composite Score Rating'] = df['Composite Score'].rank(pct=True) * 100
    df['Valuation Score Rating'] = df['Valuation Score'].rank(pct=True) * 100
    return df

def plot_scores(df):
    """Plot Composite Score and Valuation Score."""
    plt.figure(figsize=(12, 6))
    df[['Composite Score', 'Valuation Score']].plot(kind='bar', alpha=0.7)
    plt.title('Composite and Valuation Scores')
    plt.xlabel('Ticker')
    plt.ylabel('Scores')
    plt.xticks(rotation=45)
    plt.grid()
    plt.tight_layout()
    plt.show()

def main(symbols_and_name, custom_weights=None):
    """Main function to process stocks and calculate composite and valuation scores."""
    stock_data_list = []

    def fetch_and_append(ticker, stock_data_list):
        stock_data = get_financial_data(ticker)
        if stock_data:
            stock_data_list.append(stock_data)

    # Create a manager list to share data between processes
    # manager = mp.Manager()
    # stock_data_list = manager.list()

    # # Create a pool of workers
    # with mp.Pool(processes=mp.cpu_count()) as pool:
    #     pool.starmap(fetch_and_append, [(ticker, stock_data_list) for ticker in tickers])

    # Convert the manager list to a regular list
    # stock_data_list = list(stock_data_list)

    # stock_data_list = [get_financial_data(ticker[0]) for ticker in symbols_and_name]

    # # Convert the list to DataFrame
    # df = pd.DataFrame(stock_data_list, index=tickers)

    stock_data_dict = {}
    
    # Fetch data and store in dictionary with ticker as key
    for ticker, company_name in symbols_and_name:
        data = get_financial_data(ticker)
        if data:
            data['Company Name'] = company_name  # Add company name to the data
            stock_data_dict[ticker] = data

    df = pd.DataFrame.from_dict(stock_data_dict, orient='index')  

    if df.empty:
        logging.error("No data available. Exiting.")
        return df
    # Use custom weights if provided
    weights_to_use = custom_weights if custom_weights else default_weights

    # Calculate composite and valuation scores
    df_with_scores = calculate_composite_scores(df, weights_to_use)
    df_with_scores = calculate_valuation_score(df_with_scores)

    # Assign ratings based on scores
    df_with_ratings = assign_ratings(df_with_scores)

    # Sort stocks by composite score
    ranked_stocks = df_with_ratings.sort_values(by='Composite Score', ascending=False)

    logging.info("Composite and valuation scores calculated and stocks ranked.")
    
    # Plotting scores
    # plot_scores(ranked_stocks)
    
    print(len(ranked_stocks))
    return ranked_stocks

if __name__ == "__main__":
    # Example custom weights (optional)
    custom_weights = {
        'EPS Growth': 0.2,
        'ROE': 0.2,
        'Revenue Growth': 0.2,
        'P/E Ratio': 0.1,
        'Debt-to-Equity': 0.05,
        'Profit Margin': 0.1,
        'Relative Strength': 0.1,
        'Accumulation/Distribution': 0.1
    }
    
    results = main(tickers)
    
    print("Ticker | Composite Score | Valuation Score | Composite Rating | Valuation Rating")
    print("-------|------------------|-----------------|------------------|------------------")
    
    for ticker, row in results.iterrows():
        print(f"{ticker:6} | {row['Composite Score']:16.4f} | {row['Valuation Score']:15.4f} | {row['Composite Score Rating']:16.2f} | {row['Valuation Score Rating']:16.2f}")
