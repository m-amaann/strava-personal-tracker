
import { AppShell } from "@/components/layout/app-shell";
import { ActivityCalendar } from "@/components/calendar/activity-calendar";

import {
  getCalendarMonth,
  type CalendarDayData,
} from "@/lib/strava/calendar";



type CalendarPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};



export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const params = await searchParams;

  const now = new Date();



  const parsedYear = Number.parseInt(
    params.year ?? "",
    10,
  );

  const year =
    Number.isFinite(parsedYear) &&
    parsedYear >= 2000 &&
    parsedYear <= 2100
      ? parsedYear
      : now.getFullYear();



  const parsedMonth = Number.parseInt(
    params.month ?? "",
    10,
  );

  const month =
    Number.isFinite(parsedMonth) &&
    parsedMonth >= 0 &&
    parsedMonth <= 11
      ? parsedMonth
      : now.getMonth();


  let days: CalendarDayData[] = [];

  try {
    days = await getCalendarMonth(
      year,
      month,
    );
  } catch (error) {
    console.error(
      "Failed to load calendar activities:",
      error,
    );

    days = [];
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


        {/* Page Headers */}

        <section>
          <p
            className="
              text-xs
              font-medium
              text-muted-foreground
            "
          >
            Training schedule
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
            "
          >
            Calendar
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            View your running activities and training history.
          </p>
        </section>


        <section
          className="mt-6"
        >
          <ActivityCalendar
            year={year}
            month={month}
            days={days}
          />
        </section>
      </main>
    </AppShell>
  );
}