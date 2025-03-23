/*
  # Create and Configure Memes Storage Bucket

  1. Storage Setup
    - Create 'memes' storage bucket
    - Configure public access and security policies
    - Set up proper RLS policies

  2. Security
    - Enable authenticated users to upload memes
    - Allow public access to read memes
    - Allow users to delete their own memes
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the storage bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Authenticated users can upload memes" ON storage.objects;
    DROP POLICY IF EXISTS "Public access to memes" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own memes" ON storage.objects;

    -- Create upload policy
    CREATE POLICY "Authenticated users can upload memes"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'memes');

    -- Create read policy
    CREATE POLICY "Public access to memes"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'memes');

    -- Create delete policy
    CREATE POLICY "Users can delete their own memes"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'memes' AND auth.uid() = owner);
END $$;