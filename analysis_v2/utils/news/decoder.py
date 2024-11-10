import random 
import json
from urllib.parse import quote, urlparse
from typing import List, Dict, Any, Tuple
from collections import OrderedDict

import requests
from bs4 import BeautifulSoup

def get_decoding_params(gn_art_id: str, gn_url: str, index: int, zyte_proxy) -> Dict[str, Any]:
    """
    Fetches decoding parameters for a given Google News article ID.

    :param gn_art_id: The Google News article ID.
    :param gn_url: The original Google News URL.
    :param index: Original position index of the URL.
    :return: A dictionary containing the signature, timestamp, article ID, original URL and index.
    """
    response = requests.get(
        f"https://news.google.com/articles/{gn_art_id}", 
        proxies=zyte_proxy, 
        verify='/Users/mohd.nauman/Downloads/StockAdvisor/news_exports/zyte-ca.crt'
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "lxml")
    div = soup.select_one("c-wiz > div")
    return {
        "signature": div.get("data-n-a-sg"),
        "timestamp": div.get("data-n-a-ts"),
        "gn_art_id": gn_art_id,
        "google_news_url": gn_url,
        "original_index": index  # Track the original position
    }

def decode_urls(articles: List[Dict[str, Any]], zyte_proxy=None) -> List[Dict[str, str]]:
    """
    Decodes URLs from Google News articles.

    :param articles: A list of dictionaries containing article parameters.
    :param zyte_proxy: A dictionary containing Zyte proxy configuration.
    :return: A list of dictionaries containing both original and decoded URLs.
    """
    # Create requests while maintaining order
    articles_reqs = []
    for art in articles:
        req = [
            "Fbv4je",
            f'["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"{art["gn_art_id"]}",{art["timestamp"]},"{art["signature"]}"]',
        ]
        articles_reqs.append(req)
    
    payload = f"f.req={quote(json.dumps([articles_reqs]))}"
    headers = {"content-type": "application/x-www-form-urlencoded;charset=UTF-8"}
    
    if zyte_proxy:
        proxies = zyte_proxy
        verify = '/Users/mohd.nauman/Downloads/StockAdvisor/news_exports/zyte-ca.crt'
    else:
        verify = True

    response = requests.post(
        url="https://news.google.com/_/DotsSplashUi/data/batchexecute",
        headers=headers,
        proxies=proxies,
        data=payload,
        verify=verify
    )
    response.raise_for_status()
    
    # Parse response while maintaining order
    decoded_urls = []
    try:
        response_data = json.loads(response.text.split("\n\n")[1])
        for res in response_data[:-2]:  # Skip last two items as before
            decoded_url = json.loads(res[2])[1]
            decoded_urls.append(decoded_url)
    except Exception as e:
        print(f"Error parsing response: {str(e)}")
        return []

    # Combine original and decoded URLs while maintaining order
    result = [
        {
            "original_index": art["original_index"],
            "google_news_url": art["google_news_url"],
            "original_url": decoded_url
        }
        for art, decoded_url in zip(articles, decoded_urls)
    ]
    
    # Sort by original index to maintain input order
    result.sort(key=lambda x: x["original_index"])
    
    # Remove the index from final output
    return [{k: v for k, v in item.items() if k != 'original_index'} 
            for item in result]

def decode_all_urls(encoded_urls: List[str], use_zyte=True) -> List[Dict[str, str]]:
    """
    Decodes all encoded URLs to their original form using a proxy.

    :param encoded_urls: A list of encoded URLs.
    :param use_zyte: Boolean to determine whether to use Zyte proxy.
    :return: A list of dictionaries containing both Google News URLs and their original article URLs.
    :raises Exception: If the input is not a list of URLs.
    """
    if isinstance(encoded_urls, str):
        encoded_urls = [encoded_urls]

    if not isinstance(encoded_urls, list):
        raise Exception("Parameter is wrong; a list of URLs is expected")

    zyte_proxy = {
        "http": "http://a1e3e7f8358144f38008f97c3d9dc90c:@api.zyte.com:8011/",
        "https": "http://a1e3e7f8358144f38008f97c3d9dc90c:@api.zyte.com:8011/",
    } if use_zyte else None

    # Add index tracking to articles_params
    articles_params = [
        get_decoding_params(
            urlparse(url).path.split("/")[-1],
            url,
            idx,
            zyte_proxy
        ) for idx, url in enumerate(encoded_urls)
    ]
    
    return decode_urls(articles_params, zyte_proxy)

if __name__ == '__main__':
    # Example usage with order verification
    encoded_urls = [
        "https://news.google.com/rss/articles/CBMisAFBVV95cUxNS3B6N2NlLTl6QWRpNS13N1ppbS1SOW9fSUNVY1YxZV9MSFpSWDFtLUpoeTFRbFpBMjBvZ0hqQVJfUGxGS0l4YVBrblMwakJtR19scjlWVnE4VGJyODhwMUlTeVA3RzlzNzI3c3ZGRWdCX2xpRDA4Uml0WWdRUm1PRjYwN2JtX096T0Q2czJsb2h6VTRnRXFtYXFKRjFCa2Q2NHZYQmdDV3BhWnpmZDJQTNIBtgFBVV95cUxQNGMtLXNTZkZ3bHE0d2F5NVBpbTdOcG4tUlZFcTlPTEtRUU1CT3ktdUNGM2JmUnhBdWpiT3UyLWxGYlozVmVrVlhqdzRRMy02MEFWRVZya2FGSk91N24xV2JGUndnZjJwdm5uMmh6LU9ILUV2SjFNWFJUTkR2dWpDajZwb1o3UURGVXRsZFdpVEJLWjFvX25GLUxTMTI5QzlETWtrR3l1dWxhejNvWk56bUVvNUhaQQ?oc=5",  # URL 1
        "https://news.google.com/rss/articles/CBMixAFBVV95cUxOd0t6OTNJV0hzdE13cW80OUVKb3d0OE5nMmNuMFFZSUJ1WlBLa2lUMDctTE5lMjFpcTJiWUhSNXJ4Q1JNcFpScUR0VlB1TXhZY1pPVzY0cDZYLVdKUW1SZm1XVlhkMjRfX0VWQ2dkV21nYVJCb1RmQlE0aXdlaHQ3NllhcW1pNklSVVd1Y2J3cWpWRUVVUnV0eGUtanEzbEFsTVMxcXR6TjZaU0twQTV5Zm1uV1NNWFYwd0psRlgtX0xkX0Uy0gHKAUFVX3lxTE5nei0wejhCSTN0a1pXWllvUVFGRzRXZ0tJUENSSWttNHpXVktGVkJpWjJMYjd0RmdmSjRNbWNkMzNuNkVuY2ltbndqMnNVMG1KM0J6Vm40XzUxS2VRaUJIZU92c2xwZl9BZXlUZGlrejhyWURyWngybkpzeFRhRjlwMDdnNHZCQWwzVmdrdlhzZmp4di15VlhvQ2paU1BqdEloOEFrVFFUZGEyQmN1ZEJMS2VENXBmUUJINUMtZWVJejVRSGxpZHJxZUE?oc=5"   # URL 2
    ]
    
    print("Input URLs order:")
    for idx, url in enumerate(encoded_urls, 1):
        print(f"\n{idx}. {url}")
    
    results = decode_all_urls(encoded_urls, use_zyte=True)
    
    print("\nDecoded Results (maintaining original order):")
    for idx, result in enumerate(results, 1):
        print(f"\n{idx}. Google News URL:")
        print(result["google_news_url"])
        print(f"\n   Original Article URL:")
        print(result["original_url"])
        print("-" * 80)

    # Verify order is maintained
    print("\nOrder Verification:")
    for i in range(len(encoded_urls)):
        print(f"\nInput URL {i+1} matches output URL {i+1}: "
              f"{encoded_urls[i] == results[i]['google_news_url']}")