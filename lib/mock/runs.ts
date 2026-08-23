export type MockRun = {
  id: string;
  name: string;
  date: string;
  time: string;
  distance: number;
  pace: string;
  duration: string;
  avgHeartRate: number;
  maxHeartRate: number;
  elevationGain: number;
  calories: number;
};

export const mockRuns: MockRun[] = [
  {
    id: "run-001",
    name: "Morning Run",
    date: "Aug 21, 2026",
    time: "6:15 AM",
    distance: 5.02,
    pace: "6:42",
    duration: "33:38",
    avgHeartRate: 148,
    maxHeartRate: 169,
    elevationGain: 42,
    calories: 412,
  },
  {
    id: "run-002",
    name: "Easy Run",
    date: "Aug 19, 2026",
    time: "6:20 AM",
    distance: 6.1,
    pace: "6:55",
    duration: "42:11",
    avgHeartRate: 145,
    maxHeartRate: 163,
    elevationGain: 38,
    calories: 468,
  },
  {
    id: "run-003",
    name: "Long Run",
    date: "Aug 17, 2026",
    time: "6:05 AM",
    distance: 8.42,
    pace: "7:01",
    duration: "59:02",
    avgHeartRate: 149,
    maxHeartRate: 171,
    elevationGain: 76,
    calories: 632,
  },
  {
    id: "run-004",
    name: "Tempo Run",
    date: "Aug 14, 2026",
    time: "6:10 AM",
    distance: 5.21,
    pace: "6:18",
    duration: "32:49",
    avgHeartRate: 152,
    maxHeartRate: 174,
    elevationGain: 41,
    calories: 438,
  },
];