"use client";

import {
  Bike,
  PersonStanding,
  Waves,
  SportShoe,
} from "lucide-react";

import type {
  ActivityType,
} from "@/lib/strava/calendar";

interface CalendarDayProps {
  day: number;

  activityTypes: ActivityType[];

  selected: boolean;

  onClick: () => void;
}

const activityConfig: Record<
  ActivityType,
  {
    background: string;
    icon: typeof SportShoe;
  }
> = {
  running: {
    background: "bg-[#FC4C02]",
    icon: SportShoe,
  },

  cycling: {
    background: "bg-blue-500",
    icon: Bike,
  },

  swimming: {
    background:
      "bg-cyan-500",
    icon: Waves,
  },

  walking: {
    background:
      "bg-emerald-500",
    icon: PersonStanding,
  },
};

export function CalendarDay({
  day,
  activityTypes,
  selected,
  onClick,
}: CalendarDayProps) {
  const hasActivity =
    activityTypes.length > 0;

  const primaryActivity =
    activityTypes[0];

  const config =
    primaryActivity
      ? activityConfig[
      primaryActivity
      ]
      : null;

  const Icon =
    config?.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        hasActivity
          ? `${day}, ${activityTypes.join(
            ", ",
          )} activity`
          : `${day}`
      }
      className="
        group
        relative
        flex
        h-13.5
        w-full
        items-center
        justify-center
        rounded-xl
        outline-none
        transition-all
        duration-200
        sm:h-16.5
        sm:rounded-2xl
        focus-visible:ring-2
        focus-visible:ring-[#FC4C02]/30
      "
    >
      {!hasActivity && (
        <span
          className="
            flex
            size-7
            items-center
            justify-center
            rounded-full
            text-[11px]
            font-medium
            text-muted-foreground
            transition-all
            duration-200
            group-hover:bg-muted
            group-hover:text-foreground
            sm:size-8
            sm:text-xs
          "
        >
          {day}
        </span>
      )}

      {hasActivity &&
        config &&
        Icon && (
          <span
            className={`
              flex
              size-8
              items-center
              justify-center
              rounded-full
              ${config.background}
              shadow-[0_2px_8px_rgba(0,0,0,0.12)]
              transition-all
              duration-200
              group-hover:scale-110
              group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)]
              sm:size-9

              ${selected
                ? `
                    scale-110
                    ring-2
                    ring-[#FC4C02]/30
                    ring-offset-2
                    ring-offset-background
                  `
                : ""
              }
            `}
          >
            <Icon className="size-4.5 text-white sm:size-5" />
          </span>
        )}

      {activityTypes.length > 1 && (
        <span
          className="
            absolute
            bottom-2
            size-1
            rounded-full
            bg-foreground/30
            sm:bottom-3
          "
        />
      )}
    </button>
  );
}