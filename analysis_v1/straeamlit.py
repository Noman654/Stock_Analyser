import streamlit as st
import pandas as pd
import  opt_f as f
from analyse import analysis_stocks
from news_fetch import extract_news

@st.cache_data
def load_data():
    try:
        data = pd.read_csv('./indian_stocks.csv')
        data['market_cap_category'] = data['market_cap'].apply(categorize_market_cap)
        return data
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return pd.DataFrame()  # Return an empty DataFrame on error

def categorize_market_cap(market_cap):
    if market_cap >= 10_000_000_000:
        return 'Large Cap'
    elif market_cap >= 5_000_000_000:
        return 'Mid Cap'
    return 'Small Cap'

def get_unique_values(data, column):
    return sorted(data[column].unique())

def filter_stocks(data, filters):
    for column, value in filters.items():
        if value != "All":
            data = data[data[column] == value]
    return data

def display_stocks(stocks):
    st.write(stocks[['symbol', 'name', 'industry', 'sector', 'market_cap_category']])

def calculate_score(stocks, number_of_stocks=10):
    if stocks.empty:
        st.warning("No stocks available to calculate scores.")
        return None  # Return None if no stocks are available

    stocks_symbols = [f"{symbol}.BO" for symbol in stocks['symbol']]
    st.header("Calculate Composite score stocks", divider=True)
    
    # Fetch data only if stocks_symbols is not empty
    if stocks_symbols:
        industry_stocks_df = f.main(stocks_symbols, top_n=number_of_stocks)
        st.write(industry_stocks_df)
        return industry_stocks_df
    else:
        st.warning("No stock symbols available for calculation.")
        return None

def select_option(data, column, label, default="All"):
    options = ["All"] + get_unique_values(data, column)
    return st.selectbox(label, options, index=options.index(default))

def research_industry(data):
    st.title("Research Industry Best Stocks")
    
    sector = select_option(data, 'sector', "Choose Sector")
    filtered_data = filter_stocks(data, {'sector': sector})
    
    industry = select_option(filtered_data, 'industry', "Choose Industry")
    filtered_data = filter_stocks(filtered_data, {'industry': industry})
    
    market_cap = select_option(filtered_data, 'market_cap_category', "Choose Market Cap Category")
    filtered_data = filter_stocks(filtered_data, {'market_cap_category': market_cap})
    
    display_stocks(filtered_data)
    
    # Only calculate score if filtered_data is not empty
    if not filtered_data.empty:
        industry_stocks_df = calculate_score(filtered_data)

        if st.button("Analyze the Top Stock"):
            st.experimental_set_query_params(page="top_stock_analysis")
            symbols_stocks = industry_stocks_df.index.tolist()
            # formatted_str = analysis_stocks(symbols_stocks)
            st.write("")
    else:
        st.warning("No stocks available after filtering.")

def analyze_single_stock(data):
    st.title("Analyze a Single Stock")
    selected_ticker = st.selectbox("Select a Stock Ticker", get_unique_values(data, 'name'))
    if selected_ticker:
        st.write(f"Analyzing {selected_ticker}...")
        
        stock_details = data[data['name'] == selected_ticker]
        if stock_details.empty:
            st.error("No stock details found.")
            return
        stock_details = stock_details.iloc[0]

        # Uncomment if needed
        # print(str(stock_details['symbol']))
        # news = extract_news([str(stock_details['symbol'])])
        # print(news)
        # st.write(f"News of  {selected_ticker}...")
        # st.write(news[0])

        filtered_data = filter_stocks(data, {
            'industry': stock_details['industry'],
            'sector': stock_details['sector'],
            'market_cap_category': stock_details['market_cap_category']
        })
        calculate_score(filtered_data)

def search_stock(data):
    st.title("Search Stock by Sector and Market Cap")
    search_query = st.text_input("Search for Stock Symbol", "")
    
    if search_query:
        filtered_data = data[data['name'].str.contains(search_query, case=False)].head(5)
        if not filtered_data.empty:
            selected_stock = st.selectbox("Select a Stock", filtered_data['name'].tolist())
            stock_details = filtered_data[filtered_data['name'] == selected_stock].iloc[0]
            display_stocks(pd.DataFrame([stock_details]))
            
            sector = select_option(data, 'sector', "Choose Sector", default=stock_details['sector'])
            market_cap = select_option(data, 'market_cap_category', "Choose Market Cap Category", default=stock_details['market_cap_category'])
            
            filtered_data = filter_stocks(data, {'sector': sector, 'market_cap_category': market_cap})
            display_stocks(filtered_data)
            
            if st.button("Analyze Selected Stock"):
                st.experimental_set_query_params(page="selected_stock_analysis", stock=stock_details['symbol'])
        else:
            st.write("No matching stocks found.")
    else:
        st.write("Enter a stock name to search.")

def display_market_cap_category(data):
    st.sidebar.title("Market Cap Categories")
    cap_option = st.sidebar.selectbox("Select Market Cap Category", ["All", "Large Cap", "Mid Cap", "Small Cap"])
    if cap_option != "All":
        filtered_data = filter_stocks(data, {'market_cap_category': cap_option})
        st.write(f"{cap_option} Stocks:")
        display_stocks(filtered_data)

def main():
    data = load_data()
    st.sidebar.title("Navigation")
    option = st.sidebar.selectbox("Select a section", ["Research Industry", "Analyze Single Stock", "Search Stock"])

    if option == "Research Industry":
        research_industry(data)
    elif option == "Analyze Single Stock":
        analyze_single_stock(data)
    elif option == "Search Stock":
        search_stock(data)
    
    display_market_cap_category(data)

if __name__ == "__main__":
    main()
