/*
  # Initial Schema Setup for Mood Tracker

  1. New Tables
    - mood_entries
      - Stores daily mood records with journal entries
      - Contains mood emoji, timestamp, and optional journal text
    - activities
      - Logs daily activities with time tracking
      - Links to mood entries and tracks energy impact
    - memes
      - Stores meme/image URLs associated with mood entries

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  journal_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  is_energy_booster BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_entries
CREATE POLICY "Users can create their own mood entries"
  ON mood_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mood entries"
  ON mood_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON mood_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON mood_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for activities
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

-- Create policies for memes
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