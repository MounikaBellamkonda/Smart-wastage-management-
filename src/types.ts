export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';

export type CollectionStatus = 'Pending' | 'In Progress' | 'Collected';

export type BinType = 'General Waste' | 'Recyclable' | 'Organic' | 'Hazardous';

export interface HistoricalReading {
  timestamp: string;
  fillLevel: number;
}

export interface BinRecord {
  id: string;
  location: string;
  currentFill: number; // 0 to 100
  predictedFill: number; // 0 to 100
  estimatedTimeToFull: string; // e.g. "20 minutes", "55 minutes", "2 hours"
  priority: PriorityLevel;
  collectionStatus: CollectionStatus;
  lastReadingTime: string; // e.g. "12 mins ago"
  capacityLitres: number; // e.g. 240, 660, 1100
  binType: BinType;
  hourlyFillRate: number; // % increase per hour
  historicalReadings: HistoricalReading[];
  notes?: string;
  lastCollectedAt?: string;
}

export interface ThresholdSettings {
  urgentMin: number; // default 90
  highMin: number;   // default 70
  mediumMin: number; // default 40
}

export type PageTab = 
  | 'overview' 
  | 'monitoring' 
  | 'predictions' 
  | 'planning' 
  | 'reports' 
  | 'settings';
