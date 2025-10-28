import { useEffect, useRef } from 'react';

interface TimelineData {
  timePoint: string;
  swarmId: number;
  avgBattery: number;
}

interface Props {
  data: TimelineData[];
}

const SWARM_COLORS: { [key: number]: string } = {
  '-1': '#778899',
  '1': '#007bff',
  '2': '#dc3545',
  '3': '#28a745',
};

export default function BatteryTimeline({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const timePoints = Array.from(new Set(data.map(d => d.timePoint))).sort();
    const swarmIds = Array.from(new Set(data.map(d => d.swarmId))).sort((a, b) => a - b);

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const minBattery = Math.min(...data.map(d => d.avgBattery)) - 5;
    const maxBattery = 100;

    const scaleX = (index: number) => {
      if (timePoints.length === 1) return padding.left + plotWidth / 2;
      return padding.left + (plotWidth / (timePoints.length - 1)) * index;
    };
    const scaleY = (battery: number) => padding.top + plotHeight - ((battery - minBattery) / (maxBattery - minBattery)) * plotHeight;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (plotHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const batteryValue = maxBattery - ((maxBattery - minBattery) / 5) * i;
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(batteryValue.toFixed(1), padding.left - 10, y + 4);
    }

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    swarmIds.forEach(swarmId => {
      const swarmData = data.filter(d => d.swarmId === swarmId);
      const color = SWARM_COLORS[swarmId] || '#999';

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      swarmData.forEach((point, index) => {
        const tpIndex = timePoints.indexOf(point.timePoint);
        const x = scaleX(tpIndex);
        const y = scaleY(point.avgBattery);

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      swarmData.forEach(point => {
        const tpIndex = timePoints.indexOf(point.timePoint);
        const x = scaleX(tpIndex);
        const y = scaleY(point.avgBattery);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    timePoints.forEach((tp, index) => {
      const x = scaleX(index);
      ctx.fillText(tp, x, height - padding.bottom + 25);
    });

    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Average Battery Percentage (%)', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Time Point', width / 2, height - 10);

  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Battery Timeline by Swarm</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
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