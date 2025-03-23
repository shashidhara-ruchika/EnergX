import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { Mood } from '@/types/mood';
import { supabase } from '@/lib/supabase';

interface MoodScore {
  date: string;
  score: number;
  mood: Mood;
}

const moodToScore: Record<Mood, number> = {
  '😊': 5,
  '🙂': 4,
  '😐': 3,
  '🙁': 2,
  '😢': 1,
  '🤷': 0,
};

export function MoodTrendChart() {
  const [moodData, setMoodData] = useState<MoodScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select('date, mood')
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true });

      if (error) throw error;

      const processedData = entries?.map(entry => ({
        date: format(new Date(entry.date), 'MMM d'),
        score: moodToScore[entry.mood as Mood] || 0,
        mood: entry.mood as Mood,
      })) || [];

      setMoodData(processedData);
    } catch (error) {
      console.error('Error fetching mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const bestMood = [...moodData].sort((a, b) => b.score - a.score)[0];
  const worstMood = [...moodData].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Mood Activity Trend</h3>
      <p className="text-sm text-gray-500 mb-6">
        Track your emotional journey and see how your activities influence your mood
      </p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={moodData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const moodMap: Record<number, string> = {
                  5: '😊',
                  4: '🙂',
                  3: '😐',
                  2: '🙁',
                  1: '😢',
                };
                return moodMap[value] || '';
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 shadow-lg rounded-lg border">
                      <p className="text-sm font-medium">{data.date}</p>
                      <p className="text-lg">{data.mood}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6366f1" }}
              activeDot={{ r: 6 }}
            />
            {bestMood && (
              <ReferenceDot
                x={bestMood.date}
                y={bestMood.score}
                r={6}
                fill="#22c55e"
                stroke="none"
              />
            )}
            {worstMood && (
              <ReferenceDot
                x={worstMood.date}
                y={worstMood.score}
                r={6}
                fill="#ef4444"
                stroke="none"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
          <span>Best Mood</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
          <span>Lowest Mood</span>
        </div>
      </div>
    </div>
  );
}