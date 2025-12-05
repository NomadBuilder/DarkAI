"""Content extraction and cleaning utilities."""

import re
from typing import Dict, List, Optional
from bs4 import BeautifulSoup


def extract_pricing_information(text: str) -> List[Dict]:
    """
    Extract pricing information from text.
    
    Returns:
        List of pricing dictionaries with amount, currency, and context
    """
    pricing = []
    
    # Price patterns
    patterns = [
        (r'\$([\d,]+\.?\d*)', 'USD'),
        (r'€([\d,]+\.?\d*)', 'EUR'),
        (r'£([\d,]+\.?\d*)', 'GBP'),
        (r'([\d,]+\.?\d*)\s*btc', 'BTC'),
        (r'([\d,]+\.?\d*)\s*eth', 'ETH'),
        (r'([\d,]+\.?\d*)\s*usd', 'USD'),
        (r'([\d,]+\.?\d*)\s*eur', 'EUR'),
    ]
    
    for pattern, currency in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            amount_str = match.group(1).replace(',', '')
            try:
                amount = float(amount_str)
                # Get context (50 chars before and after)
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 50)
                context = text[start:end].strip()
                
                pricing.append({
                    "amount": amount,
                    "currency": currency,
                    "context": context
                })
            except ValueError:
                continue
    
    return pricing


def extract_contact_information(text: str, html: str = None) -> Dict:
    """
    Extract contact information (emails, phone numbers, etc.).
    
    Returns:
        Dictionary with contact methods found
    """
    result = {
        "emails": [],
        "phone_numbers": [],
        "telegram": [],
        "discord": [],
        "other": []
    }
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    result["emails"] = list(set(emails))[:10]  # Limit to 10 unique emails
    
    # Phone number patterns (US format)
    phone_patterns = [
        r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
        r'\+?([0-9]{1,3})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})',
    ]
    
    for pattern in phone_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            phone = ''.join(match)
            if len(phone) >= 10:
                result["phone_numbers"].append(phone)
    
    result["phone_numbers"] = list(set(result["phone_numbers"]))[:10]
    
    # Telegram patterns
    telegram_patterns = [
        r'telegram[:\s]+@?([a-z0-9_]+)',
        r't\.me/([a-z0-9_]+)',
        r'@([a-z0-9_]+).*telegram',
    ]
    
    for pattern in telegram_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            username = f"@{match}" if not match.startswith('@') else match
            if username not in result["telegram"]:
                result["telegram"].append(username)
    
    # Discord patterns
    discord_patterns = [
        r'discord\.gg/([a-z0-9]+)',
        r'discord\.com/invite/([a-z0-9]+)',
    ]
    
    for pattern in discord_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            invite = f"discord.gg/{match}"
            if invite not in result["discord"]:
                result["discord"].append(invite)
    
    # Extract from HTML if provided
    if html:
        soup = BeautifulSoup(html, 'lxml')
        
        # Find mailto links
        mailto_links = soup.find_all('a', href=re.compile(r'^mailto:'))
        for link in mailto_links:
            email = link.get('href', '').replace('mailto:', '').split('?')[0]
            if email and email not in result["emails"]:
                result["emails"].append(email)
        
        # Find tel links
        tel_links = soup.find_all('a', href=re.compile(r'^tel:'))
        for link in tel_links:
            phone = link.get('href', '').replace('tel:', '').replace('-', '').replace(' ', '')
            if phone and phone not in result["phone_numbers"]:
                result["phone_numbers"].append(phone)
    
    return result


def extract_service_descriptions(text: str) -> List[str]:
    """
    Extract service descriptions from text.
    
    Looks for patterns like "We offer...", "Our services include...", etc.
    """
    descriptions = []
    
    # Service description patterns
    patterns = [
        r'we (?:offer|provide|sell|create|deliver).{0,300}',
        r'our (?:service|product|kit|pack|offering).{0,300}',
        r'what we (?:offer|provide|sell).{0,300}',
        r'our (?:specialty|specialties|expertise).{0,300}',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            # Clean up the match
            cleaned = re.sub(r'\s+', ' ', match).strip()
            if len(cleaned) > 20:  # Only keep substantial descriptions
                descriptions.append(cleaned[:500])  # Limit length
    
    return list(set(descriptions))[:10]  # Limit to 10 unique descriptions


def extract_faqs(html: str) -> List[Dict]:
    """
    Extract FAQ items from HTML.
    
    Looks for common FAQ patterns (dl/dt/dd, divs with question/answer classes, etc.)
    """
    faqs = []
    
    try:
        soup = BeautifulSoup(html, 'lxml')
        
        # Pattern 1: Definition lists (dl/dt/dd)
        dl_elements = soup.find_all('dl')
        for dl in dl_elements:
            dts = dl.find_all('dt')
            dds = dl.find_all('dd')
            for dt, dd in zip(dts, dds):
                question = dt.get_text(strip=True)
                answer = dd.get_text(strip=True)
                if question and answer:
                    faqs.append({"question": question, "answer": answer})
        
        # Pattern 2: Divs with FAQ classes
        faq_divs = soup.find_all(['div', 'section'], class_=re.compile(r'faq|question|answer', re.I))
        for div in faq_divs:
            question_elem = div.find(['h1', 'h2', 'h3', 'h4', 'strong', 'b'])
            if question_elem:
                question = question_elem.get_text(strip=True)
                # Get text after the question
                answer = div.get_text(strip=True).replace(question, '').strip()
                if question and answer and len(answer) > 10:
                    faqs.append({"question": question, "answer": answer[:500]})
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"FAQ extraction failed: {e}")
    
    return faqs[:20]  # Limit to 20 FAQs

