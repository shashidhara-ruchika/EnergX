import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Mood, MoodWithActivities } from '@/types/mood';
import { format, parse } from 'date-fns';
import { ActivityForm } from './ActivityForm';
import { ActivityLogList } from './ActivityLogList';
import { MemeUpload } from './MemeUpload';
import { MoodSelector } from '../dashboard/MoodSelector';
import { Navbar } from '../common/Navbar';
import MDEditor from '@uiw/react-md-editor';

export function Journal() {
  const { date } = useParams<{ date: string }>();
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

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setEntry(data);
      setJournalText(data?.journal_text || '');
    } catch (error) {
      console.error('Error fetching entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (mood: Mood) => {
    if (!date) return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .upsert({
          date,
          mood,
          user_id: user.data.user.id,
          journal_text: entry?.journal_text || '',
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchEntry();
    } catch (error) {
      console.error('Error saving mood:', error);
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
    <div>
      <Navbar />
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Journal Entry: {formattedDate}</h1>

        <div className="grid gap-6">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">How are you feeling today?</h3>
              <MoodSelector
                onMoodSelect={handleMoodSelect}
                currentMood={entry?.mood as Mood}
              />
            </div>
            
            {entry?.id && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Add Activity</h3>
                  <ActivityForm
                    moodEntryId={entry.id}
                    date={date || ''}
                    onActivityAdded={fetchEntry}
                  />
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Memes</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {entry.memes?.map((meme) => (
                      <img
                        key={meme.url}
                        src={meme.url}
                        alt="Mood meme"
                        className="rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                  <MemeUpload
                    moodEntryId={entry.id}
                    onMemeUploaded={fetchEntry}
                  />
                </div>

                <div className="mb-6">
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

                <div>
                  <ActivityLogList activities={entry.activities || []} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}