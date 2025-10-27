import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { DroneData } from './types/drone';
import { parseDroneCSV, getTimePoints, getDataForTimePoint, calculateSwarmBatteryTimeline } from './utils/csvParser';
import DroneVisualization3D from './components/DroneVisualization3D';
import BatteryTimeline from './components/BatteryTimeline';
import StateHeatmap from './components/StateHeatmap';
import SignalVideoStats from './components/SignalVideoStats';

function App() {
  const [allData, setAllData] = useState<DroneData[]>([]);
  const [timePoints, setTimePoints] = useState<string[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/Sample Data_A2.csv');
        const csvText = await response.text();
        const parsed = await parseDroneCSV(csvText);
        setAllData(parsed);

        const tps = getTimePoints(parsed);
        setTimePoints(tps);
        setLoading(false);
      } catch (error) {
        console.error('Error loading CSV:', error);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % timePoints.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, timePoints.length]);

  const currentTimePoint = timePoints[currentFrameIndex] || '';
  const currentFrameData = getDataForTimePoint(allData, currentTimePoint);
  const timelineData = calculateSwarmBatteryTimeline(allData);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentFrameIndex(prev => (prev - 1 + timePoints.length) % timePoints.length);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentFrameIndex(prev => (prev + 1) % timePoints.length);
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-700">Loading drone data...</p>
        </div>
      </div>
    );
  }

  if (allData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Failed to load drone data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Drone Swarm Visualization Dashboard
          </h1>
          <p className="text-slate-600">
            Interactive visualization of drone trajectory, battery levels, and state transitions
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800">
              Current Time Point: <span className="text-blue-600">{currentTimePoint}</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                className="p-3 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                title="Previous Frame"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={handleNext}
                className="p-3 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                title="Next Frame"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max={timePoints.length - 1}
              value={currentFrameIndex}
              onChange={(e) => {
                setCurrentFrameIndex(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-sm text-slate-600">
              {timePoints.map((tp, index) => (
                <span key={tp} className={index === currentFrameIndex ? 'font-bold text-blue-600' : ''}>
                  {tp}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 mb-8">
          <DroneVisualization3D data={currentFrameData} currentFrame={currentFrameIndex} />
        </div>

        <div className="grid gap-8 mb-8">
          <SignalVideoStats data={currentFrameData} timePoint={currentTimePoint} />
        </div>

        <div className="grid gap-8 mb-8">
          <BatteryTimeline data={timelineData} />
        </div>

        <div className="grid gap-8">
          <StateHeatmap data={allData} />
        </div>

        <footer className="mt-8 text-center text-slate-600 text-sm">
          <p>Visualizing {allData.length} drone data points across {timePoints.length} time points</p>
          <p className="mt-2">Total Drones: {new Set(allData.map(d => d.DroneID)).size}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;