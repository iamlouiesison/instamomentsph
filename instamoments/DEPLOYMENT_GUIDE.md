# InstaMoments Vercel Deployment Guide

## Prerequisites
- Vercel account (free)
- Supabase project with production database
- GitHub repository (optional but recommended)

## Step 1: Prepare Environment Variables

You'll need these environment variables for production:

### Required Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### Optional Environment Variables:
```
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_MAX_FILES_PER_EVENT=100
NEXT_PUBLIC_DEFAULT_CURRENCY=PHP
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Manila
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to your project: `cd /Users/louiesison/projects/instamomentsph/instamoments`
3. Run: `vercel`
4. Follow the prompts to link your project
5. Set environment variables when prompted

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository or upload your code
4. Set the root directory to `instamoments`
5. Configure environment variables in the dashboard

## Step 3: Configure Supabase for Production

1. Update your Supabase project settings:
   - Go to Authentication > URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add your Vercel domain to "Redirect URLs"

2. Update RLS policies if needed for production

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Test user registration/login
3. Test photo upload functionality
4. Test QR code generation
5. Test gallery viewing

## Troubleshooting

### Common Issues:
- **Build Errors**: Check that all dependencies are in package.json
- **Environment Variables**: Ensure all required variables are set
- **Supabase Connection**: Verify URLs and keys are correct
- **Image Upload**: Check Supabase storage bucket policies

### Debug Steps:
1. Check Vercel function logs
2. Check Supabase logs
3. Test locally with production environment variables
4. Verify all API routes are working

## Post-Deployment

1. Set up custom domain (optional)
2. Configure analytics
3. Set up monitoring
4. Plan for scaling
