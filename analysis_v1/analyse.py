from get_fundamental import get_top_20_ratios_and_results

import os
import google.generativeai as genai
# Load model directly
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch 
from news_fetch import extract_news

tokenizer = AutoTokenizer.from_pretrained("phanerozoic/BART-Large-CNN-Enhanced")
model = AutoModelForSeq2SeqLM.from_pretrained("phanerozoic/BART-Large-CNN-Enhanced")


def generate_prompt(symbols: list):
  """Generates a prompt for analyzing multiple stocks comparatively.

  Args:
    stock_data (dict): A dictionary where keys are stock names, and values are
                       dictionaries containing stock data.

  Returns:
    str: The generated prompt.
  """

  prompt = f"""
  Analyze the following stock data to provide an investment recommendation based on a comparative analysis.

  **Stocks:**

  """

#  fetching stocks data 
  

  stock_data = generate_data(symbols)

  for stock_name, stock_info in stock_data.items():
    prompt += f"**Stock: {stock_name}**\n"
    prompt += f"**Fundamental Ratios:**\n"
    for key, value in stock_info['fundamental ratio'].items():
      prompt += f"- {key}: {value}\n"

    prompt += f"**Yearly Financials:**\n"
    for year, data in stock_info['Yearly Financlial'].items():
      prompt += f"- {year}:\n"
      for key, value in data.items():
        prompt += f"  - {key}: {value}\n"

    prompt += f"**Quarterly Financials:**\n"
    for quarter, data in stock_info['Quarterly Financial'].items():
      prompt += f"- {quarter}:\n"
      for key, value in data.items():
        prompt += f"  - {key}: {value}\n"

    
    prompt += "**Recent News (Impact Analysis):**\n"
    for news in stock_info['news']:
      try:
        title = news['title']
        source = news['url']
        pub_date = news['date']  # Access the date, if available

        # Format news date; handle potential missing or invalid dates
        formatted_date = pub_date if pub_date else "(Date not available)"

        prompt += f"- {title} ({source}) - {formatted_date} - `{news['text']}`\n"
      except (KeyError, TypeError) as e:
        prompt += f"Error processing news for {stock_name}: {e}\n"

  prompt += """
  **Tasks:**

  1. **Comparative Analysis:**
     - **Table:** Create a table comparing the key metrics of each stock. Include:
        * Stock Name
        * including recent news sentiment analysis and each in one line for each stock
        * Revenue Growth (YoY %)
        * Net Income Growth (YoY %)
        * P/E Ratio
        * Debt/Equity Ratio (if available) 
        * Any other relevant metrics based on the provided data
     - **Strengths & Weaknesses:** Briefly summarize each stock's strengths and weaknesses based on the table and other data.  

  2. **Investment Suggestion:**
     - **Ranked Recommendations:**
        * Rank the stocks from most to least favorable for investment. 
        * For each stock, provide:
            * **Recommendation:** (Buy, Hold, Sell)
            * **Confidence Level:** (High, Medium, Low)
            * **Justification:** 1-2 sentences summarizing the key reasons based on your analysis. 

  **Output Format Guidelines:**

  * Use clear headings and formatting for readability. 
  * When mentioning numerical values, include the unit (e.g., %, USD, etc.)
  * Keep the language concise and focused on the key takeaways. 
  """

  return prompt



def generate_data(symbols):
    """
    Fetches and compiles stock data for a list of stock symbols.

    This function retrieves the latest news and top 20 fundamental ratios and results
    for each stock symbol provided in the input list. The data is organized into a dictionary
    where each key is a stock symbol and the value is another dictionary containing the stock's
    news and fundamental data.

    Args:
        symbols (list): A list of stock symbols (strings) for which data is to be fetched.

    Returns:
        dict: A dictionary where each key is a stock symbol and the value is a dictionary
              containing:
              - 'news' dict(title,link,pubDate,source, text): A list of recent news articles related to the stock.
              - Fundamental ratios and results as provided by `get_top_20_ratios_and_results`.
    """
    try:

      stock_data = dict()
      for symbol in symbols:
          # import time 
          # star_time = time.time()
          temp_data = get_top_20_ratios_and_results(symbol)
          # print("get fundamental data --",time.time()-star_time)
          # star_time = time.time()
          temp_data['news'] = extract_news(symbol)
          # print("get news data --",time.time()-star_time)
          stock_data[symbol] = temp_data
    except Exception as e:
       raise Exception(f"Unable to fetch data Error is {e}")

    return stock_data

def summarize_news_batch(texts, batch_size=4):  # Adjust batch size as needed
    all_summaries = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        batch_inputs = tokenizer.batch_encode_plus(
            ["summarize: " + text for text in batch],
            return_tensors='pt',
            max_length=1024,
            truncation=True,
            padding=True  # Important for batch processing
        )

        # Move tensors to your device (CPU in your case)
        batch_inputs = {k: v.to('cpu') for k, v in batch_inputs.items()} 

        with torch.no_grad(): # Disable gradient calculation for inference
            summary_ids = model.generate(**batch_inputs, max_length=250, min_length=50, length_penalty=2.0, num_beams=4, early_stopping=True)

        batch_summaries = tokenizer.batch_decode(summary_ids, skip_special_tokens=True)
        all_summaries.extend(batch_summaries)
    return all_summaries


def analysis_using_llm(prompt, max_output_tokens=8191):
    """
    Generates content using the Gemini model, handles long prompts,
    and retries if the process is interrupted.

    Args:
        prompt (str): The prompt to generate content for.
        max_output_tokens (int): Maximum output token limit per generation request.

    Returns:
        str: The generated content.
    """
    genai.configure(api_key='AIzaSyApnE1x5RpgNSyhHcdRo3HLFtUY9TPCl78')

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": max_output_tokens,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-8b",
        generation_config=generation_config,
    )
    
    generated_content = model.generate_content(prompt)
    generated_text = generated_content.candidates[0].content.parts[0].text
    return generated_text


def analysis_stocks(symbols: list)->str:
  
  # generate prompt
  prompt = generate_prompt(symbols)
  
  # with open('abc.txt', 'w+') as f:
  #    f.write(prompt)

  # # print(prompt)

  analysed_stock_str = analysis_using_llm(prompt)

  return analysed_stock_str


    
 