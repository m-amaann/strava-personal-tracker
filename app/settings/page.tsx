import Image from "next/image";

import {
  Link2,
  User,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SettingsContent } from "@/components/settings/settings-content";

import {
  getAthlete,
  getAllRuns,
  getGear,
} from "@/lib/strava/api";

import type {
  StravaActivity,
  StravaAthlete,
} from "@/lib/strava/types";

export const dynamic = "force-dynamic";

type GearItem = {
  name: string;
  status?: string;
};

export default async function SettingsPage() {
  /*
   * --------------------------------------------------------------------------
   * Strava athlete
   * --------------------------------------------------------------------------
   */

  let athlete: StravaAthlete | null = null;

  try {
    athlete = await getAthlete();
  } catch (error) {
    console.error(
      "Failed to load Strava athlete:",
      error,
    );

    athlete = null;
  }

  const connected = Boolean(athlete);

  const athleteName = athlete
    ? [
        athlete.firstname,
        athlete.lastname,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  /*
   * --------------------------------------------------------------------------
   * Strava activities
   * --------------------------------------------------------------------------
   */

  let runs: StravaActivity[] = [];

  if (connected) {
    try {
      runs = await getAllRuns();
    } catch (error) {
      console.error(
        "Failed to load Strava activities:",
        error,
      );

      runs = [];
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Detect primary watch / device
   * --------------------------------------------------------------------------
   */

  const deviceCounts =
    new Map<string, number>();

  for (const run of runs) {
    const deviceName =
      run.device_name?.trim();

    if (!deviceName) {
      continue;
    }

    deviceCounts.set(
      deviceName,
      (deviceCounts.get(deviceName) ?? 0) + 1,
    );
  }

  let watch: GearItem | null = null;

  const sortedDevices =
    Array.from(deviceCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    );

  const primaryDevice =
    sortedDevices[0];

  if (primaryDevice) {
    const [
      deviceName,
      runCount,
    ] = primaryDevice;

    watch = {
      name: deviceName,
      status:
        runCount === 1
          ? "1 run recorded"
          : `${runCount} runs recorded`,
    };
  }

  /*
   * --------------------------------------------------------------------------
   * Find unique gear IDs
   * --------------------------------------------------------------------------
   */

  const gearIds = Array.from(
    new Set(
      runs
        .map(
          (run) => run.gear_id,
        )
        .filter(
          (
            gearId,
          ): gearId is string =>
            typeof gearId === "string" &&
            gearId.trim().length > 0,
        ),
    ),
  );

  /*
   * --------------------------------------------------------------------------
   * Fetch real Strava shoes
   * --------------------------------------------------------------------------
   */

  const shoes: GearItem[] = [];

  for (const gearId of gearIds) {
    try {
      const gear =
        await getGear(gearId);

      if (
        !gear ||
        typeof gear.name !== "string" ||
        gear.name.trim().length === 0
      ) {
        continue;
      }

      const distance =
        typeof gear.distance === "number" &&
        Number.isFinite(gear.distance)
          ? gear.distance
          : null;

      shoes.push({
        name: gear.name.trim(),

        ...(distance !== null
          ? {
              status: `${Math.round(
                distance / 1000,
              )} km`,
            }
          : {}),
      });
    } catch (error) {
      console.error(
        `Failed to load Strava gear ${gearId}:`,
        error,
      );
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  return (
    <AppShell>
      <main
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          pb-24
          pt-5
          sm:px-6
          sm:pt-6
          md:px-8
          md:pt-8
          lg:px-10
          lg:py-10
          xl:px-12
          2xl:px-16
        "
      >
        {/* Page header */}

        <header
          className="
            mb-5
            sm:mb-6
            md:mb-8
          "
        >
          <p
            className="
              text-xs
              font-medium
              text-muted-foreground
              sm:text-sm
            "
          >
            Account & preferences
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
              md:text-4xl
            "
          >
            Settings
          </h1>
        </header>

        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:gap-6
            lg:grid-cols-[minmax(0,1fr)_280px]
            lg:items-start
            lg:gap-8
            xl:grid-cols-[minmax(0,1fr)_320px]
            xl:gap-10
          "
        >
          {/* Main content */}

          <div className="min-w-0">
            {/* Strava athlete */}

            {athlete && (
              <section
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-border/70
                  bg-card
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                    p-4
                    sm:gap-4
                    sm:p-5
                    md:p-6
                  "
                >
                  {athlete.profile ? (
                    <Image
                      src={athlete.profile}
                      alt={
                        athleteName ||
                        "Strava athlete"
                      }
                      width={56}
                      height={56}
                      className="
                        size-11
                        shrink-0
                        rounded-full
                        object-cover
                        sm:size-12
                        md:size-14
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        size-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#FFF1EB]
                        text-[#FC4C02]
                        sm:size-12
                        md:size-14
                      "
                    >
                      <User
                        className="
                          size-5
                          sm:size-6
                          md:size-7
                        "
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2
                      className="
                        truncate
                        text-sm
                        font-bold
                        sm:text-base
                      "
                    >
                      {athleteName ||
                        athlete.username ||
                        "Strava Athlete"}
                    </h2>

                    {athlete.username && (
                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[11px]
                          text-muted-foreground
                          sm:text-xs
                        "
                      >
                        @{athlete.username}
                      </p>
                    )}
                  </div>

                  <span
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-full
                      bg-emerald-50
                      px-2
                      py-1
                      text-[9px]
                      font-semibold
                      text-emerald-600
                      sm:px-2.5
                      sm:text-[10px]
                    "
                  >
                    <span
                      className="
                        size-1.5
                        rounded-full
                        bg-emerald-500
                      "
                    />

                    <span className="hidden sm:inline">
                      Connected
                    </span>

                    <span className="sm:hidden">
                      On
                    </span>
                  </span>
                </div>
              </section>
            )}

            {/* Connection */}

            <section className="mt-5 sm:mt-6">
              <p
                className="
                  mb-2
                  px-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-muted-foreground
                  sm:text-[11px]
                "
              >
                Connection
              </p>

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-border/70
                  bg-card
                  p-4
                  sm:gap-4
                  sm:p-5
                  md:p-6
                "
              >
                <div
                  className="
                    flex
                    size-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                    sm:size-11
                  "
                >
                  <Link2 className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      flex
                      min-w-0
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                      "
                    >
                      Strava Connection
                    </p>

                    <span
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1
                        rounded-full
                        bg-emerald-50
                        px-2
                        py-0.5
                        text-[9px]
                        font-semibold
                        text-emerald-600
                        sm:text-[10px]
                      "
                    >
                      <span
                        className="
                          size-1.5
                          rounded-full
                          bg-emerald-500
                        "
                      />

                      Connected
                    </span>
                  </div>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[11px]
                      text-muted-foreground
                      sm:text-xs
                    "
                  >
                    {athleteName ||
                      athlete?.username ||
                      "Strava account"}
                  </p>
                </div>
              </div>
            </section>

            {/* Settings */}

            <div
              className="
                mt-5
                sm:mt-6
                md:mt-8
              "
            >
              <SettingsContent
                watch={watch}
                shoes={shoes}
              />
            </div>
          </div>

          {/* Desktop side information */}

          <aside className="hidden lg:block">
            <div
              className="
                sticky
                top-6
                rounded-2xl
                border
                border-border/70
                bg-card
                p-5
                xl:p-6
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-muted-foreground
                "
              >
                Performance
              </p>

              <h2
                className="
                  mt-2
                  text-sm
                  font-semibold
                "
              >
                Personalize your metrics
              </h2>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-muted-foreground
                "
              >
                Configure your personal fitness
                information to make performance
                metrics more meaningful.
              </p>

              <div
                className="
                  mt-5
                  rounded-xl
                  bg-muted/50
                  p-3
                "
              >
                <p
                  className="
                    text-[10px]
                    leading-4
                    text-muted-foreground
                  "
                >
                  Your preferences are stored
                  locally in your browser. They
                  do not modify your Strava
                  account.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}