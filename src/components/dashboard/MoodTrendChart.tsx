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
      <div className="card-gradient p-8 rounded-2xl">
        <div className="animate-pulse">
          <div className="h-4 bg-[#9E72C3]/20 rounded-full w-3/4 mb-4"></div>
          <div className="h-64 bg-[#9E72C3]/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const bestMood = [...moodData].sort((a, b) => b.score - a.score)[0];
  const worstMood = [...moodData].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="card-gradient p-8 rounded-2xl">
      <h3 className="text-xl font-semibold mb-2 text-[#4A2574]">Mood Activity Trend</h3>
      <p className="text-sm text-[#7338A0] mb-8">
        Track your emotional journey and see how your activities influence your mood
      </p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={moodData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#9E72C3/20" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#4A2574' }}
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
                    <div className="bg-white/95 p-3 shadow-lg rounded-xl border border-[#924DBF]/20">
                      <p className="text-sm font-medium text-[#4A2574]">{data.date}</p>
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
              stroke="#924DBF"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#7338A0", strokeWidth: 2, stroke: "#924DBF" }}
              activeDot={{ r: 6, fill: "#4A2574" }}
            />
            {bestMood && (
              <ReferenceDot
                x={bestMood.date}
                y={bestMood.score}
                r={6}
                fill="#7338A0"
                stroke="#924DBF"
                strokeWidth={2}
              />
            )}
            {worstMood && (
              <ReferenceDot
                x={worstMood.date}
                y={worstMood.score}
                r={6}
                fill="#9E72C3"
                stroke="#924DBF"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-8 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#7338A0]"></div>
          <span className="text-[#4A2574]">Best Mood</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#9E72C3]"></div>
          <span className="text-[#4A2574]">Lowest Mood</span>
        </div>
      </div>
    </div>
  );
}