import streamlit as st
import pandas as pd
# from fundamental_a import  calculate_composite_scores, main
from opt_f import   main
from analyse import analysis_stocks

# Load data from CSV
data = pd.read_csv('./indian_stocks.csv')  # Updated to use indian_stocks.csv

# Function to categorize stocks by market cap
def categorize_market_cap(row):
    market_cap = int(row['market_cap'])
    if market_cap >= 10000000000:  # Large-cap
        return 'Large Cap'
    elif market_cap >= 5000000000:  # Mid-cap
        return 'Mid Cap'
    else:  # Small-cap
        return 'Small Cap'

# Apply categorization
data['market_cap_category'] = data.apply(categorize_market_cap, axis=1)

# Function to get unique sectors and industries
def get_sectors_and_industries(data):
    sectors = data['sector'].unique()  # Updated to use 'sector'
    industries = data['industry'].unique()  # Updated to use 'industry'
    return sectors, industries

# Sidebar for navigation
st.sidebar.title("Navigation")
option = st.sidebar.selectbox("Select a section", ["Research Industry", "Analyze Single Stock", "Best Stocks in Industry"])

if option == "Research Industry":
    st.title("Research Industry Best Stocks")
    
    # Get sectors and industries
    sectors, industries = get_sectors_and_industries(data)
    
    # Dropdown for sector selection
    selected_sector = st.selectbox("Choose Sector", sectors)
    
    # Filter industries based on selected sector
    filtered_industries = data[data['sector'] == selected_sector]['industry'].unique()  # Updated to use 'sector'
    selected_industry = st.selectbox("Choose Industry", filtered_industries)
    
    # Filter stocks based on selected industry
    industry_stocks = data[data['industry'] == selected_industry]
    
    # Dropdown for market cap selection
    market_cap_option = st.selectbox("Choose Market Cap Category", ["All", "Large Cap", "Mid Cap", "Small Cap"])
    
    # Filter stocks based on market cap selection
    if market_cap_option != "All":
        industry_stocks = industry_stocks[industry_stocks['market_cap_category'] == market_cap_option]
    

    # calculate composite score and valuation 
    # industry_stocks['scored'] = industry_stocks.apply(calculate_composite_score, axis=1)
    stocks_symbols = [symbol+'.BO' for symbol in industry_stocks['symbol'].to_list()]
    print(stocks_symbols)
    industry_stocks_df = main(stocks_symbols)

    # Show filtered stocks
    st.write(industry_stocks[['symbol', 'name', 'industry', 'sector', 'market_cap_category']])

    st.header("Caclulate Composite score stocks", divider=True)

    st.write(industry_stocks_df)

    symbols_stocks = [symbol for symbol in industry_stocks_df.index.to_list()]

    # Add a button to analyze the top stock
    if st.button("Analyze the Top Stock"):
        # Redirect to another page
        st.experimental_set_query_params(page="top_stock_analysis")

# Check if the page query parameter is set to "top_stock_analysis"
if st.experimental_get_query_params().get("page") == ["top_stock_analysis"]:
    st.title("Top Stock Analysis")
    
    # Call the function to get the formatted string
    formatted_str = analysis_stocks(symbols_stocks)
    
    # Display the formatted string
    st.write(formatted_str)

elif option == "Analyze Single Stock":
    st.title("Analyze a Single Stock")
    ticker = st.text_input("Enter Stock Ticker")
    if ticker:
        # Fetch and display stock data (you can integrate your existing functions here)
        st.write(f"Analyzing {ticker}...")

elif option == "Best Stocks in Industry":
    st.title("Best Stocks in Industry")
    # Logic to display best stocks (you can integrate your existing functions here)
    st.write("Displaying best stocks...")

# New section to categorize stocks by market cap
st.sidebar.title("Market Cap Categories")
cap_option = st.sidebar.selectbox("Select Market Cap Category", ["All", "Large Cap", "Mid Cap", "Small Cap"])

if cap_option != "All":
    if cap_option == "Large Cap":
        filtered_data = data[data['market_cap_category'] == 'Large Cap']
    elif cap_option == "Mid Cap":
        filtered_data = data[data['market_cap_category'] == 'Mid Cap']
    else:  # Small Cap
        filtered_data = data[data['market_cap_category'] == 'Small Cap']
    
    st.write(f"{cap_option} Stocks:")
    st.write(filtered_data[['symbol', 'name', 'industry', 'sector', 'market_cap_category']])  # Display market cap category