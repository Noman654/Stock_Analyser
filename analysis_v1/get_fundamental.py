import yfinance as yf
import pandas as pd

# Function to fetch the stock's fundamental data using yfinance
def get_stock_fundamentals(ticker):
    stock = yf.Ticker(ticker)
    data = {}

    # Valuation Ratios
    data['P/E Ratio'] = stock.info.get('trailingPE', 'N/A')
    data['PEG Ratio'] = stock.info.get('pegRatio', 'N/A')
    data['P/B Ratio'] = stock.info.get('priceToBook', 'N/A')
    data['Dividend Yield'] = stock.info.get('dividendYield', 'N/A')

    # Earnings per Share (EPS)
    data['EPS (TTM)'] = stock.info.get('trailingEps', 'N/A')
    
    # Market Cap
    data['Market Cap'] = stock.info.get('marketCap', 'N/A')

    # Quarterly Financials (Income statement)
    quarterly_financials = stock.quarterly_financials
    data['Revenue (Latest Quarter)'] = quarterly_financials.loc['Total Revenue'][0] if 'Total Revenue' in quarterly_financials.index else 'N/A'
    data['Net Income (Latest Quarter)'] = quarterly_financials.loc['Net Income'][0] if 'Net Income' in quarterly_financials.index else 'N/A'
    data['Operating Income (Latest Quarter)'] = quarterly_financials.loc['Operating Income'][0] if 'Operating Income' in quarterly_financials.index else 'N/A'
    
    # Balance Sheet (Latest Quarter)
    balance_sheet = stock.quarterly_balance_sheet
    data['Total Assets'] = balance_sheet.loc['Total Assets'][0] if 'Total Assets' in balance_sheet.index else 'N/A'
    data['Total Liabilities'] = balance_sheet.loc['Total Liabilities Net Minority Interest'][0] if 'Total Liabilities Net Minority Interest' in balance_sheet.index else 'N/A'
    data['Shareholder Equity'] = balance_sheet.loc['Stockholders Equity'][0] if 'Stockholders Equity' in balance_sheet.index else 'N/A'
    data['Net Debt'] = balance_sheet.loc['Net Debt'][0] if 'Net Debt' in balance_sheet.index else 'N/A'
    data['Total Debt'] = balance_sheet.loc['Total Debt'][0] if 'Total Debt' in balance_sheet.index else 'N/A'
    data['Working Capital'] = balance_sheet.loc['Working Capital'][0] if 'Working Capital' in balance_sheet.index else 'N/A'
    data['Invested Capital'] = balance_sheet.loc['Invested Capital'][0] if 'Invested Capital' in balance_sheet.index else 'N/A'
    
    # Cash Flow
    cash_flow = stock.quarterly_cashflow
    data['Operating Cash Flow (Latest Quarter)'] = cash_flow.loc['Total Cash From Operating Activities'][0] if 'Total Cash From Operating Activities' in cash_flow.index else 'N/A'
    data['Free Cash Flow (Latest Quarter)'] = cash_flow.loc['Free Cash Flow'][0] if 'Free Cash Flow' in cash_flow.index else 'N/A'

    # Debt-to-Equity Ratio (Derived)
    if data['Total Liabilities'] != 'N/A' and data['Shareholder Equity'] != 'N/A':
        data['Debt-to-Equity Ratio'] = data['Total Liabilities'] / data['Shareholder Equity']
    else:
        data['Debt-to-Equity Ratio'] = 'N/A'

    return pd.Series(data, name=ticker)

# Fetching and comparing multiple stocks
def compare_stocks(tickers):
    # Fetch data for each stock and create a dataframe
    fundamentals = pd.DataFrame([get_stock_fundamentals(ticker) for ticker in tickers])
    
    # Optional: Clean up and format data for better readability
    fundamentals = fundamentals.fillna('N/A')
    
    # Format for LLM input (optional: rounding numeric values)
    formatted_output = fundamentals.applymap(lambda x: round(x, 5) if isinstance(x, (int, float)) else x)
    
    return formatted_output


def get_fundamental(tickers):
    # Example tickers
    # tickers = ['AAPL', 'MSFT', 'GOOGL']

    # Fetch and compare stock data
    stock_data = compare_stocks(tickers)
    
    return stock_data.to_dict()


def get_top_20_ratios_and_results(ticker):
    stock = yf.Ticker(ticker)
    data = {}

    # Valuation Ratios
    data['P/E Ratio (Trailing)'] = stock.info.get('trailingPE', 'N/A')
    data['P/E Ratio (Forward)'] = stock.info.get('forwardPE', 'N/A')
    data['PEG Ratio'] = stock.info.get('pegRatio', 'N/A')
    data['P/B Ratio (Price to Book)'] = stock.info.get('priceToBook', 'N/A')
    data['Price/Sales Ratio'] = stock.info.get('priceToSalesTrailing12Months', 'N/A')
    data['Enterprise Value/EBITDA'] = stock.info.get('enterpriseToEbitda', 'N/A')
    data['Enterprise Value/Revenue'] = stock.info.get('enterpriseToRevenue', 'N/A')

    # Profitability Ratios
    data['Return on Equity (ROE)'] = stock.info.get('returnOnEquity', 'N/A')
    data['Return on Assets (ROA)'] = stock.info.get('returnOnAssets', 'N/A')
    data['Return on Investment (ROI)'] = stock.info.get('returnOnInvestment', 'N/A')
    data['Gross Margin'] = stock.info.get('grossMargins', 'N/A')
    data['Operating Margin'] = stock.info.get('operatingMargins', 'N/A')
    data['Net Profit Margin'] = stock.info.get('profitMargins', 'N/A')

    # Liquidity Ratios
    data['Current Ratio'] = stock.info.get('currentRatio', 'N/A')
    data['Quick Ratio'] = stock.info.get('quickRatio', 'N/A')

    # Leverage Ratios
    data['Debt to Equity Ratio'] = stock.info.get('debtToEquity', 'N/A')
    data['Total Debt/Total Assets'] = stock.info.get('totalDebt', 'N/A') / stock.info.get('totalAssets', 1) if 'totalDebt' in stock.info and 'totalAssets' in stock.info else 'N/A'
    data['Interest Coverage Ratio'] = stock.info.get('ebitda', 'N/A') / stock.info.get('totalDebt', 1) if 'ebitda' in stock.info and 'totalDebt' in stock.info else 'N/A'

    # Cash Flow Ratios
    data['Operating Cash Flow to Sales'] = stock.info.get('operatingCashflow', 'N/A') / stock.info.get('totalRevenue', 1) if 'operatingCashflow' in stock.info and 'totalRevenue' in stock.info else 'N/A'
    data['Free Cash Flow Yield'] = stock.info.get('freeCashflow', 'N/A') / stock.info.get('marketCap', 1) if 'freeCashflow' in stock.info and 'marketCap' in stock.info else 'N/A'
    
    # Growth Metrics
    data['Revenue Growth (YoY)'] = stock.info.get('revenueGrowth', 'N/A')
    data['EPS Growth (YoY)'] = stock.info.get('earningsGrowth', 'N/A')

    # Quarterly Results (Last 3 Quarters)
    yearly_financial = stock.financials.iloc[:,:3].dropna(how='all').to_dict()

    quarterly_financial =stock.quarterly_financials.iloc[:,:3].dropna(how='all').to_dict()
    return {
        'fundamental ratio':data,
        'Yearly Financlial': yearly_financial,
        'Quarterly Financial':quarterly_financial

    }
