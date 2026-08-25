export type ProgressPeriod =
  | "4-weeks"
  | "12-weeks"
  | "6-months"
  | "1-year";


export type ProgressPoint = {
  label: string;
  distance: number;
  pace: number;
  heartRate: number;
};


export const progressPeriods = [
  {
    id: "4-weeks",
    label: "4 Weeks",
  },
  {
    id: "12-weeks",
    label: "12 Weeks",
  },
  {
    id: "6-months",
    label: "6 Months",
  },
  {
    id: "1-year",
    label: "1 Year",
  },
] as const;