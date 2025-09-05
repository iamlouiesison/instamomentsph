# Email Setup Guide - Resolving Supabase Email Bounce Issue

## Problem
Supabase has temporarily restricted email sending due to high bounce rates from test emails during development.

## Solution: Set up Resend Email Provider

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain (or use their test domain for development)

### Step 2: Get Your API Key
1. In Resend dashboard, go to API Keys
2. Create a new API key
3. Copy the API key

### Step 3: Update Environment Variables
Replace the placeholder values in `.env.local`:

```bash
# Email Configuration (Resend)
RESEND_API_KEY=re_your_actual_api_key_here
NEXT_PUBLIC_FROM_EMAIL=noreply@yourdomain.com

# Supabase Email Settings (for custom SMTP)
SUPABASE_SMTP_HOST=smtp.resend.com
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USERNAME=resend
SUPABASE_SMTP_PASSWORD=re_your_actual_api_key_here
SUPABASE_SMTP_SENDER_EMAIL=noreply@yourdomain.com
```

### Step 4: Configure Supabase SMTP
1. Go to your Supabase Dashboard
2. Navigate to **Settings** (gear icon) → **Authentication**
3. Look for **"SMTP Settings"** or **"Email Settings"** section
4. Enable "Custom SMTP" or "Use custom SMTP"
5. Enter the following settings:
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend`
   - **Password**: Your Resend API key
   - **Sender email**: Your verified domain email

**Alternative locations to try:**
- Settings → General → Email
- Authentication → Email Templates → SMTP Settings
- Project Settings → Authentication → Email

### Step 5: Test Email Functionality
1. Restart your development server
2. Try signing up with a real email address
3. Check if verification emails are sent successfully

## For Development Testing
- Use real email addresses for testing
- Consider using services like [Mailtrap](https://mailtrap.io) for development
- Avoid using test emails that don't exist

## Benefits of Resend
- ✅ 3,000 free emails/month
- ✅ Better deliverability than default providers
- ✅ Easy integration with Supabase
- ✅ Professional email templates
- ✅ Detailed analytics

## Next Steps
1. Set up Resend account
2. Update environment variables
3. Configure Supabase SMTP settings
4. Test email functionality
5. Monitor email delivery rates

## Troubleshooting
If you still have issues:
1. Check Resend dashboard for delivery status
2. Verify domain authentication in Resend
3. Ensure API key is correct
4. Check Supabase logs for SMTP errors
