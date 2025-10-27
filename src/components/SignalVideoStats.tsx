import { DroneData } from '../types/drone';
import { Signal, Video } from 'lucide-react';

interface Props {
  data: DroneData[];
  timePoint: string;
}

export default function SignalVideoStats({ data, timePoint }: Props) {
  const signalStats = data.reduce((acc, drone) => {
    if (drone.SignalIntensity !== undefined) {
      const sig = drone.SignalIntensity;
      acc[sig] = (acc[sig] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const videoStats = data.reduce((acc, drone) => {
    if (drone.VideoFeedbackOn !== undefined) {
      const status = drone.VideoFeedbackOn;
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const avgSignal = data
    .filter(d => d.SignalIntensity !== undefined)
    .reduce((sum, d) => sum + (d.SignalIntensity || 0), 0) /
    data.filter(d => d.SignalIntensity !== undefined).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Communication Status</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Signal className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-slate-800">Signal Intensity Distribution</h3>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(level => {
              const count = signalStats[level] || 0;
              const total = Object.values(signalStats).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-16">
                    Level {level}:
                  </span>
                  <div className="flex-1 bg-slate-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(${level * 20 + 20}, 70%, 50%)`
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700">
                      {count} drones ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Average Signal:</span>
              <span className="text-lg font-bold text-slate-800">
                {avgSignal.toFixed(2)} / 5
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-800">Video Feedback Status</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(videoStats).map(([status, count]) => {
              const total = Object.values(videoStats).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              const isActive = status === 'Yes';

              return (
                <div key={status} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                      <span className="font-semibold text-slate-800">
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isActive ? 'bg-green-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {percentage.toFixed(1)}% of drones
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Note:</span> Video feedback enables real-time
              visual monitoring of drone operations and environmental conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
