import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Mood, MoodWithActivities } from '@/types/mood';

interface CalendarProps {
  moodEntries: MoodWithActivities[];
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

const moodEmojis: Record<Mood, string> = {
  '😊': '😊',
  '🙂': '🙂',
  '😐': '😐',
  '🙁': '🙁',
  '😢': '😢',
  '🤷': '🤷',
};

export function Calendar({ moodEntries, onSelectDate, selectedDate }: CalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());

  const getMoodForDate = (date: Date): Mood => {
    const entry = moodEntries.find(
      (entry) => entry.date === format(date, 'yyyy-MM-dd')
    );
    return (entry?.mood as Mood) || '🤷';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        month={month}
        onMonthChange={setMonth}
        modifiers={{
          selected: selectedDate,
        }}
        modifiersClassNames={{
          selected: 'bg-primary text-primary-foreground',
        }}
        components={{
          DayContent: ({ date }) => (
            <div className="flex flex-col items-center">
              <span>{date.getDate()}</span>
              <span className="text-lg">{moodEmojis[getMoodForDate(date)]}</span>
            </div>
          ),
        }}
        className={cn(
          'p-3',
          'rdp-day_selected:bg-primary rdp-day_selected:text-primary-foreground',
          'rdp-day_today:bg-accent rdp-day_today:text-accent-foreground'
        )}
      />
    </div>
  );
}