export type ActivityType = "running" | "cycling" | "swimming" | "walking";

export interface CalendarActivity {
  id: string;
  date: string;
  type: ActivityType;
  name: string;
  distance: number;
  duration: string;
  pace?: string;
}

export const calendarActivities: CalendarActivity[] = [
  {
    id: "aug-1-run",
    date: "2026-08-01",
    type: "running",
    name: "Morning Run",
    distance: 6.2,
    duration: "40:12",
    pace: "6:29 /km",
  },
  {
    id: "aug-04-cycle",
    date: "2026-08-04",
    type: "cycling",
    name: "Evening Ride",
    distance: 24.8,
    duration: "1:12:34",
  },
  {
    id: "aug-06-run",
    date: "2026-08-06",
    type: "running",
    name: "Easy Run",
    distance: 5.4,
    duration: "36:21",
    pace: "6:44 /km",
  },
  {
    id: "aug-08-walk",
    date: "2026-08-08",
    type: "walking",
    name: "Morning Walk",
    distance: 4.2,
    duration: "52:18",
  },
  {
    id: "aug-10-run",
    date: "2026-08-10",
    type: "running",
    name: "Tempo Run",
    distance: 8.4,
    duration: "52:41",
    pace: "6:16 /km",
  },
  {
    id: "aug-12-swim",
    date: "2026-08-12",
    type: "swimming",
    name: "Pool Session",
    distance: 2.1,
    duration: "48:20",
  },
  {
    id: "aug-14-cycle",
    date: "2026-08-14",
    type: "cycling",
    name: "Weekend Ride",
    distance: 32.6,
    duration: "1:42:15",
  },
  {
    id: "aug-15-run",
    date: "2026-08-15",
    type: "running",
    name: "Long Run",
    distance: 12.8,
    duration: "1:24:36",
    pace: "6:36 /km",
  },
  {
    id: "aug-18-run",
    date: "2026-08-18",
    type: "running",
    name: "Morning Run",
    distance: 8.42,
    duration: "54:12",
    pace: "6:26 /km",
  },
  {
    id: "aug-19-walk",
    date: "2026-08-19",
    type: "walking",
    name: "Evening Walk",
    distance: 2.4,
    duration: "31:20",
  },
  {
    id: "aug-21-run",
    date: "2026-08-21",
    type: "running",
    name: "Recovery Run",
    distance: 4.6,
    duration: "31:02",
    pace: "6:45 /km",
  },
];

export const activityTypeStyles: Record<
  ActivityType,
  {
    label: string;
    color: string;
    background: string;
  }
> = {
  running: {
    label: "Running",
    color: "#FC4C02",
    background: "#FFF1EB",
  },
  cycling: {
    label: "Cycling",
    color: "#2563EB",
    background: "#EFF6FF",
  },
  swimming: {
    label: "Swimming",
    color: "#0891B2",
    background: "#ECFEFF",
  },
  walking: {
    label: "Walking",
    color: "#16A34A",
    background: "#F0FDF4",
  },
};