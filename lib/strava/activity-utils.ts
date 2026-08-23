import type { StravaActivity } from "@/lib/strava/types";

export type DashboardActivityType =
  | "Run"
  | "Treadmill"
  | "Walk"
  | "Hike"
  | "Ride"
  | "Swim"
  | "Other";

export function getActivityType(
  activity: StravaActivity,
): DashboardActivityType {
  const type =
    activity.sport_type ??
    activity.type;

  switch (type) {
    case "Run":
      return "Run";

    case "Treadmill":
      return "Treadmill";

    case "Walk":
      return "Walk";

    case "Hike":
      return "Hike";

    case "Ride":
    case "VirtualRide":
    case "EBikeRide":
    case "EMountainBikeRide":
      return "Ride";

    case "Swim":
      return "Swim";

    default:
      return "Other";
  }
}

export function isRunningActivity(
  activity: StravaActivity,
) {
  const type =
    getActivityType(activity);

  return (
    type === "Run" ||
    type === "Treadmill"
  );
}