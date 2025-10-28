import { useEffect, useRef } from 'react';
import { DroneData } from '../types/drone';

interface Props {
  data: DroneData[];
  currentFrame: number;
}

const SWARM_COLORS: { [key: number]: string } = {
  '-1': '#778899',
  '1': '#007bff',
  '2': '#dc3545',
  '3': '#28a745',
};

export default function DroneVisualization3D({ data, currentFrame }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = 'Picture1.png';
    img.onload = () => {
      mapImageRef.current = img;
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const xMin = Math.min(...data.map(d => d.PositionX)) - 10;
    const xMax = Math.max(...data.map(d => d.PositionX)) + 10;
    const yMin = Math.min(...data.map(d => d.PositionY)) - 10;
    const yMax = Math.max(...data.map(d => d.PositionY)) + 10;
    const zMax = Math.max(...data.map(d => d.PositionZ)) + 10;

    const scaleX = (x: number) => ((x / 100)) * (width - 100) + 50;
    const scaleY = (y: number, z: number) => {
      const yNorm = ((100 - y) / 100) * (height - 150) + 50;
      const zOffset = (z / zMax) * 50;
      return yNorm - zOffset;
    };

    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, width, height);

    if (mapImageRef.current) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      const padding = 50;
      ctx.drawImage(
        mapImageRef.current,
        padding,
        padding,
        width - padding * 2,
        height - padding * 2 - 50
      );
      ctx.restore();
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = 50 + ((width - 100) / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x, height - 100);
      ctx.stroke();

      const y = 50 + ((height - 150) / 10) * i;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 50, y);
      ctx.stroke();
    }

    data.forEach(drone => {
      const x = scaleX(drone.PositionX);
      const y = scaleY(drone.PositionY, drone.PositionZ);
      const color = SWARM_COLORS[drone.SwarmID] || '#999';

      const batteryScale = (drone.BatteryPercentage / 100) * 15 + 5;
      const rangeScale = (drone.DetectionRange / 100) * 40 + 20;

      ctx.globalAlpha = 0.1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, rangeScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, batteryScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (drone.SignalIntensity !== undefined) {
        const signalRings = drone.SignalIntensity;
        for (let i = 1; i <= signalRings; i++) {
          ctx.globalAlpha = 0.2 - (i * 0.03);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, batteryScale + (i * 8), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      if (drone.VideoFeedbackOn === 'Yes') {
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(x, y - batteryScale - 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const vScale = 20;
      const vx = drone.VelocityX * vScale;
      const vy = -drone.VelocityY * vScale;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + vx, y + vy);
      ctx.stroke();

      const arrowSize = 6;
      const angle = Math.atan2(vy, vx);
      ctx.beginPath();
      ctx.moveTo(x + vx, y + vy);
      ctx.lineTo(
        x + vx - arrowSize * Math.cos(angle - Math.PI / 6),
        y + vy - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(x + vx, y + vy);
      ctx.lineTo(
        x + vx - arrowSize * Math.cos(angle + Math.PI / 6),
        y + vy - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.font = '10px sans-serif';
      ctx.fillText(`D${drone.DroneID}`, x + batteryScale + 5, y - 5);
      ctx.fillText(`Z:${drone.PositionZ.toFixed(1)}`, x + batteryScale + 5, y + 5);
      ctx.fillText(`${drone.State}`, x + batteryScale + 5, y + 15);
      if (drone.SignalIntensity !== undefined) {
        ctx.fillText(`Sig:${drone.SignalIntensity}`, x + batteryScale + 5, y + 25);
      }
    });

  }, [data, currentFrame]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">3D Drone Trajectory Visualization</h2>
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        className="border border-gray-300 rounded"
      />
      <div className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-2 text-slate-700">Swarm Colors</h3>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(SWARM_COLORS).map(([swarmId, color]) => (
              <div key={swarmId} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">
                  Swarm {swarmId === '-1' ? 'Unassigned' : swarmId}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2 text-slate-700">Visual Encodings</h3>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-slate-400"></div>
              <span>Circle size = Battery level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span>Faded circle = Detection range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                <div className="w-2 h-2 rounded-full border border-yellow-500"></div>
                <div className="w-2 h-2 rounded-full border border-yellow-500 -ml-1"></div>
                <div className="w-2 h-2 rounded-full border border-yellow-500 -ml-1"></div>
              </div>
              <span>Gold rings = Signal intensity (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Green dot = Video feedback active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-slate-400"></div>
                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-400 -ml-1"></div>
              </div>
              <span>Arrow = Velocity direction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
