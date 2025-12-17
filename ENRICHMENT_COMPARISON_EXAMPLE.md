# Enrichment Data Comparison: celebfakes.net

## BEFORE (Current Enrichment - Free Tools Only)

### Basic Data Collected:
```json
{
  "domain": "celebfakes.net",
  "ip_address": "104.21.112.1",
  "ip_addresses": ["104.21.112.1", "172.67.128.1"],
  "host_name": "Cloudflare, Inc.",
  "asn": "13335",
  "isp": "Cloudflare, Inc.",
  "cdn": "Cloudflare",
  "cms": "WordPress",
  "registrar": "Namecheap, Inc.",
  "creation_date": "2023-05-15",
  "expiration_date": "2024-05-15",
  "name_servers": ["ns1.cloudflare.com", "ns2.cloudflare.com"],
  "mx_records": [],
  "web_server": "cloudflare",
  "payment_processor": "Stripe",
  "frameworks": ["jQuery", "Bootstrap"],
  "analytics": ["Google Analytics"],
  "tech_stack": {
    "cms": "WordPress",
    "cdn": "Cloudflare",
    "frameworks": ["jQuery", "Bootstrap"]
  },
  "http_headers": {
    "server": "cloudflare",
    "status_code": 200
  },
  "dns_records": {
    "A": ["104.21.112.1", "172.67.128.1"],
    "AAAA": [],
    "MX": [],
    "NS": ["ns1.cloudflare.com", "ns2.cloudflare.com"]
  }
}
```

### What We Know:
- ✅ Current IP addresses
- ✅ Basic hosting/CDN info (Cloudflare)
- ✅ CMS (WordPress)
- ✅ Registrar (Namecheap)
- ✅ Basic tech stack
- ✅ Current DNS records

### What We DON'T Know:
- ❌ Subdomains (www, api, admin, etc.)
- ❌ Historical IP changes
- ❌ WHOIS ownership history
- ❌ Related domains (same registrant)
- ❌ SSL certificate details
- ❌ Other domains on same IP
- ❌ Domain security tags/classifications

---

## AFTER (With SecurityTrails + WhoisXML APIs)

### Enhanced Data Collected:
```json
{
  "domain": "celebfakes.net",
  "ip_address": "104.21.112.1",
  "ip_addresses": ["104.21.112.1", "172.67.128.1"],
  "host_name": "Cloudflare, Inc.",
  "asn": "13335",
  "isp": "Cloudflare, Inc.",
  "cdn": "Cloudflare",
  "cms": "WordPress",
  "registrar": "Namecheap, Inc.",
  "creation_date": "2023-05-15",
  "expiration_date": "2024-05-15",
  "name_servers": ["ns1.cloudflare.com", "ns2.cloudflare.com"],
  "mx_records": [],
  "web_server": "cloudflare",
  "payment_processor": "Stripe",
  "frameworks": ["jQuery", "Bootstrap"],
  "analytics": ["Google Analytics"],
  "tech_stack": {
    "cms": "WordPress",
    "cdn": "Cloudflare",
    "frameworks": ["jQuery", "Bootstrap"]
  },
  "http_headers": {
    "server": "cloudflare",
    "status_code": 200
  },
  "dns_records": {
    "A": ["104.21.112.1", "172.67.128.1"],
    "AAAA": [],
    "MX": [],
    "NS": ["ns1.cloudflare.com", "ns2.cloudflare.com"]
  },
  
  // ===== NEW: SecurityTrails Data =====
  "securitytrails": {
    "available": true,
    "subdomains": [
      "www.celebfakes.net",
      "api.celebfakes.net",
      "admin.celebfakes.net",
      "cdn.celebfakes.net",
      "mail.celebfakes.net"
    ],
    "subdomain_count": 5,
    "historical_dns": [
      "152.89.61.52",  // Old IP from 6 months ago
      "91.208.115.115", // Old IP from 4 months ago
      "104.21.112.1"    // Current IP
    ],
    "whois_history": [
      {
        "date": "2023-05-15",
        "registrar": "Namecheap, Inc.",
        "registrant": "Privacy Protection Service"
      },
      {
        "date": "2022-11-20",
        "registrar": "GoDaddy.com, LLC",
        "registrant": "John Doe"
      }
    ],
    "associated_domains": [],
    "dns_records": {
      "a": ["104.21.112.1", "172.67.128.1"],
      "aaaa": [],
      "mx": ["mail.celebfakes.net"],
      "ns": ["ns1.cloudflare.com", "ns2.cloudflare.com"],
      "txt": ["v=spf1 include:_spf.google.com ~all"]
    },
    "tags": ["malicious", "phishing"]  // Security classifications
  },
  
  "securitytrails_ip": {
    "available": true,
    "associated_domains": [
      "celebfakes.net",
      "anothersite.com",
      "yetanother.com"
    ],
    "domain_count": 15,  // 15 domains on same IP
    "nearby_ips": [
      "104.21.112.0/24",
      "104.21.113.0/24"
    ],
    "ip_info": {
      "organization": "Cloudflare, Inc.",
      "asn": "13335"
    }
  },
  
  // ===== NEW: WhoisXML Data =====
  "whoisxml": {
    "available": true,
    "whois_data": {
      "registrar": "Namecheap, Inc.",
      "registrant_name": "Privacy Protection Service",
      "registrant_organization": "WhoisGuard, Inc.",
      "registrant_email": "abuse@whoisguard.com",  // Privacy protected, but we get the proxy
      "registrant_country": "PA",  // Panama (privacy service)
      "admin_email": "abuse@whoisguard.com",
      "tech_email": "abuse@whoisguard.com",
      "creation_date": "2023-05-15T00:00:00Z",
      "expiration_date": "2024-05-15T00:00:00Z",
      "updated_date": "2023-11-20T00:00:00Z",
      "name_servers": [
        "ns1.cloudflare.com",
        "ns2.cloudflare.com"
      ]
    },
    "dns_records": {
      "a": ["104.21.112.1", "172.67.128.1"],
      "aaaa": [],
      "mx": ["mail.celebfakes.net"],
      "ns": ["ns1.cloudflare.com", "ns2.cloudflare.com"],
      "txt": [
        "v=spf1 include:_spf.google.com ~all",
        "google-site-verification=abc123..."
      ]
    },
    "ssl_certificates": [
      {
        "issuer": "Cloudflare Inc ECC CA-3",
        "valid_from": "2023-05-15",
        "valid_to": "2024-05-15",
        "serial_number": "1234567890abcdef"
      }
    ],
    "domain_availability": "registered",
    "registrant_domains": [  // Reverse WHOIS - domains with same registrant
      "celebfakes.net",
      "deepfakesite1.com",
      "deepfakesite2.com",
      "deepfakesite3.org"
    ]
  },
  
  "whoisxml_history": {
    "available": true,
    "history": [
      {
        "date": "2023-05-15",
        "registrar": "Namecheap, Inc.",
        "registrant": "Privacy Protection Service"
      },
      {
        "date": "2022-11-20",
        "registrar": "GoDaddy.com, LLC",
        "registrant": "John Doe"
      },
      {
        "date": "2021-08-10",
        "registrar": "GoDaddy.com, LLC",
        "registrant": "Jane Smith"
      }
    ]
  }
}
```

---

## Key Improvements

### 1. **Subdomain Discovery** 🎯
**Before:** No subdomains known  
**After:** Found 5 subdomains (www, api, admin, cdn, mail)
- **Use Case:** Map full infrastructure, find admin panels, API endpoints

### 2. **Historical IP Tracking** 📊
**Before:** Only current IP  
**After:** Historical IPs showing:
- `152.89.61.52` (6 months ago - Ukraine)
- `91.208.115.115` (4 months ago - Ukraine)  
- `104.21.112.1` (current - Cloudflare)
- **Use Case:** Track infrastructure changes, find original hosting location before CDN

### 3. **Reverse WHOIS / Related Domains** 🔗
**Before:** No related domains  
**After:** Found 3 related domains:
- `deepfakesite1.com`
- `deepfakesite2.com`
- `deepfakesite3.org`
- **Use Case:** Map entire infrastructure network, find all sites by same operator

### 4. **WHOIS History** 📜
**Before:** Only current registrar  
**After:** Complete ownership history:
- 2023-05-15: Namecheap (current)
- 2022-11-20: GoDaddy (previous)
- 2021-08-10: GoDaddy (original)
- **Use Case:** Track domain transfers, ownership changes, identify patterns

### 5. **Security Classifications** ⚠️
**Before:** No threat intelligence  
**After:** Domain tags: `["malicious", "phishing"]`
- **Use Case:** Automated threat detection, risk scoring

### 6. **Shared IP Analysis** 🌐
**Before:** Don't know what else is on IP  
**After:** 15 domains on same IP, including:
- `anothersite.com`
- `yetanother.com`
- **Use Case:** Find related malicious sites, infrastructure clustering

### 7. **Enhanced WHOIS Data** 📋
**Before:** Basic registrar info  
**After:** Complete registrant details:
- Privacy service identification
- Admin/tech contacts
- Country of registration
- **Use Case:** Better attribution, contact information

### 8. **SSL Certificate Data** 🔒
**Before:** No certificate info  
**After:** Certificate details:
- Issuer: Cloudflare
- Validity dates
- Serial numbers
- **Use Case:** Certificate chain analysis, expiration tracking

---

## Real-World Impact

### Infrastructure Mapping:
- **Before:** Know about 1 domain
- **After:** Know about 1 domain + 5 subdomains + 3 related domains + 15 domains on same IP = **24 total entities**

### Threat Intelligence:
- **Before:** No threat data
- **After:** Security tags, historical IPs showing original location (Ukraine), related malicious domains

### Attribution:
- **Before:** Privacy-protected WHOIS
- **After:** Privacy service identified, related domains found via reverse WHOIS, ownership history tracked

### Infrastructure Changes:
- **Before:** Only see current state
- **After:** See IP moved from Ukraine → Cloudflare, registrar changed from GoDaddy → Namecheap

---

## Summary

**Before:** Basic domain info (IP, registrar, CMS, tech stack)  
**After:** Complete infrastructure map with history, related domains, subdomains, threat intelligence, and ownership tracking

The new APIs transform ShadowStack from a basic domain checker into a comprehensive infrastructure intelligence platform! 🚀

