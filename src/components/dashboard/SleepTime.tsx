import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Moon, Sun } from 'lucide-react';

export function SleepTime() {
  const [bedtime, setBedtime] = useState('22:15'); // 10:15 PM
  const [wakeup, setWakeup] = useState('07:00'); // 7:00 AM

  const calculateSleepDuration = () => {
    const bedtimeDate = new Date(`2000-01-01T${bedtime}:00`);
    const wakeupDate = new Date(`2000-01-01T${wakeup}:00`);
    
    if (wakeupDate < bedtimeDate) {
      wakeupDate.setDate(wakeupDate.getDate() + 1);
    }
    
    const diff = wakeupDate.getTime() - bedtimeDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} hr ${minutes} min`;
  };

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate the SVG arc path for the sleep duration
  const calculateArc = () => {
    const bedtimeMinutes = parseInt(bedtime.split(':')[0]) * 60 + parseInt(bedtime.split(':')[1]);
    const wakeupMinutes = parseInt(wakeup.split(':')[0]) * 60 + parseInt(wakeup.split(':')[1]);
    
    let startAngle = (bedtimeMinutes / (24 * 60)) * 360 - 90;
    let endAngle = (wakeupMinutes / (24 * 60)) * 360 - 90;
    
    if (endAngle < startAngle) {
      endAngle += 360;
    }
    
    const radius = 100;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = radius * Math.cos(startRad) + 150;
    const y1 = radius * Math.sin(startRad) + 150;
    const x2 = radius * Math.cos(endRad) + 150;
    const y2 = radius * Math.sin(endRad) + 150;
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Bedtime and Wake Up</h2>
      
      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm text-gray-500">BEDTIME</div>
            <div className="text-xl font-bold">{formatTimeForDisplay(bedtime)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm text-gray-500">WAKE UP</div>
            <div className="text-xl font-bold">{formatTimeForDisplay(wakeup)}</div>
          </div>
          <Sun className="w-5 h-5 text-yellow-500" />
        </div>
      </div>

      <div className="relative w-[300px] h-[300px] mx-auto mb-4">
        {/* Clock face */}
        <svg className="w-full h-full" viewBox="0 0 300 300">
          {/* Outer circle */}
          <circle
            cx="150"
            cy="150"
            r="120"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="40"
          />
          
          {/* Sleep duration arc */}
          <path
            d={calculateArc()}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="40"
            strokeLinecap="round"
          />
          
          {/* Clock numbers */}
          <text x="150" y="60" textAnchor="middle" className="text-sm">12AM</text>
          <text x="150" y="250" textAnchor="middle" className="text-sm">12PM</text>
          <text x="60" y="150" textAnchor="middle" className="text-sm">6PM</text>
          <text x="240" y="150" textAnchor="middle" className="text-sm">6AM</text>
          
          {/* Icons */}
          <text x="150" y="90" textAnchor="middle" fontSize="16">✨</text>
          <text x="150" y="210" textAnchor="middle" fontSize="16">☀️</text>
        </svg>
      </div>

      <div className="text-center mb-4 text-gray-600">
        {calculateSleepDuration()}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Set Bedtime
          </label>
          <Input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Set Wake Up
          </label>
          <Input
            type="time"
            value={wakeup}
            onChange={(e) => setWakeup(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}