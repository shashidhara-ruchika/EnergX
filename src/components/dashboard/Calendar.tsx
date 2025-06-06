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
  '🤷': '',
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
          today: 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer',
        }}
        components={{
          DayContent: ({ date, activeModifiers }) => {
            const mood = getMoodForDate(date);
            return (
              <div 
                className={cn(
                  "flex items-center justify-center w-10 h-10",
                  "cursor-pointer hover:bg-primary hover:text-primary-foreground rounded-md transition-colors",
                  activeModifiers.selected && "bg-primary text-primary-foreground"
                )}
                onClick={() => onSelectDate(date)}
              >
                {moodEmojis[mood] || format(date, 'd')}
              </div>
            );
          },
        }}
        className={cn(
          'mx-auto',
          'rdp-day_selected:bg-primary rdp-day_selected:text-primary-foreground',
          'rdp-day_today:bg-accent rdp-day_today:text-accent-foreground'
        )}
        styles={{
          table: { width: '100%' },
          cell: { width: '40px', height: '40px' },
          day: { margin: 0 }
        }}
      />
    </div>
  );
}