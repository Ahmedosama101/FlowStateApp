-- Add profile_image_url to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_image_url TEXT;
    RAISE NOTICE 'Added profile_image_url column to profiles table';
  ELSE
    RAISE NOTICE 'profile_image_url column already exists in profiles table';
  END IF;
END $$;
