import { Button } from '@/components/ui/button';
import { Mood } from '@/types/mood';
import { useState } from 'react';

interface MoodSelectorProps {
  onMoodSelect: (mood: Mood) => Promise<void>;
  currentMood?: Mood;
}

const moods: Mood[] = ['😊', '🙂', '😐', '🙁', '😢'];

export function MoodSelector({ onMoodSelect, currentMood }: MoodSelectorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMoodSelect = async (mood: Mood) => {
    setIsSubmitting(true);
    try {
      await onMoodSelect(mood);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">How are you feeling today?</h3>
      <div className="flex gap-2 flex-wrap">
        {moods.map((mood) => (
          <Button
            key={mood}
            onClick={() => handleMoodSelect(mood)}
            variant={currentMood === mood ? 'default' : 'outline'}
            className="text-2xl p-2 h-auto"
            disabled={isSubmitting}
          >
            {mood}
          </Button>
        ))}
      </div>
    </div>
  );
}