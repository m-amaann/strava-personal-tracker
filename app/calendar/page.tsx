import { AppShell } from "@/components/layout/app-shell";

import { ActivityCalendar } from "@/components/calendar/activity-calendar";

import {
  getCalendarMonth,
  type CalendarDayData,
} from "@/lib/strava/calendar";

export const dynamic =
  "force-dynamic";

type CalendarPageProps = {
  searchParams: Promise<{
    year?: string;

    month?: string;
  }>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const params =
    await searchParams;

  const now = new Date();

  /* ------------------------------------------------------------------------ */
  /* Read year from URL                                                       */
  /* ------------------------------------------------------------------------ */

  const parsedYear =
    Number.parseInt(
      params.year ?? "",
      10,
    );

  const year =
    Number.isFinite(
      parsedYear,
    ) &&
    parsedYear >= 2000 &&
    parsedYear <= 2100
      ? parsedYear
      : now.getFullYear();

  /* ------------------------------------------------------------------------ */
  /* Read month from URL                                                      */
  /* ------------------------------------------------------------------------ */

  const parsedMonth =
    Number.parseInt(
      params.month ?? "",
      10,
    );

  const month =
    Number.isFinite(
      parsedMonth,
    ) &&
    parsedMonth >= 0 &&
    parsedMonth <= 11
      ? parsedMonth
      : now.getMonth();

  /* ------------------------------------------------------------------------ */
  /* Fetch Strava calendar data                                               */
  /* ------------------------------------------------------------------------ */

  let days: CalendarDayData[] =
    [];

  try {
    days =
      await getCalendarMonth(
        year,
        month,
      );
  } catch (error) {
    console.error(
      "Failed to load Strava calendar:",
      error,
    );

    days = [];
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

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