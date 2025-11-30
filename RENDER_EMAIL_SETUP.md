# Render Email Setup - Contact Form

## ✅ Code Updates Complete

The following have been updated:
- ✅ `app.py` - Now uses Resend API for email sending
- ✅ `render.yaml` - Email environment variables added
- ✅ `.env.example` - Updated with Resend configuration

## 🔧 What You Need to Add in Render Dashboard

### Step 1: Go to Your Render Service
1. Log into [Render Dashboard](https://dashboard.render.com)
2. Navigate to your `darkai-consolidated` web service
3. Click on **"Environment"** in the left sidebar

### Step 2: Add Environment Variables

Add **ONE** environment variable manually:

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | `re_AuxGPwxN_4ahbqnK7EiL9N1k3HJ9Ea1JC` |

**Note:** The other two (`FROM_EMAIL` and `CONTACT_EMAIL`) are already set in `render.yaml` with default values, but you can override them in the dashboard if needed.

### Step 3: Save and Redeploy

1. Click **"Save Changes"**
2. Render will automatically redeploy your service
3. Wait for deployment to complete

## 📧 How It Works

- **FROM_EMAIL**: `onboarding@resend.dev` (Resend's default test domain)
- **CONTACT_EMAIL**: `aazirmun@gmail.com` (where contact form emails are sent)
- **RESEND_API_KEY**: Your API key (must be added manually in Render dashboard)

## ✅ Testing

After deployment:
1. Go to your live site: `https://your-app.onrender.com/about#contact`
2. Submit the contact form
3. Check `aazirmun@gmail.com` for the email

## 🔒 Security Note

The `RESEND_API_KEY` is marked as `sync: false` in `render.yaml`, which means:
- ✅ It won't be committed to Git
- ✅ You must add it manually in Render dashboard
- ✅ This keeps your API key secure

## 📝 Summary

**What's already done:**
- ✅ Code updated to use Resend
- ✅ `render.yaml` configured
- ✅ Default email addresses set

**What you need to do:**
- ⚠️ Add `RESEND_API_KEY` in Render dashboard (one time)
- ⚠️ Redeploy (happens automatically after saving)

That's it! 🎉

