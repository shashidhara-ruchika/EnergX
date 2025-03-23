/*
  # Add Storage Bucket for Memes

  1. New Storage
    - Create 'memes' bucket for storing user-uploaded memes
    - Set up public access for meme URLs

  2. Security
    - Enable RLS for the bucket
    - Add policy for authenticated users to manage their memes
*/

-- Enable Storage
DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('memes', 'memes', true)
  ON CONFLICT (id) DO NOTHING;

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