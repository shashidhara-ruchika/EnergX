/*
  # Add Activity and Meme Support

  1. New Tables
    - activities
      - Tracks user activities with time and energy level
      - Links to mood entries
    - memes
      - Stores meme URLs for mood entries
      - Links to mood entries

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  is_energy_booster BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create memes table if it doesn't exist
CREATE TABLE IF NOT EXISTS memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'activities' 
    AND policyname = 'Users can manage their own activities'
  ) THEN
    CREATE POLICY "Users can manage their own activities"
      ON activities
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM mood_entries
          WHERE mood_entries.id = activities.mood_entry_id
          AND mood_entries.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'memes' 
    AND policyname = 'Users can manage their own memes'
  ) THEN
    CREATE POLICY "Users can manage their own memes"
      ON memes
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM mood_entries
          WHERE mood_entries.id = memes.mood_entry_id
          AND mood_entries.user_id = auth.uid()
        )
      );
  END IF;
END $$;