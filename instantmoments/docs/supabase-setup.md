# Supabase Setup Guide for InstaMoments

This guide walks you through setting up the complete Supabase backend for InstaMoments, including database schema, storage buckets, and security policies.

## Prerequisites

- Supabase account (free tier is sufficient for development)
- Node.js and npm installed
- Git repository cloned

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `instamoments-dev` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your location (Singapore for Philippines)
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

## Step 3: Configure Environment Variables

1. Create `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=InstaMoments
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Settings
NODE_ENV=development
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Install Supabase CLI (Optional but Recommended)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-id
```

## Step 5: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `sql/schema.sql`
4. Paste and run the SQL script
5. Verify all tables are created in **Table Editor**

### Option B: Using Supabase CLI

```bash
# Apply the schema
supabase db push

# Or run the SQL file directly
supabase db reset --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" --file sql/schema.sql
```

## Step 6: Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:

### Photos Bucket

- **Name**: `photos`
- **Public**: ✅ Yes
- **File size limit**: 10 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### Videos Bucket

- **Name**: `videos`
- **Public**: ✅ Yes
- **File size limit**: 50 MB
- **Allowed MIME types**: `video/mp4, video/webm, video/mov`

### Thumbnails Bucket

- **Name**: `thumbnails`
- **Public**: ✅ Yes
- **File size limit**: 1 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### QR Codes Bucket

- **Name**: `qr-codes`
- **Public**: ✅ Yes
- **File size limit**: 1 MB
- **Allowed MIME types**: `image/png, image/svg+xml`

## Step 7: Configure Storage Policies

1. Go to **Storage** → **Policies**
2. For each bucket, add the following policies:

### Photos Bucket Policies

```sql
-- Public read access
CREATE POLICY "Photos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Event hosts can upload
CREATE POLICY "Event hosts can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid() IN (
    SELECT host_id FROM events
    WHERE id::text = (storage.foldername(name))[2]
  )
);
```

Apply similar policies for videos, thumbnails, and qr-codes buckets.

## Step 8: Test the Setup

1. Install dependencies:

```bash
npm install
```

2. Run the test script:

```bash
npm run db:test
```

3. Generate TypeScript types:

```bash
npm run db:types
```

## Step 9: Verify Everything Works

1. Start the development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)
3. Check the browser console for any Supabase connection errors

## Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**

- Ensure `.env.local` exists and contains all required variables
- Restart your development server after adding environment variables

**"Table not found" errors**

- Verify the database schema was applied correctly
- Check the SQL Editor in Supabase dashboard for any errors

**"Permission denied" errors**

- Ensure RLS policies are properly configured
- Check that storage bucket policies allow the required operations

**"Connection failed" errors**

- Verify your Supabase URL and keys are correct
- Check your internet connection
- Ensure your Supabase project is not paused

### Getting Help

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Join the [Supabase Discord](https://discord.supabase.com)
3. Review the test script output for specific error messages

## Next Steps

Once the setup is complete, you can:

1. Start building the frontend components
2. Implement authentication flows
3. Create event management features
4. Add photo/video upload functionality

## Security Notes

- Never commit `.env.local` to version control
- Use different Supabase projects for development and production
- Regularly rotate your service role key
- Monitor your Supabase usage to avoid hitting free tier limits

## Production Setup

For production deployment:

1. Create a new Supabase project for production
2. Apply the same schema and policies
3. Configure environment variables in your deployment platform (Vercel)
4. Set up proper backup and monitoring
5. Configure custom domain and SSL certificates
