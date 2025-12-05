"""Content-based clustering module for grouping vendors by similar descriptions."""

from typing import Dict, List, Tuple
from collections import defaultdict
import re
from math import sqrt


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculate cosine similarity between two texts using TF-IDF-like approach.
    
    Args:
        text1: First text
        text2: Second text
        
    Returns:
        Similarity score between 0 and 1
    """
    if not text1 or not text2:
        return 0.0
    
    # Tokenize and normalize
    def tokenize(text: str) -> List[str]:
        # Remove punctuation, lowercase, split
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        return [word for word in text.split() if len(word) > 2]
    
    words1 = tokenize(text1)
    words2 = tokenize(text2)
    
    if not words1 or not words2:
        return 0.0
    
    # Create word frequency vectors
    all_words = set(words1 + words2)
    vec1 = [words1.count(word) for word in all_words]
    vec2 = [words2.count(word) for word in all_words]
    
    # Calculate cosine similarity
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = sqrt(sum(a * a for a in vec1))
    magnitude2 = sqrt(sum(a * a for a in vec2))
    
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    
    similarity = dot_product / (magnitude1 * magnitude2)
    return similarity


def extract_combined_text(vendor: Dict) -> str:
    """
    Extract and combine all textual content from a vendor record.
    
    Args:
        vendor: Vendor dictionary with summary, telegram_description, etc.
        
    Returns:
        Combined text string
    """
    text_parts = []
    
    # Add summary
    if vendor.get('summary'):
        text_parts.append(vendor['summary'])
    
    # Add telegram description
    if vendor.get('telegram_description'):
        text_parts.append(vendor['telegram_description'])
    
    # Add title
    if vendor.get('title'):
        text_parts.append(vendor['title'])
    
    # Add services as text
    if vendor.get('services'):
        services = vendor['services']
        if isinstance(services, list):
            text_parts.append(' '.join(services))
        elif isinstance(services, str):
            text_parts.append(services)
    
    # Combine all parts
    combined = ' '.join(text_parts)
    
    # Clean up whitespace
    combined = re.sub(r'\s+', ' ', combined).strip()
    
    return combined


def detect_content_clusters(vendors: List[Dict], similarity_threshold: float = 0.6, min_cluster_size: int = 2) -> List[Dict]:
    """
    Detect content-based clusters by grouping vendors with similar descriptions.
    
    Uses cosine similarity to find vendors with similar text content.
    This can reveal:
    - Copy-paste operations (identical descriptions)
    - Shared operators (similar marketing language)
    - Vendor networks (related descriptions)
    
    Args:
        vendors: List of vendor dictionaries
        similarity_threshold: Minimum similarity score to group vendors (0-1)
        min_cluster_size: Minimum number of vendors in a cluster
        
    Returns:
        List of cluster dictionaries
    """
    if not vendors or len(vendors) < min_cluster_size:
        return []
    
    # Extract combined text for each vendor
    vendor_texts = {}
    for vendor in vendors:
        vendor_id = vendor.get('id')
        if not vendor_id:
            continue
        
        combined_text = extract_combined_text(vendor)
        if len(combined_text) < 20:  # Skip vendors with too little text
            continue
        
        vendor_texts[vendor_id] = {
            'vendor': vendor,
            'text': combined_text
        }
    
    if len(vendor_texts) < min_cluster_size:
        return []
    
    # Calculate similarity matrix
    similarities = {}
    vendor_ids = list(vendor_texts.keys())
    
    for i, vid1 in enumerate(vendor_ids):
        for vid2 in vendor_ids[i+1:]:
            text1 = vendor_texts[vid1]['text']
            text2 = vendor_texts[vid2]['text']
            similarity = calculate_text_similarity(text1, text2)
            
            if similarity >= similarity_threshold:
                key = tuple(sorted([vid1, vid2]))
                similarities[key] = similarity
    
    # Group vendors into clusters using connected components
    clusters = []
    visited = set()
    
    def find_connected_component(start_id: int) -> List[int]:
        """Find all vendors connected to start_id through similarity."""
        component = []
        stack = [start_id]
        
        while stack:
            current_id = stack.pop()
            if current_id in visited:
                continue
            
            visited.add(current_id)
            component.append(current_id)
            
            # Find all vendors similar to current
            for (id1, id2), sim in similarities.items():
                if current_id == id1 and id2 not in visited:
                    stack.append(id2)
                elif current_id == id2 and id1 not in visited:
                    stack.append(id1)
        
        return component
    
    # Find all connected components (clusters)
    for vendor_id in vendor_ids:
        if vendor_id in visited:
            continue
        
        component = find_connected_component(vendor_id)
        
        if len(component) >= min_cluster_size:
            # Calculate average similarity within cluster
            cluster_similarities = []
            for i, vid1 in enumerate(component):
                for vid2 in component[i+1:]:
                    key = tuple(sorted([vid1, vid2]))
                    if key in similarities:
                        cluster_similarities.append(similarities[key])
            
            avg_similarity = sum(cluster_similarities) / len(cluster_similarities) if cluster_similarities else 0.0
            
            # Get vendor details
            cluster_vendors = [vendor_texts[vid]['vendor'] for vid in component]
            
            # Extract common keywords
            all_texts = [vendor_texts[vid]['text'] for vid in component]
            common_keywords = extract_common_keywords(all_texts)
            
            clusters.append({
                'type': 'Content Similarity',
                'vendor_count': len(component),
                'average_similarity': round(avg_similarity, 3),
                'vendors': cluster_vendors,
                'vendor_ids': component,
                'common_keywords': common_keywords,
                'sample_text': vendor_texts[component[0]]['text'][:200] + '...' if vendor_texts[component[0]]['text'] else ''
            })
    
    # Sort by cluster size and similarity
    clusters.sort(key=lambda c: (c['vendor_count'], c['average_similarity']), reverse=True)
    
    return clusters


def extract_common_keywords(texts: List[str], top_n: int = 10) -> List[str]:
    """
    Extract common keywords across multiple texts.
    
    Args:
        texts: List of text strings
        top_n: Number of top keywords to return
        
    Returns:
        List of common keywords
    """
    from collections import Counter
    
    # Stop words to filter out
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'this', 'that', 'these', 'those', 'all', 'each', 'every', 'both',
        'we', 'our', 'you', 'your', 'they', 'their', 'them', 'can', 'may',
        'more', 'most', 'some', 'any', 'no', 'not', 'only', 'just', 'now',
        'then', 'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which'
    }
    
    # Count word frequency across all texts
    word_counts = Counter()
    
    for text in texts:
        # Tokenize
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())
        # Filter stop words
        words = [w for w in words if w not in stop_words]
        word_counts.update(words)
    
    # Get words that appear in at least 2 texts
    common_words = [word for word, count in word_counts.most_common(top_n * 2) if count >= 2]
    
    return common_words[:top_n]


def detect_exact_duplicates(vendors: List[Dict]) -> List[Dict]:
    """
    Detect vendors with identical or near-identical descriptions.
    
    This is a special case of content clustering for exact duplicates.
    
    Args:
        vendors: List of vendor dictionaries
        
    Returns:
        List of duplicate cluster dictionaries
    """
    if not vendors:
        return []
    
    # Group by normalized text
    text_groups = defaultdict(list)
    
    for vendor in vendors:
        combined_text = extract_combined_text(vendor)
        if not combined_text:
            continue
        
        # Normalize: lowercase, remove extra whitespace
        normalized = re.sub(r'\s+', ' ', combined_text.lower()).strip()
        
        # Use first 500 chars as key (to catch near-duplicates)
        key = normalized[:500]
        
        text_groups[key].append(vendor)
    
    # Find groups with 2+ vendors (duplicates)
    duplicate_clusters = []
    
    for normalized_text, group_vendors in text_groups.items():
        if len(group_vendors) >= 2:
            duplicate_clusters.append({
                'type': 'Exact Duplicate',
                'vendor_count': len(group_vendors),
                'average_similarity': 1.0,  # Exact duplicates
                'vendors': group_vendors,
                'vendor_ids': [v.get('id') for v in group_vendors if v.get('id')],
                'common_keywords': extract_common_keywords([extract_combined_text(v) for v in group_vendors]),
                'sample_text': normalized_text[:200] + '...' if len(normalized_text) > 200 else normalized_text
            })
    
    # Sort by cluster size
    duplicate_clusters.sort(key=lambda c: c['vendor_count'], reverse=True)
    
    return duplicate_clusters


def detect_content_clusters_from_db(postgres_client, similarity_threshold: float = 0.6, min_cluster_size: int = 2, include_duplicates: bool = True) -> List[Dict]:
    """
    Detect content-based clusters from database.
    
    Args:
        postgres_client: PostgreSQL client instance
        similarity_threshold: Minimum similarity score (0-1)
        min_cluster_size: Minimum vendors per cluster
        include_duplicates: Whether to include exact duplicate detection
        
    Returns:
        List of cluster dictionaries
    """
    if not postgres_client or not postgres_client.conn:
        return []
    
    try:
        # Get all vendors
        vendors = postgres_client.get_all_vendors_intel()
        
        if not vendors:
            return []
        
        clusters = []
        
        # Detect exact duplicates first (if enabled)
        if include_duplicates:
            duplicate_clusters = detect_exact_duplicates(vendors)
            clusters.extend(duplicate_clusters)
        
        # Detect similarity-based clusters
        similarity_clusters = detect_content_clusters(vendors, similarity_threshold, min_cluster_size)
        clusters.extend(similarity_clusters)
        
        # Remove duplicates (vendors already in duplicate clusters shouldn't be in similarity clusters)
        if include_duplicates and duplicate_clusters:
            duplicate_vendor_ids = set()
            for dup_cluster in duplicate_clusters:
                duplicate_vendor_ids.update(dup_cluster['vendor_ids'])
            
            # Filter similarity clusters to exclude duplicate vendors
            filtered_similarity = []
            for cluster in similarity_clusters:
                cluster_vendor_ids = set(cluster['vendor_ids'])
                if not cluster_vendor_ids.intersection(duplicate_vendor_ids):
                    filtered_similarity.append(cluster)
            
            # Rebuild clusters list
            clusters = duplicate_clusters + filtered_similarity
        
        return clusters
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Content clustering failed: {e}", exc_info=True)
        return []

