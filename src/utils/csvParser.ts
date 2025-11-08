import { DroneData } from '../types/drone';

export async function parseDroneCSV(csvText: string): Promise<DroneData[]> {
  const lines = csvText.trim().split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  const data: DroneData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('"-1')) continue;

    const values = line.split(',').map(v => v.trim());
    if (values.length < 16) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      if (index < values.length) {
        row[header] = values[index];
      }
    });

    if (!row['DroneID'] || !row['TimePoint']) continue;

    const droneId = parseInt(row['DroneID']);
    if (isNaN(droneId)) continue;

    const normalizedRow: DroneData = {
      DroneID: droneId,
      TimePoint: row['TimePoint'],
      SwarmID: parseInt(row['SwarmID']) || -1,
      TaskID: isNaN(parseInt(row['TaskID'])) ? row['TaskID'] : parseInt(row['TaskID']),
      State: row['State'] || 'Unknown',
      PositionX: parseFloat(row['PositionX']) || 0,
      PositionY: parseFloat(row['PositionY']) || 0,
      PositionZ: parseFloat(row['PositionZ']) || 0,
      VelocityX: parseFloat(row['VelocityX']) || 0,
      VelocityY: parseFloat(row['VelocityY']) || 0,
      VelocityZ: parseFloat(row['VelocityZ']) || 0,
      Pitch: parseFloat(row['Pitch']) || 0,
      Roll: parseFloat(row['Roll']) || 0,
      Yaw: parseFloat(row['Yaw']) || 0,
      BatteryPercentage: parseFloat(row['Battery Percentage']) || 0,
      DetectionRange: parseFloat(row['Detection Range(Circle)']) || 0,
      SignalIntensity: row['Singal Intensity(At most 5)'] ? parseFloat(row['Singal Intensity(At most 5)']) : undefined,
      VideoFeedbackOn: row['Video FeedbackOn'] ? row['Video FeedbackOn'].toLowerCase() === 'yes' ? 'Yes' : 'No' : undefined,
    };

    data.push(normalizedRow);
  }

  return data;
}

export function getTimePoints(data: DroneData[]): string[] {
  const timePoints = new Set<string>();
  data.forEach(d => timePoints.add(d.TimePoint));
  return Array.from(timePoints).sort();
}

export function getDataForTimePoint(data: DroneData[], timePoint: string): DroneData[] {
  return data.filter(d => d.TimePoint === timePoint);
}

export function calculateSwarmBatteryTimeline(data: DroneData[]) {
  const timePoints = getTimePoints(data);
  const swarmIds = Array.from(new Set(data.map(d => d.SwarmID))).sort((a, b) => a - b);

  const timeline: { [key: string]: { [key: number]: number[] } } = {};

  data.forEach(d => {
    if (!timeline[d.TimePoint]) {
      timeline[d.TimePoint] = {};
    }
    if (!timeline[d.TimePoint][d.SwarmID]) {
      timeline[d.TimePoint][d.SwarmID] = [];
    }
    timeline[d.TimePoint][d.SwarmID].push(d.BatteryPercentage);
  });

  const result: { timePoint: string; swarmId: number; avgBattery: number }[] = [];

  timePoints.forEach(tp => {
    swarmIds.forEach(swarmId => {
      if (timeline[tp] && timeline[tp][swarmId]) {
        const batteries = timeline[tp][swarmId];
        const avg = batteries.reduce((a, b) => a + b, 0) / batteries.length;
        result.push({ timePoint: tp, swarmId, avgBattery: avg });
      }
    });
  });

  return result;
}