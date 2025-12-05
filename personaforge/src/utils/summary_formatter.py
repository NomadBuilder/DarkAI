"""
Utility to format and clean vendor intelligence summaries for professional display.
"""

import re
from typing import Optional


def format_summary(summary: Optional[str]) -> str:
    """
    Format a vendor summary to be more professional and readable.
    
    Args:
        summary: Raw summary text from database
        
    Returns:
        Formatted, professional summary text
    """
    if not summary:
        return ""
    
    # Remove extra whitespace
    text = ' '.join(summary.split())
    
    # Fix common issues
    # Fix "server" -> "serve" (common typo)
    text = re.sub(r'\bserver\s+(\d+)', r'serve \1', text, flags=re.IGNORECASE)
    
    # Fix "its" -> "it's" when appropriate
    text = re.sub(r'\bits\s+scannable\b', "it's scannable", text, flags=re.IGNORECASE)
    text = re.sub(r'\bits\s+claiming\b', "it's claiming", text, flags=re.IGNORECASE)
    
    # Capitalize first letter
    if text and text[0].islower():
        text = text[0].upper() + text[1:]
    
    # Ensure proper sentence endings
    if text and not text[-1] in '.!?':
        text += '.'
    
    # Fix spacing around punctuation
    text = re.sub(r'\s+([,.!?])', r'\1', text)
    text = re.sub(r'([,.!?])([^\s])', r'\1 \2', text)
    
    # Fix common abbreviations and expand for clarity
    text = re.sub(r'\bid\s+ssn\b', 'ID and SSN', text, flags=re.IGNORECASE)
    text = re.sub(r'\bssn\s+id\b', 'SSN and ID', text, flags=re.IGNORECASE)
    text = re.sub(r'\bdriver\s+license\b', 'driver\'s license', text, flags=re.IGNORECASE)
    text = re.sub(r'\bfake\s+id\b', 'fake ID', text, flags=re.IGNORECASE)
    
    # Expand abbreviations for clarity
    text = re.sub(r'\bkyc\s+bypass\b', 'KYC (Know Your Customer) bypass', text, flags=re.IGNORECASE)
    text = re.sub(r'\bkyc\s+verification\b', 'KYC (Know Your Customer) verification', text, flags=re.IGNORECASE)
    text = re.sub(r'\bkyc\s+service\b', 'KYC (Know Your Customer) service', text, flags=re.IGNORECASE)
    text = re.sub(r'\bssn\b', 'SSN (Social Security Number)', text, flags=re.IGNORECASE)
    text = re.sub(r'\bcpn\b', 'CPN (Credit Privacy Number)', text, flags=re.IGNORECASE)
    text = re.sub(r'\bdl\b', 'driver\'s license', text, flags=re.IGNORECASE)
    
    # Fix "customer" -> "customers" when referring to multiple
    text = re.sub(r'(\d+[,\d]*)\s+customer\b', r'\1 customers', text, flags=re.IGNORECASE)
    
    # Clarify technical terms - keep "scannable" but ensure proper capitalization
    text = re.sub(r'\bscannable\b', 'scannable', text, flags=re.IGNORECASE)
    
    # Fix numbers with commas (customer counts)
    text = re.sub(r'(\d+),(\d+)', r'\1,\2', text)
    
    # Break up very long sentences (over 200 chars) into multiple sentences
    sentences = re.split(r'([.!?]\s+)', text)
    formatted_sentences = []
    current_sentence = ""
    
    for part in sentences:
        if part.strip() in '.!?':
            current_sentence += part
            if len(current_sentence.strip()) > 200:
                # Try to split on commas or conjunctions
                parts = re.split(r'([,;]\s+)', current_sentence)
                if len(parts) > 1:
                    # Split into two sentences
                    mid_point = len(parts) // 2
                    first_half = ''.join(parts[:mid_point])
                    second_half = ''.join(parts[mid_point:])
                    if first_half.strip():
                        formatted_sentences.append(first_half.strip() + '.')
                    if second_half.strip():
                        current_sentence = second_half
                else:
                    formatted_sentences.append(current_sentence.strip())
                    current_sentence = ""
            else:
                formatted_sentences.append(current_sentence.strip())
                current_sentence = ""
        else:
            current_sentence += part
    
    if current_sentence.strip():
        formatted_sentences.append(current_sentence.strip())
    
    result = ' '.join(formatted_sentences)
    
    # Final cleanup
    result = re.sub(r'\s+', ' ', result)  # Multiple spaces to single
    result = result.strip()
    
    # Ensure proper capitalization for common terms
    result = re.sub(r'\badvertising\b', 'Advertising', result, flags=re.IGNORECASE)
    result = re.sub(r'\bclaiming\b', 'claiming', result, flags=re.IGNORECASE)
    result = re.sub(r'\bcustomer\b', 'customer', result, flags=re.IGNORECASE)
    result = re.sub(r'\bscannable\b', 'scannable', result, flags=re.IGNORECASE)
    
    return result


def format_summary_for_display(summary: Optional[str], max_length: int = 500) -> str:
    """
    Format summary and optionally truncate for display.
    
    Args:
        summary: Raw summary text
        max_length: Maximum length for display (0 = no limit)
        
    Returns:
        Formatted summary, optionally truncated
    """
    formatted = format_summary(summary)
    
    if max_length > 0 and len(formatted) > max_length:
        # Truncate at word boundary
        truncated = formatted[:max_length]
        last_space = truncated.rfind(' ')
        if last_space > max_length * 0.8:  # Only truncate at word if we're not losing too much
            truncated = truncated[:last_space]
        return truncated + '...'
    
    return formatted

