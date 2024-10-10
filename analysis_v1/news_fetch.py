from urllib.parse import quote
from datetime import datetime
from typing import List, Dict, Any

import feedparser
import newspaper

from googlenewsdecoder import new_decoderv1


# api_key = 'efubha9dicvg4w7kqecvln0qtbtgte8cw6z4q9c4'


def extract_text(url: str) -> str:
    """
    Extracts the main text content from a given URL.

    :param url: The URL of the article.
    :return: The extracted text content of the article.
    """
    try:
        article = newspaper.article(url)

    except newspaper.ArticleBinaryDataException:

        article = newspaper.article(url, allow_binary_content=True)

    except Exception as e:
        print("Error occured fetching news text", str(e))
        return None
    
    return article.text



def extract_news(stock_symbol: str, top_n: int = 4) -> List[Dict[str, Any]]:
    """
    Extracts news articles related to a given stock symbol.

    :param stock_symbol: The stock symbol to search for.
    :param top_n: The number of top articles to return.
    :return: A list of dictionaries containing article details.
    """
    encoded_stock_symbol = quote(stock_symbol)
    feed_url = f'https://news.google.com/rss/search?q=stock+{encoded_stock_symbol}&hl=en-IN&gl=IN&ceid=IN:en'
    feed = feedparser.parse(feed_url)

    articles = [
        {
            'title': entry.title,
            'link': entry.link,
            'pubDate': datetime.strptime(entry.published, '%a, %d %b %Y %H:%M:%S %Z'),
            'source': entry.source
        }
        for entry in feed.entries
    ]
    sorted_articles = sorted(articles, key=lambda x: x['pubDate'], reverse=True)[:top_n]

    news_datas = []
    for i, article in enumerate(sorted_articles):
        if len(news_datas) >= top_n:
            break
        try:
            url = article['link']
            decoded_url = new_decoderv1(url, interval=1)
            if decoded_url.get("status"):
                org_url = decoded_url['decoded_url']
                text = extract_text(org_url)
                news_data = {
                    'url': org_url,
                    'text': text,
                    'date': article['pubDate'],
                    'title': article['title']
                }
                news_datas.append(news_data)
            else:
                print("Error:", decoded_url["message"])
        except Exception as e:
            print(f"Error occurred: {e}")

    return news_datas


# if __name__ == '__main__':
#     news = extract_news('Saksoft')
#     for article in news:
#         print(article)


