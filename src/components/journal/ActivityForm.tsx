import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { parse } from 'date-fns';

const activitySchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  description: z.string().min(1),
  is_energy_booster: z.boolean(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  moodEntryId: string;
  date: string;
  onActivityAdded: () => void;
}

export function ActivityForm({ moodEntryId, date, onActivityAdded }: ActivityFormProps) {
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();

  const { register, handleSubmit, reset, setValue } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
  });

  const startListening = () => {
    resetTranscript();
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    
    // Parse the transcript
    const text = transcript.toLowerCase();
    if (text.includes('from') && text.includes('to')) {
      const startMatch = text.match(/from (\d{1,2}(?::\d{2})? (?:am|pm))/i);
      const endMatch = text.match(/to (\d{1,2}(?::\d{2})? (?:am|pm))/i);
      
      if (startMatch && endMatch) {
        setValue('start_time', startMatch[1]);
        setValue('end_time', endMatch[1]);
      }
    }
    
    setValue('description', transcript);
    setValue('is_energy_booster', text.includes('energy booster'));
  };

  const onSubmit = async (data: ActivityFormData) => {
    try {
      // Parse the selected date
      const selectedDate = parse(date, 'yyyy-MM-dd', new Date());
      
      // Set hours and minutes for start time
      const [startHours, startMinutes] = data.start_time.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
      
      // Set hours and minutes for end time
      const [endHours, endMinutes] = data.end_time.split(':');
      const endTime = new Date(selectedDate);
      endTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);

      // If end time is before start time, it means the activity ends the next day
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const { error } = await supabase.from('activities').insert({
        mood_entry_id: moodEntryId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        description: data.description,
        is_energy_booster: data.is_energy_booster,
      });

      if (error) throw error;

      reset();
      onActivityAdded();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="time"
            {...register('start_time')}
          />
        </div>
        <div>
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="time"
            {...register('end_time')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Activity Description</Label>
        <div className="flex gap-2">
          <Input
            id="description"
            {...register('description')}
          />
          <Button
            type="button"
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "outline"}
          >
            {isListening ? '🛑 Stop' : '🎤 Record'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_energy_booster"
          {...register('is_energy_booster')}
          className="w-4 h-4"
        />
        <Label htmlFor="is_energy_booster">Energy Booster ⚡</Label>
      </div>

      <Button type="submit">Add Activity</Button>
    </form>
  );
}