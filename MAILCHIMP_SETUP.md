# Mailchimp Setup for Flyt Landing Page

## Quick Setup (5 minutes)

1. **Create a Mailchimp account** (free): https://mailchimp.com

2. **Create an Audience:**
   - Go to **Audience** → **All contacts**
   - Click **Create Audience** → Name it "Flyt Waitlist"
   - Complete the setup

3. **Get your form action URL:**
   - Go to **Audience** → **Signup forms** → **Embedded forms**
   - Choose **"Classic"** form
   - Look for the form code - you'll see something like:
     ```html
     <form action="https://YOURDOMAIN.us1.list-manage.com/subscribe/post?u=XXXXX&id=XXXXX" method="post">
     ```
   - Copy the URL from the `action` attribute

4. **Update `index.html`:**
   - Find the form (around line 248)
   - Replace `YOUR_MAILCHIMP_FORM_ACTION_URL` with your actual URL
   - Find the hidden input field with `name="b_YOUR_AUDIENCE_ID_YOUR_LIST_ID"`
   - Replace `YOUR_AUDIENCE_ID_YOUR_LIST_ID` with the values from Mailchimp (they're in the form code)

5. **Test it:**
   - Open the landing page
   - Submit an email
   - Check your Mailchimp audience to see if it appears

## Success Page (Optional)

To show a custom success message on your site:

1. In Mailchimp: **Audience** → **Signup forms** → **Form builder**
2. Go to **Settings** → **Thank you page**
3. Set it to redirect to: `YOUR_SITE_URL?subscribe=success`
4. The landing page will automatically show the success message

## Alternative Services

If you prefer other services, just update the form `action` URL:

- **ConvertKit**: https://convertkit.com (great for creators)
- **MailerLite**: https://mailerlite.com (free tier, simple)
- **Google Forms**: https://forms.google.com (simplest, but less professional)

All work the same way - just change the form action URL in `index.html`.

## Current Form Setup

The form is already configured with:
- ✅ Email validation
- ✅ Custom styling (matches your landing page)
- ✅ Success message handling
- ✅ Error handling

You just need to add your Mailchimp URLs!

