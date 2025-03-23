import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from './Calendar';
import { ActivitySuggestions } from './ActivitySuggestions';
import { SleepTime } from './SleepTime';
import { supabase } from '@/lib/supabase';
import { MoodWithActivities } from '@/types/mood';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [moodEntries, setMoodEntries] = useState<MoodWithActivities[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMoodEntries();
  }, []);

  const fetchMoodEntries = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select(`
          *,
          activities (*),
          memes (url)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      setMoodEntries(entries || []);
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    navigate(`/journal/${format(date, 'yyyy-MM-dd')}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mood Tracker</h1>
        <Button
          onClick={() => supabase.auth.signOut()}
          variant="outline"
        >
          Sign Out
        </Button>
      </div>
      
      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Calendar
            moodEntries={moodEntries}
            onSelectDate={handleDateSelect}
            selectedDate={selectedDate}
          />
          <SleepTime />
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Selected Date</h3>
            <p>{format(selectedDate, 'MMMM d, yyyy')}</p>
          </div>
          <ActivitySuggestions />
        </div>
      </div>
    </div>
  );
}