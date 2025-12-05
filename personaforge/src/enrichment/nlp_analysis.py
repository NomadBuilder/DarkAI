"""NLP-based content analysis for vendor intelligence."""

import re
from typing import Dict, List, Optional
from collections import Counter
import json


def analyze_content_with_nlp(html_content: str, text_content: str) -> Dict:
    """
    Advanced NLP analysis of website content.
    
    Uses lightweight NLP techniques (no heavy ML models) for:
    - Keyword extraction
    - Named Entity Recognition (basic)
    - Sentiment analysis (rule-based)
    - Topic detection
    - Language detection
    - Service categorization
    
    Args:
        html_content: Full HTML content
        text_content: Cleaned text content
        
    Returns:
        Dictionary with NLP analysis results
    """
    result = {
        "keywords": [],
        "entities": {
            "organizations": [],
            "services": [],
            "locations": [],
            "prices": [],
            "dates": []
        },
        "sentiment": {
            "polarity": 0.0,
            "subjectivity": 0.0,
            "label": "neutral"
        },
        "topics": [],
        "language": "en",
        "service_categories": [],
        "key_phrases": []
    }
    
    if not text_content:
        return result
    
    text_lower = text_content.lower()
    
    # Keyword extraction (TF-IDF-like approach using frequency)
    keywords = extract_keywords(text_content)
    result["keywords"] = keywords[:30]  # Top 30 keywords
    
    # Key phrases (2-3 word combinations)
    key_phrases = extract_key_phrases(text_content)
    result["key_phrases"] = key_phrases[:20]
    
    # Named Entity Recognition (basic pattern matching)
    entities = extract_entities(text_content)
    result["entities"] = entities
    
    # Sentiment analysis (rule-based)
    sentiment = analyze_sentiment(text_content)
    result["sentiment"] = sentiment
    
    # Topic detection
    topics = detect_topics(text_content)
    result["topics"] = topics
    
    # Service categorization
    service_categories = categorize_services(text_content)
    result["service_categories"] = service_categories
    
    # Language detection (basic)
    language = detect_language(text_content)
    result["language"] = language
    
    return result


def extract_keywords(text: str, top_n: int = 30) -> List[Dict]:
    """
    Extract keywords using frequency analysis.
    
    Filters out common stop words and returns most significant terms.
    """
    # Common stop words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
        'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
        'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
        'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
        'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
        'too', 'very', 'just', 'now', 'then', 'here', 'there', 'when',
        'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
        'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
        'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'don',
        'should', 'now'
    }
    
    # Tokenize and count
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    word_freq = Counter(word for word in words if word not in stop_words)
    
    # Calculate significance (simple frequency-based)
    keywords = []
    total_words = len(words)
    
    for word, count in word_freq.most_common(top_n * 2):
        if count > 1:  # Only words that appear more than once
            frequency = count / total_words if total_words > 0 else 0
            keywords.append({
                "word": word,
                "count": count,
                "frequency": round(frequency, 4)
            })
    
    # Sort by frequency and return top N
    keywords.sort(key=lambda x: x["frequency"], reverse=True)
    return keywords[:top_n]


def extract_key_phrases(text: str, min_length: int = 2, max_length: int = 3) -> List[Dict]:
    """Extract key phrases (2-3 word combinations)."""
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'this', 'that', 'these', 'those', 'all', 'each', 'every', 'both'
    }
    
    words = text.lower().split()
    phrases = []
    
    # Generate 2-3 word phrases
    for length in range(min_length, max_length + 1):
        for i in range(len(words) - length + 1):
            phrase_words = words[i:i+length]
            # Skip if all words are stop words
            if not all(word in stop_words for word in phrase_words):
                phrase = ' '.join(phrase_words)
                # Filter out very short or very long phrases
                if 5 <= len(phrase) <= 50:
                    phrases.append(phrase)
    
    # Count phrase frequency
    phrase_freq = Counter(phrases)
    
    # Return top phrases
    result = []
    for phrase, count in phrase_freq.most_common(20):
        if count > 1:  # Only phrases that appear more than once
            result.append({
                "phrase": phrase,
                "count": count
            })
    
    return result


def extract_entities(text: str) -> Dict:
    """
    Basic Named Entity Recognition using pattern matching.
    
    Extracts:
    - Organizations (capitalized phrases)
    - Services (vendor-related terms)
    - Locations (country/state names)
    - Prices (currency amounts)
    - Dates (date patterns)
    """
    entities = {
        "organizations": [],
        "services": [],
        "locations": [],
        "prices": [],
        "dates": []
    }
    
    # Organizations (capitalized words/phrases)
    org_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b'
    orgs = re.findall(org_pattern, text)
    entities["organizations"] = list(set(orgs))[:20]
    
    # Services (vendor-related keywords)
    service_keywords = [
        'id', 'ssn', 'passport', 'driver license', 'credit', 'bank account',
        'utility bill', 'phone number', 'email', 'kyc', 'bypass', 'verification',
        'fake', 'synthetic', 'identity', 'document', 'deepfake', 'voice clone',
        'face swap', 'impersonation', 'persona', 'profile', 'kit', 'pack'
    ]
    
    for keyword in service_keywords:
        if keyword in text.lower():
            entities["services"].append(keyword)
    
    entities["services"] = list(set(entities["services"]))
    
    # Locations (common country/state names)
    locations = [
        'united states', 'usa', 'us', 'canada', 'uk', 'united kingdom',
        'australia', 'germany', 'france', 'spain', 'italy', 'netherlands',
        'california', 'new york', 'texas', 'florida', 'london', 'toronto'
    ]
    
    for location in locations:
        if location in text.lower():
            entities["locations"].append(location.title())
    
    entities["locations"] = list(set(entities["locations"]))
    
    # Prices (already extracted in content_extraction, but include here too)
    price_patterns = [
        r'\$([\d,]+\.?\d*)',
        r'€([\d,]+\.?\d*)',
        r'£([\d,]+\.?\d*)',
        r'([\d,]+\.?\d*)\s*(?:usd|eur|gbp|btc|eth)',
    ]
    
    for pattern in price_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                amount = match[0]
            else:
                amount = match
            entities["prices"].append(amount.replace(',', ''))
    
    entities["prices"] = list(set(entities["prices"]))[:20]
    
    # Dates (basic patterns)
    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b',
        r'\b\d{4}\b'  # Years
    ]
    
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        entities["dates"].extend(matches)
    
    entities["dates"] = list(set(entities["dates"]))[:20]
    
    return entities


def analyze_sentiment(text: str) -> Dict:
    """
    Rule-based sentiment analysis.
    
    Returns polarity (-1 to 1), subjectivity (0 to 1), and label.
    """
    # Positive words
    positive_words = {
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
        'best', 'perfect', 'outstanding', 'superb', 'awesome', 'brilliant',
        'quality', 'reliable', 'trusted', 'secure', 'safe', 'professional',
        'fast', 'quick', 'easy', 'simple', 'affordable', 'cheap', 'value'
    }
    
    # Negative words
    negative_words = {
        'bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'cheap',
        'unreliable', 'slow', 'difficult', 'complex', 'expensive', 'scam',
        'fraud', 'fake', 'illegal', 'dangerous', 'risky', 'untrustworthy'
    }
    
    # Intensifiers
    intensifiers = {
        'very', 'extremely', 'incredibly', 'absolutely', 'completely',
        'totally', 'really', 'quite', 'rather', 'somewhat', 'slightly'
    }
    
    words = text.lower().split()
    positive_count = 0
    negative_count = 0
    total_sentiment_words = 0
    
    for i, word in enumerate(words):
        # Check for intensifiers
        is_intensified = i > 0 and words[i-1] in intensifiers
        
        if word in positive_words:
            positive_count += 2 if is_intensified else 1
            total_sentiment_words += 1
        elif word in negative_words:
            negative_count += 2 if is_intensified else 1
            total_sentiment_words += 1
    
    # Calculate polarity
    if total_sentiment_words > 0:
        polarity = (positive_count - negative_count) / (positive_count + negative_count)
    else:
        polarity = 0.0
    
    # Clamp to -1 to 1
    polarity = max(-1.0, min(1.0, polarity))
    
    # Subjectivity (proportion of sentiment words)
    total_words = len(words)
    subjectivity = total_sentiment_words / total_words if total_words > 0 else 0.0
    subjectivity = min(1.0, subjectivity)
    
    # Label
    if polarity > 0.2:
        label = "positive"
    elif polarity < -0.2:
        label = "negative"
    else:
        label = "neutral"
    
    return {
        "polarity": round(polarity, 3),
        "subjectivity": round(subjectivity, 3),
        "label": label
    }


def detect_topics(text: str) -> List[str]:
    """
    Detect topics based on keyword presence.
    
    Returns list of detected topics.
    """
    topics = []
    text_lower = text.lower()
    
    # Topic keywords
    topic_keywords = {
        "identity_documents": ['id', 'passport', 'driver license', 'ssn', 'social security'],
        "financial_services": ['credit', 'bank', 'account', 'payment', 'bitcoin', 'crypto'],
        "verification_bypass": ['kyc', 'bypass', 'verification', 'scannable'],
        "deepfake_services": ['deepfake', 'face swap', 'voice clone', 'ai impersonation'],
        "synthetic_identity": ['synthetic', 'fake', 'identity kit', 'persona pack'],
        "document_forgery": ['fake', 'forged', 'document', 'counterfeit'],
        "privacy_security": ['privacy', 'secure', 'encrypted', 'anonymous', 'discrete'],
        "payment_methods": ['bitcoin', 'crypto', 'paypal', 'payment', 'btc', 'eth']
    }
    
    for topic, keywords in topic_keywords.items():
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        if matches >= 2:  # At least 2 keywords present
            topics.append(topic)
    
    return topics


def categorize_services(text: str) -> List[str]:
    """
    Categorize services based on content analysis.
    
    Returns list of service categories.
    """
    categories = []
    text_lower = text.lower()
    
    # Service category patterns
    service_patterns = {
        "fake_ids": ['fake id', 'id card', 'driver license', 'passport'],
        "ssn_services": ['ssn', 'social security number', 'social security'],
        "credit_services": ['credit', 'credit card', 'credit report', 'credit score'],
        "bank_accounts": ['bank account', 'bank statement', 'banking'],
        "utility_bills": ['utility bill', 'utility statement', 'proof of address'],
        "kyc_bypass": ['kyc bypass', 'verification bypass', 'identity verification'],
        "deepfake": ['deepfake', 'face swap', 'voice clone'],
        "synthetic_identity": ['synthetic identity', 'identity kit', 'persona pack'],
        "document_forgery": ['fake document', 'forged document', 'counterfeit']
    }
    
    for category, patterns in service_patterns.items():
        if any(pattern in text_lower for pattern in patterns):
            categories.append(category)
    
    return categories


def detect_language(text: str) -> str:
    """
    Basic language detection.
    
    Returns language code (en, es, fr, etc.) or 'unknown'.
    """
    # Common words in different languages
    language_indicators = {
        'en': ['the', 'and', 'is', 'are', 'was', 'were', 'this', 'that', 'with', 'for'],
        'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
        'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
        'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
        'it': ['il', 'di', 'che', 'e', 'la', 'a', 'per', 'in', 'un', 'è'],
        'pt': ['o', 'de', 'a', 'e', 'do', 'da', 'em', 'um', 'para', 'é']
    }
    
    text_lower = text.lower()
    scores = {}
    
    for lang, words in language_indicators.items():
        score = sum(1 for word in words if word in text_lower)
        scores[lang] = score
    
    if scores:
        detected_lang = max(scores, key=scores.get)
        if scores[detected_lang] > 3:  # Threshold
            return detected_lang
    
    return 'en'  # Default to English

