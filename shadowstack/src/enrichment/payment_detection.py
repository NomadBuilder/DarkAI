"""Payment processor detection module."""

import requests
from typing import List, Optional


def detect_payment_processors(domain: str) -> List[str]:
    """Detect payment processors used by a domain."""
    processors = []
    
    # Known payment processor indicators
    payment_indicators = {
        "stripe": ["stripe.com", "js.stripe.com", "checkout.stripe.com"],
        "paypal": ["paypal.com", "paypalobjects.com"],
        "square": ["square.com", "squareup.com"],
        "braintree": ["braintreegateway.com"],
        "coinbase": ["coinbase.com", "commerce.coinbase.com"],
        "bitpay": ["bitpay.com"],
        "crypto": ["crypto.com", "binance.com", "bitcoin.org"]
    }
    
    try:
        url = f"http://{domain}" if not domain.startswith("http") else domain
        response = requests.get(url, timeout=10, allow_redirects=True)
        
        content = response.text.lower()
        
        # Check for payment processor references in HTML
        for processor, indicators in payment_indicators.items():
            for indicator in indicators:
                if indicator in content:
                    if processor not in processors:
                        processors.append(processor)
        
        # Check for common payment button classes/IDs
        payment_patterns = [
            "paypal-button",
            "stripe-button",
            "checkout-button",
            "payment-button"
        ]
        
        for pattern in payment_patterns:
            if pattern in content:
                # Could be various processors, mark as detected but unknown
                if "unknown" not in processors:
                    processors.append("unknown")
    
    except Exception as e:
        print(f"Payment processor detection failed for {domain}: {e}")
    
    return processors

