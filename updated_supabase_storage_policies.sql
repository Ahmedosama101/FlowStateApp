-- Updated Supabase Storage Policies for user-images bucket
-- Run this SQL in your Supabase SQL Editor to set up proper permissions

-- First, check if the user-images bucket exists
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'user-images'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, avif_autodetection)
    VALUES ('user-images', 'user-images', false, false);
    RAISE NOTICE 'Created user-images bucket';
  ELSE
    RAISE NOTICE 'user-images bucket already exists';
  END IF;
END $$;

-- Drop existing policies for the bucket to avoid conflicts
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname LIKE '%user-images%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_rec.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_rec.policyname;
  END LOOP;
END $$;

-- Create policies for the user-images bucket

-- Allow users to view their own files
CREATE POLICY "Allow users to view their own folder in user-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to upload files to their own folder
CREATE POLICY "Allow users to upload to their own folder in user-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files in user-images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files in user-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- FOR TESTING ONLY: More permissive policy (UNCOMMENT IF NEEDED)
CREATE POLICY "Allow authenticated users to manage all files in user-images" ON storage.objects
  FOR ALL
  USING (bucket_id = 'user-images' AND auth.role() = 'authenticated');

-- Check for profile_images table and create if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profile_images'
  ) THEN
    CREATE TABLE profile_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      profile_id UUID NOT NULL,
      image_url TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add foreign key if profiles table exists
    IF EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    ) THEN
      ALTER TABLE profile_images 
      ADD CONSTRAINT fk_profile_images_profile 
      FOREIGN KEY (profile_id) 
      REFERENCES profiles(id);
    END IF;
    
    ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created profile_images table';
  ELSE
    RAISE NOTICE 'profile_images table already exists';
  END IF;
END $$;

-- Drop existing policies for profile_images to avoid conflicts
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN
    SELECT policyname FROM pg_policies WHERE tablename = 'profile_images'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profile_images', policy_rec.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_rec.policyname;
  END LOOP;
END $$;

-- Create policies for the profile_images table
CREATE POLICY "Users can view their own profile images" ON profile_images
  FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own profile images" ON profile_images
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own profile images" ON profile_images
  FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own profile images" ON profile_images
  FOR DELETE
  USING (auth.uid() = profile_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_images_profile_id ON profile_images(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_images_primary ON profile_images(profile_id, is_primary);

-- FOR TESTING ONLY: Additional permissive policy for profile_images table (UNCOMMENT IF NEEDED)
CREATE POLICY "Authenticated users can see all profile images" ON profile_images
  FOR SELECT
  USING (auth.role() = 'authenticated');
