export type Mood = '😊' | '🙂' | '😐' | '🙁' | '😢' | '🤷';

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  mood: Mood;
  journal_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  mood_entry_id: string;
  start_time: string;
  end_time: string;
  description: string;
  is_energy_booster: boolean;
  created_at: string;
}

export interface Meme {
  id: string;
  mood_entry_id: string;
  url: string;
  created_at: string;
}

export interface MoodWithActivities extends MoodEntry {
  activities: Activity[];
  memes: Meme[];
}