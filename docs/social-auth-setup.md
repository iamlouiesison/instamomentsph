# Social Authentication Setup Guide

This guide explains how to set up Google and Facebook authentication for InstaMoments.

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
6. Copy the Client ID and Client Secret

## Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
5. Copy the App ID and App Secret

## Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google and Facebook providers
4. Add the OAuth credentials from the steps above
5. Configure the redirect URLs in Supabase

## Environment Variables

Add these to your `.env.local` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

## Testing

1. Start your development server
2. Go to the sign-in page
3. Click on Google or Facebook buttons
4. Complete the OAuth flow
5. Verify that the user is created in Supabase

## Troubleshooting

- Make sure redirect URIs match exactly
- Check that OAuth apps are in development mode (for testing)
- Verify environment variables are set correctly
- Check Supabase logs for authentication errors
