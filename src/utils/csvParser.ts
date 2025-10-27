import { DroneData } from '../types/drone';

export async function parseDroneCSV(csvText: string): Promise<DroneData[]> {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  const data: DroneData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index].trim();
    });

    const normalizedRow: DroneData = {
      DroneID: parseInt(row['DroneID']),
      TimePoint: row['TimePoint'],
      SwarmID: parseInt(row['SwarmID']),
      TaskID: isNaN(parseInt(row['TaskID'])) ? row['TaskID'] : parseInt(row['TaskID']),
      State: row['State'],
      PositionX: parseFloat(row['PositionX']),
      PositionY: parseFloat(row['PositionY']),
      PositionZ: parseFloat(row['PositionZ']),
      VelocityX: parseFloat(row['VelocityX']),
      VelocityY: parseFloat(row['VelocityY']),
      VelocityZ: parseFloat(row['VelocityZ']),
      Pitch: parseFloat(row['Pitch']),
      Roll: parseFloat(row['Roll']),
      Yaw: parseFloat(row['Yaw']),
      BatteryPercentage: parseFloat(row['Battery Percentage']),
      DetectionRange: parseFloat(row['Detection Range(Circle)']),
      SignalIntensity: row['Singal Intensity(At most 5)'] ? parseFloat(row['Singal Intensity(At most 5)']) : undefined,
      VideoFeedbackOn: row['Video FeedbackOn'] || undefined,
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