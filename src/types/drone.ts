export interface DroneData {
  DroneID: number;
  TimePoint: string;
  SwarmID: number;
  TaskID: number | string;
  State: string;
  PositionX: number;
  PositionY: number;
  PositionZ: number;
  VelocityX: number;
  VelocityY: number;
  VelocityZ: number;
  Pitch: number;
  Roll: number;
  Yaw: number;
  BatteryPercentage: number;
  DetectionRange: number;
}

export interface SwarmTimeline {
  timePoint: string;
  swarmId: number;
  avgBattery: number;
}