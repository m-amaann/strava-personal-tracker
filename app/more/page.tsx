import Image from "next/image";
import {
  ChevronRight,
  Link2,
  Settings,
  User,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { getAthlete } from "@/lib/strava/api";

const settingsItems = [
  {
    label: "Settings",
    description: "Manage your preferences",
    href: "/more/settings",
    icon: Settings,
  },
];

export default async function MorePage() {
  let athlete = null;

  try {
    athlete = await getAthlete();
  } catch {
    athlete = null;
  }

  const connected = Boolean(athlete);

  const athleteName = athlete
    ? [athlete.firstname, athlete.lastname]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <AppShell>
      <main
        className="
          mx-auto w-full max-w-2xl
          px-4 pb-24 pt-5
          sm:px-6
          lg:max-w-4xl
          lg:px-8
          lg:py-8
        "
      >
        {/* Header */}
        <header className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Account & preferences
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            More
          </h1>
        </header>

        {/* Connected Athlete */}
        {athlete && (
          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="flex items-center gap-4 p-5">
              {athlete.profile ? (
                <Image
                  src={athlete.profile}
                  alt={athleteName || "Strava athlete"}
                  width={48}
                  height={48}
                  className="size-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className="
                    flex size-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF1EB]
                    text-[#FC4C02]
                  "
                >
                  <User className="size-6" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold">
                  {athleteName ||
                    athlete.username ||
                    "Strava Athlete"}
                </h2>

                {athlete.username && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
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
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-emerald-600
                "
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
          </section>
        )}

        {/* Connection */}
        <section className="mt-6">
          <p
            className="
              mb-2 px-1
              text-[11px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            Connection
          </p>

          {connected ? (
            <div
              className="
                flex items-center
                gap-4
                rounded-2xl
                border border-border/70
                bg-card
                p-4
              "
            >
              <div
                className="
                  flex size-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-600
                "
              >
                <Link2 className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    Strava Connection
                  </p>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-emerald-50
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      text-emerald-600
                    "
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                </div>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {athleteName ||
                    athlete?.username ||
                    "Strava athlete"}
                </p>
              </div>
            </div>
          ) : (
            <a
              href="/api/strava/auth/connect"
              className="
                group flex items-center
                gap-4 rounded-2xl
                border border-border/70
                bg-card p-4
                transition-all duration-200
                hover:border-[#FC4C02]/30
                hover:shadow-sm
              "
            >
              <div
                className="
                  flex size-10 shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#FFF1EB]
                  text-[#FC4C02]
                "
              >
                <Link2 className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    Strava Connection
                  </p>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-muted
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      text-muted-foreground
                    "
                  >
                    <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                    Not connected
                  </span>
                </div>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Connect your Strava account
                </p>
              </div>

              <ChevronRight
                className="
                  size-4 shrink-0
                  text-muted-foreground
                  transition-all duration-200
                  group-hover:translate-x-0.5
                  group-hover:text-[#FC4C02]
                "
              />
            </a>
          )}
        </section>

        {/* Settings */}
        <section className="mt-6">
          <p
            className="
              mb-2 px-1
              text-[11px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            Settings
          </p>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border border-border/70
              bg-card
            "
          >
            {settingsItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="
                    group flex items-center
                    gap-4 p-4
                    transition-colors
                    hover:bg-muted/50
                  "
                >
                  <div
                    className="
                      flex size-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-muted
                      text-muted-foreground
                      transition-colors
                      group-hover:bg-[#FFF1EB]
                      group-hover:text-[#FC4C02]
                    "
                  >
                    <Icon className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {item.label}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight
                    className="
                      size-4 shrink-0
                      text-muted-foreground
                      transition-all duration-200
                      group-hover:translate-x-0.5
                      group-hover:text-[#FC4C02]
                    "
                  />
                </a>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}