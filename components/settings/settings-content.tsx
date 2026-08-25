"use client";

import {
  Database,
  Footprints,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Watch,
} from "lucide-react";

import { Vo2MaxSettings } from "@/components/settings/vo2-max-settings";

type GearItem = {
  name: string;
  status?: string;
};

interface SettingsContentProps {
  watch: GearItem | null;
  shoes: GearItem[];
}

const settingsSections = [
  {
    title: "Data & Privacy",
    description:
      "Your performance preferences are stored locally on this device.",
    icon: ShieldCheck,
  },
  {
    title: "Data Storage",
    description:
      "Your personal settings remain in your browser and are not stored in the Strava account.",
    icon: Database,
  },
  {
    title: "Privacy",
    description:
      "Only the information required for your performance dashboard is used.",
    icon: LockKeyhole,
  },
];

export function SettingsContent({
  watch,
  shoes,
}: SettingsContentProps) {
  return (
    <div
      className="
        w-full
        min-w-0
        space-y-5
        sm:space-y-6
        md:space-y-8
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* Performance */}
      {/* ------------------------------------------------------------------ */}

      <section>
        <div className="mb-2 px-1 sm:mb-3">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
              sm:text-[11px]
            "
          >
            Performance
          </p>
        </div>

        <Vo2MaxSettings />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Gear - MOBILE ONLY */}
      {/* ------------------------------------------------------------------ */}

      {(watch || shoes.length > 0) && (
        <section className="lg:hidden">
          <div className="mb-2 px-1">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-muted-foreground
              "
            >
              Gear
            </p>

            <p
              className="
                mt-0.5
                text-[10px]
                text-muted-foreground
              "
            >
              Your connected training equipment.
            </p>
          </div>

          <div className="space-y-1">
            {/* Watch */}

            {watch && (
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
                  px-1
                  py-1.5
                "
              >
                <div
                  className="
                    flex
                    size-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-muted/70
                    text-muted-foreground
                  "
                >
                  <Watch className="size-3.5" />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-[11px]
                      font-medium
                    "
                  >
                    {watch.name}
                  </p>

                  {watch.status && (
                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-muted-foreground
                      "
                    >
                      {watch.status}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Shoes */}

            {shoes.map((shoe, index) => (
              <div
                key={`${shoe.name}-${index}`}
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
                  px-1
                  py-1.5
                "
              >
                <div
                  className="
                    flex
                    size-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-muted/70
                    text-muted-foreground
                  "
                >
                  <Footprints className="size-3.5" />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-[11px]
                      font-medium
                    "
                  >
                    {shoe.name}
                  </p>

                  {shoe.status && (
                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-muted-foreground
                      "
                    >
                      {shoe.status}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Data & Privacy */}
      {/* ------------------------------------------------------------------ */}

      <section>
        <div className="mb-2 px-1 sm:mb-3">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
              sm:text-[11px]
            "
          >
            Data & Privacy
          </p>
        </div>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-border/70
            bg-card
          "
        >
          {settingsSections.map(
            (item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`
                    flex
                    min-w-0
                    items-start
                    gap-3
                    p-4
                    sm:gap-4
                    sm:p-5
                    md:p-6
                    ${
                      index > 0
                        ? "border-t border-border/70"
                        : ""
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-muted
                      text-muted-foreground
                      sm:size-10
                    "
                  >
                    <Icon className="size-4 sm:size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        text-xs
                        font-semibold
                        sm:text-sm
                      "
                    >
                      {item.title}
                    </p>

                    <p
                      className="
                        mt-1
                        max-w-3xl
                        text-[10px]
                        leading-5
                        text-muted-foreground
                        sm:text-xs
                      "
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* About */}
      {/* ------------------------------------------------------------------ */}

      <section>
        <div className="mb-2 px-1 sm:mb-3">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
              sm:text-[11px]
            "
          >
            About
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-border/70
            bg-card
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
              p-4
              sm:gap-4
              sm:p-5
              md:p-6
            "
          >
            <div
              className="
                flex
                size-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-muted
                text-muted-foreground
                sm:size-10
              "
            >
              <UserRound className="size-4 sm:size-5" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-xs
                  font-semibold
                  sm:text-sm
                "
              >
                Performance Analytics
              </p>

              <p
                className="
                  mt-1
                  max-w-3xl
                  text-[10px]
                  leading-5
                  text-muted-foreground
                  sm:text-xs
                "
              >
                Analyze training activities,
                fitness metrics, performance
                trends, and long-term progress
                in one place.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}