/*
  # Enable Storage for Memes

  1. Storage Setup
    - Create 'memes' storage bucket
    - Configure public access for meme files
    - Set up RLS policies for upload and delete operations

  2. Security
    - Allow authenticated users to upload memes
    - Allow public access to read memes
    - Allow users to delete their own memes
*/

-- Enable Storage
DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('memes', 'memes', true)
  ON CONFLICT (id) DO NOTHING;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Authenticated users can upload memes" ON storage.objects;
  DROP POLICY IF EXISTS "Public access to memes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own memes" ON storage.objects;

  -- Create policy to allow authenticated users to upload files
  CREATE POLICY "Authenticated users can upload memes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'memes');

  -- Create policy to allow public access to read memes
  CREATE POLICY "Public access to memes"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'memes');

  -- Create policy to allow users to delete their own memes
  CREATE POLICY "Users can delete their own memes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'memes' AND auth.uid() = owner);
END $$;