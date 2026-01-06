# DarkAI Integration for Flyt Waitlist

The Flyt landing page now uses DarkAI's existing email and database infrastructure!

## How It Works

1. **Email Storage**: Emails are stored in DarkAI's PostgreSQL database in a `flyt_waitlist` table
2. **Email Sending**: Uses DarkAI's existing Resend API or SMTP setup (same as contact form)
3. **CORS Enabled**: The endpoint accepts requests from your landing page domain

## Setup

### 1. Update Landing Page API URL

In `script.js`, update the API URL to your deployed DarkAI domain:

```javascript
const apiUrl = 'https://your-darkai-domain.com/api/waitlist';
```

### 2. Environment Variables (Optional)

Add to DarkAI's `.env` file if you want confirmation emails:

```bash
# Optional: Send confirmation emails to waitlist subscribers
SEND_WAITLIST_CONFIRMATION=true

# Already configured (reused from contact form):
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Database Table

The endpoint automatically creates the `flyt_waitlist` table on first use. No manual setup needed!

## Features

- ✅ **Automatic database storage** - Emails stored in PostgreSQL
- ✅ **Duplicate prevention** - Won't add the same email twice
- ✅ **Optional confirmation emails** - Uses existing Resend/SMTP setup
- ✅ **CORS enabled** - Works from any domain
- ✅ **Error handling** - Graceful fallbacks if database/email fails

## Viewing Waitlist

You can query the database directly:

```sql
SELECT * FROM flyt_waitlist ORDER BY created_at DESC;
```

Or add a simple admin endpoint to DarkAI if needed.

## Deployment

When you deploy DarkAI, the waitlist endpoint will be available at:
- `https://your-darkai-domain.com/api/waitlist`

Just update the URL in `script.js` and you're done!

