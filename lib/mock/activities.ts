export type MockRun = {
  id: string;
  name: string;
  date: string;
  distance: number;
  pace: string;
  heartRate: number;
  time: string;
  elevation: number;
  calories: number;
  cadence: number;
  maxHeartRate: number;
  avgSpeed: number;
};

export const mockRuns: MockRun[] = [
  {
    id: "run-001",
    name: "Morning Run",
    date: "Aug 21 · 6:15 AM",
    distance: 5.02,
    pace: "6:42",
    heartRate: 148,
    time: "33:38",
    elevation: 42,
    calories: 382,
    cadence: 168,
    maxHeartRate: 164,
    avgSpeed: 8.96,
  },
  {
    id: "run-002",
    name: "Easy Run",
    date: "Aug 19 · 6:20 AM",
    distance: 6.1,
    pace: "6:55",
    heartRate: 145,
    time: "42:11",
    elevation: 56,
    calories: 461,
    cadence: 166,
    maxHeartRate: 159,
    avgSpeed: 8.67,
  },
  {
    id: "run-003",
    name: "Long Run",
    date: "Aug 17 · 6:05 AM",
    distance: 8.42,
    pace: "7:01",
    heartRate: 149,
    time: "59:02",
    elevation: 84,
    calories: 642,
    cadence: 164,
    maxHeartRate: 167,
    avgSpeed: 8.55,
  },
  {
    id: "run-004",
    name: "Recovery Run",
    date: "Aug 15 · 6:30 AM",
    distance: 4.2,
    pace: "7:12",
    heartRate: 142,
    time: "30:14",
    elevation: 31,
    calories: 315,
    cadence: 162,
    maxHeartRate: 153,
    avgSpeed: 8.33,
  },
];

export function getMockRun(id: string) {
  return mockRuns.find((run) => run.id === id);
}