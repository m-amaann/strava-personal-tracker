export type ProgressPeriod = "4-weeks" | "12-weeks" | "6-months" | "1-year";

export interface ProgressPoint {
  label: string;
  distance: number;
  pace: number;
  heartRate: number;
}

export const progressData: Record<ProgressPeriod, ProgressPoint[]> = {
  "4-weeks": [
    {
      label: "Week 1",
      distance: 12.4,
      pace: 7.12,
      heartRate: 154,
    },
    {
      label: "Week 2",
      distance: 15.8,
      pace: 6.58,
      heartRate: 152,
    },
    {
      label: "Week 3",
      distance: 14.2,
      pace: 6.51,
      heartRate: 150,
    },
    {
      label: "Week 4",
      distance: 18.42,
      pace: 6.38,
      heartRate: 151,
    },
  ],

  "12-weeks": [
    {
      label: "W1",
      distance: 10.2,
      pace: 7.32,
      heartRate: 158,
    },
    {
      label: "W2",
      distance: 12.8,
      pace: 7.18,
      heartRate: 157,
    },
    {
      label: "W3",
      distance: 11.6,
      pace: 7.04,
      heartRate: 156,
    },
    {
      label: "W4",
      distance: 14.2,
      pace: 6.52,
      heartRate: 154,
    },
    {
      label: "W5",
      distance: 13.4,
      pace: 6.48,
      heartRate: 153,
    },
    {
      label: "W6",
      distance: 16.1,
      pace: 6.42,
      heartRate: 152,
    },
    {
      label: "W7",
      distance: 14.8,
      pace: 6.51,
      heartRate: 154,
    },
    {
      label: "W8",
      distance: 17.6,
      pace: 6.35,
      heartRate: 151,
    },
    {
      label: "W9",
      distance: 16.2,
      pace: 6.31,
      heartRate: 150,
    },
    {
      label: "W10",
      distance: 18.8,
      pace: 6.22,
      heartRate: 149,
    },
    {
      label: "W11",
      distance: 17.4,
      pace: 6.28,
      heartRate: 150,
    },
    {
      label: "W12",
      distance: 18.42,
      pace: 6.38,
      heartRate: 151,
    },
  ],

  "6-months": [
    {
      label: "Mar",
      distance: 32.4,
      pace: 7.18,
      heartRate: 158,
    },
    {
      label: "Apr",
      distance: 48.6,
      pace: 7.02,
      heartRate: 156,
    },
    {
      label: "May",
      distance: 56.8,
      pace: 6.52,
      heartRate: 154,
    },
    {
      label: "Jun",
      distance: 61.4,
      pace: 6.44,
      heartRate: 153,
    },
    {
      label: "Jul",
      distance: 68.2,
      pace: 6.32,
      heartRate: 151,
    },
    {
      label: "Aug",
      distance: 72.6,
      pace: 6.38,
      heartRate: 151,
    },
  ],

  "1-year": [
    {
      label: "Sep",
      distance: 28.4,
      pace: 7.42,
      heartRate: 162,
    },
    {
      label: "Oct",
      distance: 34.8,
      pace: 7.31,
      heartRate: 160,
    },
    {
      label: "Nov",
      distance: 41.2,
      pace: 7.18,
      heartRate: 158,
    },
    {
      label: "Dec",
      distance: 45.6,
      pace: 7.04,
      heartRate: 157,
    },
    {
      label: "Jan",
      distance: 52.4,
      pace: 6.52,
      heartRate: 155,
    },
    {
      label: "Feb",
      distance: 58.2,
      pace: 6.48,
      heartRate: 154,
    },
    {
      label: "Mar",
      distance: 61.4,
      pace: 6.44,
      heartRate: 153,
    },
    {
      label: "Apr",
      distance: 64.8,
      pace: 6.42,
      heartRate: 153,
    },
    {
      label: "May",
      distance: 68.6,
      pace: 6.35,
      heartRate: 152,
    },
    {
      label: "Jun",
      distance: 71.2,
      pace: 6.31,
      heartRate: 151,
    },
    {
      label: "Jul",
      distance: 74.8,
      pace: 6.28,
      heartRate: 150,
    },
    {
      label: "Aug",
      distance: 72.6,
      pace: 6.38,
      heartRate: 151,
    },
  ],
};

export const progressPeriods = [
  {
    id: "4-weeks" as const,
    label: "4 Weeks",
  },
  {
    id: "12-weeks" as const,
    label: "12 Weeks",
  },
  {
    id: "6-months" as const,
    label: "6 Months",
  },
  {
    id: "1-year" as const,
    label: "1 Year",
  },
];