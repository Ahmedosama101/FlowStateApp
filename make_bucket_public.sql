-- Script to ensure the user-images bucket is set to public
-- Run this in your Supabase SQL Editor

-- First, check if the user-images bucket exists and its current public setting
DO $$
DECLARE
  bucket_exists BOOLEAN;
  is_public BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'user-images'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    -- Get current public setting
    SELECT public INTO is_public FROM storage.buckets WHERE name = 'user-images';
    
    IF is_public THEN
      RAISE NOTICE 'user-images bucket already exists and is set to public';
    ELSE
      -- Update bucket to be public
      UPDATE storage.buckets SET public = true WHERE name = 'user-images';
      RAISE NOTICE 'user-images bucket updated to be public';
    END IF;
  ELSE
    -- Create the bucket as public
    INSERT INTO storage.buckets (id, name, public, avif_autodetection)
    VALUES ('user-images', 'user-images', true, false);
    RAISE NOTICE 'Created user-images bucket and set it to public';
  END IF;
END $$;

-- Set CORS policies to allow access from any origin
UPDATE storage.buckets
SET cors_rules = '[{"allowed_origins": ["*"], "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allowed_headers": ["*"], "exposed_headers": ["*"], "max_age_seconds": 3600}]'
WHERE name = 'user-images';

-- Verify the final configuration
SELECT name, public, cors_rules FROM storage.buckets WHERE name = 'user-images';
