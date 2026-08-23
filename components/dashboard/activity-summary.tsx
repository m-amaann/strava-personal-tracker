import {
  Bike,
  Footprints,
  SportShoe,
  PersonStanding,
  Waves,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { getYearToDateActivities } from "@/lib/strava/api";

import {
  getActivityType,
} from "@/lib/strava/activity-utils";

import type {
  StravaActivity,
} from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDistance(
  meters: number,
) {
  const kilometers = meters / 1000;

  if (kilometers === 0) {
    return "0";
  }

  if (kilometers < 10) {
    return kilometers.toFixed(1);
  }

  return kilometers.toFixed(1);
}

function getDistance(
  activities: StravaActivity[],
  type:
    | "Run"
    | "Treadmill"
    | "Ride"
    | "Swim"
    | "Walk"
    | "Hike",
) {
  return activities
    .filter(
      (activity) =>
        getActivityType(activity) === type,
    )
    .reduce(
      (total, activity) =>
        total + activity.distance,
      0,
    );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export async function ActivitySummary() {
  let activities: StravaActivity[] =
    [];

  try {
    activities =
      await getYearToDateActivities();
  } catch (error) {
    console.error(
      "Failed to fetch Strava activity summary:",
      error,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Distances                                                                */
  /* ------------------------------------------------------------------------ */

  const runningDistance =
    getDistance(
      activities,
      "Run",
    );

  const treadmillDistance =
    getDistance(
      activities,
      "Treadmill",
    );

  const cyclingDistance =
    getDistance(
      activities,
      "Ride",
    );

  const swimmingDistance =
    getDistance(
      activities,
      "Swim",
    );

  const walkingDistance =
    getDistance(
      activities,
      "Walk",
    );

  const hikingDistance =
    getDistance(
      activities,
      "Hike",
    );

  /*
   * Total activity distance.
   *
   * Everything is calculated from the same
   * Strava activity collection.
   */
  const totalDistance =
    runningDistance +
    treadmillDistance +
    cyclingDistance +
    swimmingDistance +
    walkingDistance +
    hikingDistance;

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  const activityItems = [
    {
      label: "Running",
      distance:
        formatDistance(
          runningDistance,
        ),
      unit: "km",
      icon: SportShoe,
      iconClass:
        "bg-[#FFF1EB] text-[#FC4C02] dark:bg-[#FC4C02]/10 dark:text-[#FF7043]",
    },
    {
      label: "Treadmill",
      distance:
        formatDistance(
          treadmillDistance,
        ),
      unit: "km",
      icon: PersonStanding,
      iconClass:
        "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    },
    {
      label: "Cycling",
      distance:
        formatDistance(
          cyclingDistance,
        ),
      unit: "km",
      icon: Bike,
      iconClass:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "Swimming",
      distance:
        formatDistance(
          swimmingDistance,
        ),
      unit: "km",
      icon: Waves,
      iconClass:
        "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
    },
    {
      label: "Walking",
      distance:
        formatDistance(
          walkingDistance,
        ),
      unit: "km",
      icon: Footprints,
      iconClass:
        "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    },
    {
      label: "Hiking",
      distance:
        formatDistance(
          hikingDistance,
        ),
      unit: "km",
      icon: Footprints,
      iconClass:
        "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    },
  ];

  return (
    <Card className="relative overflow-hidden border-0 bg-linear-to-br from-[#172554] via-[#1E3A8A] to-[#2563EB] text-white shadow-sm">
      {/* Decorative background */}

      <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-white/8" />

      <div className="pointer-events-none absolute -bottom-28 -left-16 size-52 rounded-full bg-black/10" />

      <div className="relative p-5 sm:p-6 lg:p-7">
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
              This Year
            </p>

            <p className="mt-1 text-xs text-white/60">
              Total activity distance
            </p>
          </div>

          <div className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
            All activities
          </div>
        </div>

        {/* Total distance */}

        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight sm:text-5xl">
              {formatDistance(
                totalDistance,
              )}
            </span>

            <span className="text-base font-medium text-white/60">
              km
            </span>
          </div>

          <p className="mt-1 text-xs text-white/60 sm:text-sm">
            Across running, treadmill,
            cycling, swimming, walking
            and hiking
          </p>
        </div>

        {/* Activity breakdown */}

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-0 sm:divide-x sm:divide-white/15">
          {activityItems.map(
            (activity) => {
              const Icon =
                activity.icon;

              return (
                <div
                  key={
                    activity.label
                  }
                  className="flex items-center gap-3 rounded-xl bg-white/8 p-3 backdrop-blur-sm sm:rounded-none sm:bg-transparent sm:px-4 sm:first:pl-0 sm:last:pr-0"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${activity.iconClass}`}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      {
                        activity.distance
                      }{" "}
                      <span className="text-[10px] font-medium text-white/60">
                        {
                          activity.unit
                        }
                      </span>
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/55">
                      {
                        activity.label
                      }
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </Card>
  );
}