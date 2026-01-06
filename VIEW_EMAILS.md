# How to View Waitlist Emails

## Option 1: Brevo Dashboard (Recommended)

Since you're using Brevo, the easiest way is through their dashboard:

1. **Log in to Brevo**: https://app.brevo.com
2. **Go to Contacts**: Click "Contacts" in the left sidebar
3. **View your list**: All emails submitted through the form will appear here
4. **Export**: You can export the list as CSV/Excel from the Brevo dashboard

## Option 2: DarkAI Database (If you kept the endpoint)

If you want to check emails stored in DarkAI's database:

### Via API Endpoint

Visit: `https://your-darkai-domain.com/api/waitlist/view`

This returns a JSON response with all emails:
```json
{
  "success": true,
  "count": 5,
  "emails": [
    {
      "email": "user@example.com",
      "created_at": "2026-01-04T20:30:00",
      "confirmed": false
    }
  ]
}
```

### Via Database Query

If you have database access:

```sql
SELECT email, created_at, confirmed 
FROM flyt_waitlist 
ORDER BY created_at DESC;
```

## Recommendation

**Use Brevo Dashboard** - It's the simplest and gives you:
- ✅ All emails in one place
- ✅ Export functionality
- ✅ Email marketing tools
- ✅ Analytics and insights
- ✅ No code needed

The Brevo form handles everything automatically!

