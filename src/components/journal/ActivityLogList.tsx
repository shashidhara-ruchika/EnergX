import { format } from 'date-fns';
import { Activity } from '@/types/mood';
import { Clock, Zap } from 'lucide-react';

interface ActivityLogListProps {
  activities: Activity[];
}

export function ActivityLogList({ activities }: ActivityLogListProps) {
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Log</h3>
      {sortedActivities.length === 0 ? (
        <p className="text-gray-500 italic">No activities recorded for this day</p>
      ) : (
        <div className="space-y-2">
          {sortedActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {format(new Date(activity.start_time), 'h:mm a')} - 
                    {format(new Date(activity.end_time), 'h:mm a')}
                  </span>
                </div>
                {activity.is_energy_booster && (
                  <Zap className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <p className="mt-1 text-gray-800">{activity.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}