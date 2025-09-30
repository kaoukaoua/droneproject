import { useEffect, useRef } from 'react';
import { DroneData } from '../types/drone';

interface Props {
  data: DroneData[];
}

const STATE_COLORS: { [key: string]: string } = {
  'Taking Off': '#FFC0CB',
  'Entering Swarm': '#ADD8E6',
  'Hovering': '#90EE90',
  'Passing By': '#FDFD96',
  'Attacking': '#FFB6C1',
  'Parachute Deployment': '#FFD700',
};

export default function StateHeatmap({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 60, right: 150, bottom: 40, left: 60 };

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const timePoints = Array.from(new Set(data.map(d => d.TimePoint))).sort();
    const droneIds = Array.from(new Set(data.map(d => d.DroneID))).sort((a, b) => a - b);

    const cellWidth = (width - padding.left - padding.right) / timePoints.length;
    const cellHeight = (height - padding.top - padding.bottom) / droneIds.length;

    droneIds.forEach((droneId, rowIndex) => {
      timePoints.forEach((tp, colIndex) => {
        const droneData = data.find(d => d.DroneID === droneId && d.TimePoint === tp);

        if (droneData) {
          const x = padding.left + colIndex * cellWidth;
          const y = padding.top + rowIndex * cellHeight;

          const color = STATE_COLORS[droneData.State] || '#CCCCCC';
          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellWidth, cellHeight);

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
      });
    });

    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    timePoints.forEach((tp, index) => {
      const x = padding.left + index * cellWidth + cellWidth / 2;
      ctx.fillText(tp, x, padding.top - 10);
    });

    ctx.textAlign = 'right';
    droneIds.forEach((droneId, index) => {
      const y = padding.top + index * cellHeight + cellHeight / 2 + 4;
      ctx.fillText(`Drone ${droneId}`, padding.left - 10, y);
    });

    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Drone State History Heatmap', width / 2, 30);

    const states = Array.from(new Set(data.map(d => d.State)));
    const legendX = width - padding.right + 20;
    let legendY = padding.top;

    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('States:', legendX, legendY);
    legendY += 20;

    states.forEach(state => {
      const color = STATE_COLORS[state] || '#CCCCCC';

      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 20, 20);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(legendX, legendY, 20, 20);

      ctx.fillStyle = '#333';
      ctx.font = '11px sans-serif';
      ctx.fillText(state, legendX + 25, legendY + 14);

      legendY += 25;
    });

  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">State History Heatmap</h2>
      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="border border-gray-300 rounded"
      />
    </div>
  );
}