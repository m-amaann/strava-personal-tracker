export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/app-shell";

import { ActivityCalendar } from "@/components/calendar/activity-calendar";

import {
  getCalendarMonth,
  type CalendarDayData,
} from "@/lib/strava/calendar";

export default async function CalendarPage() {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  let days: CalendarDayData[] = [];

  try {
    days = await getCalendarMonth(
      year,
      month,
    );
  } catch (error) {
    console.error(
      "Failed to load Strava calendar:",
      error,
    );
  }

  return (
    <AppShell>
      <main
        className="
          mx-auto
          w-full
          max-w-5xl
          px-4
          py-5
          pb-24
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >
        <ActivityCalendar
          year={year}
          month={month}
          days={days}
        />
      </main>
    </AppShell>
  );
}