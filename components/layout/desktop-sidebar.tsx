"use client";

import Link from "next/link";
import {
  Activity,
  CalendarDays,
  ChartNoAxesCombined,
  Home,
  Settings,
  Trophy,
  Bike,
  Waves,
  Footprints,
} from "lucide-react";

const mainNavigation = [
  {
    label: "Overview",
    href: "/",
    icon: Home,
  },
  {
    label: "Runs",
    href: "/runs",
    icon: Activity,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Records",
    href: "/records",
    icon: Trophy,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
];

const activities = [
  {
    label: "Cycling",
    href: "/activities?type=cycling",
    icon: Bike,
  },
  {
    label: "Swimming",
    href: "/activities?type=swimming",
    icon: Waves,
  },
  {
    label: "Walking",
    href: "/activities?type=walking",
    icon: Footprints,
  },
];

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/"
          className="text-base font-bold tracking-tight"
        >
          Run Performance
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Performance
          </p>

          {mainNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Activities
          </p>

          {activities.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="size-4" strokeWidth={1.8} />
          Settings
        </Link>
      </div>
    </aside>
  );
}