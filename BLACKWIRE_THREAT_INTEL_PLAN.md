# BlackWire Threat Intelligence Integration Plan

## Overview
This plan outlines integrating external threat intelligence databases to make BlackWire more effective at detecting sextortion/extortion infrastructure.

---

## 📊 Data Source Breakdown

### ✅ **NO API KEY REQUIRED** (Free/Public APIs)

#### 1. **PhishTank API** (Phishing Database)
- **URL**: `https://www.phishtank.com/api_info.php`
- **Cost**: Free, no API key needed
- **Rate Limit**: 1 request per 5 seconds
- **What it provides**: Phishing URLs, domains, verification status
- **Implementation**: Simple HTTP GET requests
- **Status**: ✅ Can implement immediately

#### 2. **OpenPhish** (Phishing Feeds)
- **URL**: `https://openphish.com/feed.txt`
- **Cost**: Free, no API key needed
- **Rate Limit**: None (public feed)
- **What it provides**: List of phishing URLs (updated hourly)
- **Implementation**: Download feed, parse, check against domains
- **Status**: ✅ Can implement immediately

#### 3. **Spamhaus Blocklists** (Spam/Malware Domains)
- **URL**: `https://www.spamhaus.org/drop/` (multiple lists)
- **Cost**: Free, no API key needed
- **Rate Limit**: None (downloadable lists)
- **What it provides**: 
  - DROP (Don't Route Or Peer) - bad IPs
  - DROP-EDROP - extended list
  - Domain blocklists
- **Implementation**: Download lists, cache locally, check against domains/IPs
- **Status**: ✅ Can implement immediately

#### 4. **SURBL** (Spam URI Blocklist)
- **URL**: `http://www.surbl.org/lists.html`
- **Cost**: Free, no API key needed
- **Rate Limit**: None (DNS-based lookup)
- **What it provides**: Spam domain list (DNS lookup)
- **Implementation**: DNS query to `multi.surbl.org`
- **Status**: ✅ Can implement immediately

#### 5. **Community GitHub Lists** (Scam Accounts/Numbers)
- **Sources**: 
  - Various GitHub repos with scam account lists
  - Community-maintained spam number databases
- **Cost**: Free, no API key needed
- **Rate Limit**: GitHub API rate limits (60/hour unauthenticated)
- **What it provides**: Lists of known scam Instagram accounts, spam phone numbers
- **Implementation**: Scrape/parse GitHub repos, cache locally
- **Status**: ✅ Can implement immediately (with rate limiting)

#### 6. **abuse.ch URLhaus** (Already Integrated)
- **Status**: ✅ Already working, no changes needed

#### 7. **abuse.ch ThreatFox** (Already Integrated)
- **Status**: ✅ Already working, no changes needed

---

### 🔑 **REQUIRES API KEY** (You Need to Sign Up)

#### 1. ~~**TrueCaller API**~~ (Not Available)
- **Status**: ❌ User confirmed TrueCaller API is not available
- **Note**: Removed from plan

#### 2. **Hiya API** (Phone Reputation)
- **URL**: `https://www.hiya.com/api`
- **Cost**: 
  - Free tier: 1,000 requests/month
  - Paid: $0.01-0.05 per lookup
- **What it provides**: 
  - Spam call database
  - Caller reputation score
  - Fraud detection
- **API Key**: Required (sign up at hiya.com/api)
- **Priority**: 🔥 **HIGH** - Good alternative to TrueCaller
- **Status**: ⏳ Needs your API key

#### 3. **Google Safe Browsing API** (Domain Threats)
- **URL**: `https://developers.google.com/safe-browsing`
- **Cost**: 
  - Free tier: 10,000 requests/day
  - Paid: $0.0001 per request after free tier
- **What it provides**: 
  - Malware/phishing domain detection
  - Real-time threat status
- **API Key**: Required (get from Google Cloud Console)
- **Priority**: ⭐ **MEDIUM** - Good supplement to VirusTotal
- **Status**: ⏳ Needs your API key

#### 4. **OpenCNAM** (Caller ID + Spam Indicators)
- **URL**: `https://www.opencnam.com/`
- **Cost**: 
  - Free tier: 100 requests/day
  - Paid: $0.01 per lookup
- **What it provides**: 
  - Caller ID information
  - Spam indicators
  - Carrier info
- **API Key**: Required (sign up at opencnam.com)
- **Priority**: ⭐ **MEDIUM** - Nice to have, not critical
- **Status**: ⏳ Needs your API key

#### 5. **VirusTotal API** (Already Integrated)
- **Status**: ✅ Already working, but check if you have API key set
- **Note**: Free tier is 4 requests/minute

#### 6. **NumLookup API** (Already Integrated)
- **Status**: ✅ Already working, but check if you have API key set

---

## 🚀 Implementation Phases

### **Phase 1: Free APIs (No API Keys Needed)** ⏱️ **~2-3 hours**

**Can implement immediately:**

1. **PhishTank Integration**
   - Add `_check_phishtank()` function
   - Integrate into `_check_domain_threats()`
   - Cache results for 24 hours

2. **OpenPhish Feed Parser**
   - Download feed daily
   - Parse and store in local cache
   - Check domains against cached list

3. **Spamhaus Blocklist Integration**
   - Download DROP lists
   - Cache locally (update weekly)
   - Check IPs against blocklists

4. **SURBL DNS Lookup**
   - Add DNS-based SURBL check
   - Cache results

5. **Community GitHub Lists**
   - Scrape known scam account lists
   - Parse and cache locally
   - Check Instagram handles against lists

**Files to modify:**
- `blackwire/src/enrichment/threat_intel.py` - Add new check functions
- `blackwire/src/enrichment/phone_enrichment.py` - Add community list checks
- `blackwire/src/enrichment/messaging_enrichment.py` - Add Instagram list checks

---

### **Phase 2: API Key Required (After You Get Keys)** ⏱️ **~3-4 hours**

**Requires your API keys:**

1. **Hiya API** (Phone reputation)
   - Add `_check_hiya()` function
   - Use as fallback if TrueCaller fails
   - Handle rate limiting (1,000/month free tier)

3. **Google Safe Browsing** (Domain threats)
   - Add `_check_safe_browsing()` function
   - Integrate into domain threat checks
   - Handle rate limiting (10,000/day free tier)

4. **OpenCNAM** (Caller ID)
   - Add `_check_opencnam()` function
   - Use for additional phone metadata
   - Handle rate limiting (100/day free tier)

**Files to modify:**
- `blackwire/src/enrichment/threat_intel.py` - Add API key checks
- `blackwire/src/enrichment/phone_enrichment.py` - Add TrueCaller/Hiya/OpenCNAM
- `blackwire/src/utils/config.py` - Add API key environment variables

---

## 📋 API Key Sign-Up Checklist

### **Priority 1 (Recommended):**
- [ ] **Google Safe Browsing** - https://developers.google.com/safe-browsing
  - Free tier: 10,000 requests/day
  - Good domain threat detection

### **Priority 2 (Optional):**
- [ ] **Hiya API** - https://www.hiya.com/api
  - Free tier: 1,000 requests/month
  - Good phone reputation data

### **Priority 3 (Nice to Have):**
- [ ] **OpenCNAM** - https://www.opencnam.com/
  - Free tier: 100 requests/day
  - Additional caller ID data

### **Already Have (Verify):**
- [ ] **VirusTotal API Key** - Check if `VIRUSTOTAL_API_KEY` is set
- [ ] **NumLookup API Key** - Check if `NUMLOOKUP_API_KEY` is set

---

## 🎯 Recommended Approach

### **Step 1: Implement Free APIs First** (No keys needed)
- This gives immediate value
- PhishTank, OpenPhish, Spamhaus, SURBL, GitHub lists
- **Time**: 2-3 hours
- **Result**: Better domain/IP threat detection, basic phone/Instagram checks

### **Step 2: Get Google Safe Browsing Key** (Recommended)
- Sign up: Google Cloud Console
- Free tier: 10,000 requests/day
- **Time**: 10 minutes to set up
- **Result**: Better domain threat detection

### **Step 3: Get Google Safe Browsing Key** (Easy to get)
- Sign up: Google Cloud Console
- Free tier: 10,000 requests/day
- **Time**: 10 minutes to set up
- **Result**: Better domain threat detection

### **Step 4: Get Hiya API Key** (If budget allows)
- Sign up: https://www.hiya.com/api
- Free tier: 1,000 requests/month
- **Time**: 5 minutes to sign up
- **Result**: Additional phone reputation data

---

## 💰 Cost Summary

### **Free Tier (No Cost):**
- PhishTank: Free
- OpenPhish: Free
- Spamhaus: Free
- SURBL: Free
- GitHub lists: Free
- TrueCaller: 10 requests/day (free)
- Hiya: 1,000 requests/month (free)
- Google Safe Browsing: 10,000 requests/day (free)
- OpenCNAM: 100 requests/day (free)

### **If You Need More:**
- TrueCaller: $99/month (10,000 requests)
- Hiya: ~$10-50/month (depending on usage)
- Google Safe Browsing: ~$0.0001 per request (very cheap)

**Total Free Tier**: $0/month  
**Recommended Paid**: $99/month (TrueCaller) if you need more phone lookups

---

## 📝 Next Steps

1. **I'll implement Phase 1** (free APIs) - no keys needed
2. **You sign up for API keys** (TrueCaller, Google Safe Browsing, Hiya)
3. **I'll implement Phase 2** (API key integrations) once you have keys
4. **Test and deploy**

---

## 🔍 How to Check Current API Keys

Run this to see what keys you already have:

```bash
cd /Users/aazir/Desktop/AIModules/DarkAI/DarkAI-consolidated
grep -E "(VIRUSTOTAL|NUMLOOKUP|TRUECALLER|HIYA|SAFE_BROWSING|OPENCNAM)" .env 2>/dev/null || echo "No API keys found in .env"
```

