import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MoodWithActivities } from '@/types/mood';
import { Button } from '../ui/button';
import { format, parse } from 'date-fns';
import { ActivityForm } from './ActivityForm';
import { MemeUpload } from './MemeUpload';
import MDEditor from '@uiw/react-md-editor';

export function Journal() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<MoodWithActivities | null>(null);
  const [loading, setLoading] = useState(true);
  const [journalText, setJournalText] = useState('');

  useEffect(() => {
    if (date) {
      fetchEntry();
    }
  }, [date]);

  const fetchEntry = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select(`
          *,
          activities (*),
          memes (url)
        `)
        .eq('date', date)
        .single();

      if (error) throw error;
      setEntry(data);
      setJournalText(data?.journal_text || '');
    } catch (error) {
      console.error('Error fetching entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveJournalText = async (text: string) => {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .update({ journal_text: text })
        .eq('id', entry?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving journal text:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const formattedDate = date ? 
    format(parse(date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy') : 
    '';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Journal Entry: {formattedDate}</h1>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Current Mood: {entry?.mood || '🤷'}</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Activities</h3>
            {entry?.activities?.map((activity) => (
              <div key={activity.id} className="mb-2 p-2 bg-gray-50 rounded">
                <p>
                  {format(new Date(activity.start_time), 'h:mm a')} - 
                  {format(new Date(activity.end_time), 'h:mm a')}
                </p>
                <p>{activity.description} {activity.is_energy_booster ? '⚡' : '❗'}</p>
              </div>
            ))}
            <ActivityForm
              moodEntryId={entry?.id || ''}
              onActivityAdded={fetchEntry}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Memes</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {entry?.memes?.map((meme) => (
                <img
                  key={meme.url}
                  src={meme.url}
                  alt="Mood meme"
                  className="rounded-lg shadow-sm"
                />
              ))}
            </div>
            <MemeUpload
              moodEntryId={entry?.id || ''}
              onMemeUploaded={fetchEntry}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Deep Thoughts</h3>
            <div data-color-mode="light">
              <MDEditor
                value={journalText}
                onChange={(value) => {
                  setJournalText(value || '');
                  saveJournalText(value || '');
                }}
                preview="edit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}