import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ActivitySuggestion {
  activity: string;
  reason: string;
  score: number;
}

export function ActivitySuggestions() {
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const analyzeSentiment = async (text: string): Promise<number> => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: text }),
        }
      );

      const result = await response.json();
      // Map sentiment to score: POS -> 1, NEU -> 0.5, NEG -> 0
      const sentimentMap: { [key: string]: number } = {
        POS: 1,
        NEU: 0.5,
        NEG: 0
      };
      
      return sentimentMap[result[0][0].label] || 0.5;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 0.5;
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's activities and moods
      const { data: entries, error: entriesError } = await supabase
        .from('mood_entries')
        .select(`
          mood,
          activities (
            description,
            is_energy_booster
          )
        `);

      if (entriesError) throw entriesError;

      // Process activities and analyze them
      const activities = entries?.flatMap(entry => 
        entry.activities?.map(activity => ({
          description: activity.description,
          isEnergyBooster: activity.is_energy_booster,
          mood: entry.mood
        }))
      ).filter(Boolean) || [];

      // Group similar activities and calculate their effectiveness
      const activityGroups = activities.reduce((acc, curr) => {
        const key = curr.description.toLowerCase();
        if (!acc[key]) {
          acc[key] = {
            count: 0,
            energyBoosterCount: 0,
            description: curr.description
          };
        }
        acc[key].count++;
        if (curr.isEnergyBooster) {
          acc[key].energyBoosterCount++;
        }
        return acc;
      }, {} as Record<string, { count: number; energyBoosterCount: number; description: string }>);

      // Analyze each unique activity
      const analyzedActivities = await Promise.all(
        Object.values(activityGroups).map(async (group) => {
          const baseScore = group.energyBoosterCount / group.count;
          const sentimentScore = await analyzeSentiment(group.description);
          const finalScore = (baseScore + sentimentScore) / 2;

          return {
            activity: group.description,
            score: finalScore,
            reason: `This activity was marked as energy-boosting ${group.energyBoosterCount} out of ${group.count} times.`
          };
        })
      );

      // Sort by score and take top 5
      const topSuggestions = analyzedActivities
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setSuggestions(topSuggestions);

    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to generate activity suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Top Energy Boosting Activities</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="p-3 bg-accent/50 rounded-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {index + 1}. {suggestion.activity}
                </span>
                <span className="text-sm text-muted-foreground">
                  Score: {Math.round(suggestion.score * 100)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {suggestion.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}