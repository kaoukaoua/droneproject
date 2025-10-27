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

    const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 100) + 50;
    const scaleY = (y: number, z: number) => {
      const yNorm = ((y - yMin) / (yMax - yMin)) * (height - 150) + 50;
      const zOffset = (z / zMax) * 50;
      return yNorm - zOffset;
    };

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
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
      <div className="mt-4 flex gap-4 flex-wrap">
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
  );
}