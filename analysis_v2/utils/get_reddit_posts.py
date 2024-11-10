import praw
from datetime import datetime
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import List, Dict
import torch.quantization

def extract_latest_high_score_posts_with_comments(stock_symbol, stock_name, limit=20, num_comments=5, min_score=1):
    # Initialize Reddit API client
    reddit = praw.Reddit(
        client_id='f3_97zOaIL_PHuYdhuXreQ',
        client_secret='IWGQj6udcE0A_Keoh3NEoXc7Bw3k1g',
        user_agent='Stock-helper'
    )
    
    # Set up the specific subreddit and stock query
    subreddit = reddit.subreddit('all')
    query = f'"{stock_symbol}"'
    
    # Compile regex pattern for matching stock symbol or related names
    # pattern = re.compile(rf'\b{re.escape(stock_symbol)}\b', re.IGNORECASE)
    pattern = re.compile(rf'\b({re.escape(stock_symbol)}|{re.escape(stock_name)})\b', re.IGNORECASE)

    
    posts = []
    for submission in subreddit.search(query, sort='new', limit=limit):
        print(f"Fetched submission: {submission.title} with score: {submission.score}", len(submission.comments.list()))  # Debugging line
        
        if submission.score < min_score:
            continue
        
        post_data = {
            'title': submission.title,
            'score': submission.score,
            'url': submission.url,
            'num_comments': submission.num_comments,
            'created': datetime.utcfromtimestamp(submission.created_utc).strftime('%Y-%m-%d %H:%M:%S'),
            'subreddit': submission.subreddit.display_name,
            'top_comments': []
        }
        
        # Check if the stock symbol is in the title
        # if pattern.search(submission.title):
        #     posts.append(post_data)
            
        
        # If not in title, check comments
        submission.comments.replace_more(limit=0)
        top_comments = submission.comments.list()[:num_comments+1]
        for comment in top_comments:
            if comment.author and comment.author.name in ['AutoModerator']:
                continue
            
            if pattern.search(submission.title) or pattern.search(comment.body):
                comment_data = {
                    'body': comment.body,
                    'author': comment.author.name if comment.author else 'deleted',
                    'score': comment.score
                }
                post_data['top_comments'].append(comment_data)
        
        # If we found relevant comments, add the post
        if post_data['top_comments'] or (pattern.search(submission.title) and len(submission.title.split())>5):
            posts.append(post_data)
        

    
    return posts




# --- (1) Model Configuration & Loading ---

model_name = "ProsusAI/finbert"  # Choose your FinBERT variant 
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# --- (2) Quantization (Optional but recommended for efficiency) --- 
model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# --- (3) Set Device ---
device = "cpu"  
model = model.to(device)

# --- (4) Sentiment Analysis Function --- 
def analyze_reddit_sentiment(reddit_post: Dict) -> Dict:
    """Analyzes sentiment in a Reddit post, including title and comments.

    Args:
        reddit_post: A dictionary representing a Reddit post.

    Returns:
        A dictionary containing sentiment information.
    """

    positive_comments = []
    negative_comments = []
    total_sentiment = 0
    analyzed_items = 0

    # --- (a) Analyze Post Title Sentiment ---
    title = reddit_post['title']
    inputs = tokenizer(title, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    predicted_class_id = logits.argmax().item()
    if predicted_class_id == 2:  # Positive
        total_sentiment += 1
        positive_comments.append(title)
    elif predicted_class_id == 0:  # Negative
        total_sentiment += 1
        positive_comments.append(title)
    analyzed_items += 1

    # --- (b) Analyze Comment Sentiment ---
    for comment_data in reddit_post['top_comments']:
        comment = comment_data['body']

        inputs = tokenizer(comment, return_tensors="pt", truncation=True, padding=True).to(device)
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits

        predicted_class_id = logits.argmax().item()
        if predicted_class_id == 2: 
            sentiment_score = 1
            positive_comments.append(comment)
        elif predicted_class_id == 0: 
            sentiment_score = -1
            negative_comments.append(comment)
        else:
            sentiment_score = 0 

        total_sentiment += sentiment_score
        analyzed_items += 1

    # --- (c) Calculate Average Sentiment ---
    average_sentiment = total_sentiment / analyzed_items if analyzed_items > 0 else 0

    return {
        "overall_sentiment": average_sentiment,
        "positive_summary": ". ".join(positive_comments[:3]),
        "negative_summary": ". ".join(negative_comments[:3])
    }





if __name__ == '__main__':  

    posts = extract_latest_high_score_posts_with_comments('TATAMOTORS', 'tata motors')
    for post in posts:
        analysis = analyze_reddit_sentiment(post)
        print(f"Post: {post['title']}\nSentiment: {analysis}\n") 

    