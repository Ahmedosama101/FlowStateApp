# Supabase Storage Troubleshooting Guide

This guide will help you troubleshoot and fix issues with Supabase Storage, particularly for uploading profile images.

## Common Issues

### 1. Storage Bucket Permissions

The most common issue is incorrectly configured Row Level Security (RLS) policies for your storage bucket. Supabase has strict RLS policies by default, and you need to explicitly allow users to perform operations on storage.

#### Required Policies for User-Based Storage

For the `user-images` bucket, you need at least these policies:

```sql
-- Allow users to see their own files
CREATE POLICY "Allow users to view their own folder" ON storage.objects
  FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to upload to their own folder
CREATE POLICY "Allow users to upload to their own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files" ON storage.objects
  FOR UPDATE
  USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files" ON storage.objects
  FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

For testing purposes, you can use a more permissive policy:

```sql
-- More permissive policy for testing
CREATE POLICY "Allow authenticated users to manage all files" ON storage.objects
  FOR ALL
  USING (auth.role() = 'authenticated');
```

### 2. File Path Structure

Ensure your file paths follow the structure that matches your policy. For policies based on user IDs, structure your paths like:

```
{user_id}/{filename}
```

For example: `e3f7b1a2-5c6d-4e8f-9a0b-1c2d3e4f5a6b/profile_1628762345.jpg`

### 3. Authentication Issues

Make sure the user is properly authenticated before uploading. Check the session and user ID.

### 4. CORS Configuration

If uploading from a web client, ensure CORS is properly configured in your Supabase project.

## Debugging Steps

1. **Check Authentication Status**: Verify the user is properly authenticated and has a valid session.

2. **Test Basic Operations**: Try basic operations (list, upload, download, delete) to isolate where the issue occurs.

3. **Check RLS Policies**: Examine the RLS policies for your storage bucket.

4. **Review Error Messages**: Look at the specific error messages returned from Supabase.

5. **Test with the Supabase Dashboard**: Try uploading directly from the Supabase dashboard to determine if it's a permissions issue or a client issue.

## Common Error Messages

- **403 Forbidden**: Usually indicates a permissions issue with RLS policies.
- **401 Unauthorized**: Authentication issue or expired session token.
- **404 Not Found**: Bucket doesn't exist or the path structure is incorrect.
- **409 Conflict**: File already exists (when not using upsert option).

## How to Use the Test Screen

The test screen included in this app helps you diagnose issues by:

1. Checking authentication status
2. Testing all storage operations
3. Viewing bucket information
4. Testing database operations for the profile_images table

If the tests show authentication is working but storage operations fail, it's likely an RLS policy issue. Configure the policies in the Supabase dashboard under:

Storage → Policies → Select "user-images" bucket → Manage Policies

## Database Schema Reference

The `profile_images` table should have this structure:

```sql
CREATE TABLE profile_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own profile images
CREATE POLICY "Users can view their own profile images" ON profile_images
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Policy to allow users to insert their own profile images
CREATE POLICY "Users can insert their own profile images" ON profile_images
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Policy to allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON profile_images
  FOR UPDATE
  USING (auth.uid() = profile_id);

-- Policy to allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON profile_images
  FOR DELETE
  USING (auth.uid() = profile_id);
```

## Contact Support

If you're still experiencing issues after trying the steps above, please contact Supabase support with the specific error messages and the results from the test screen.
