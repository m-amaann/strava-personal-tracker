"use client";

import {
  Database,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Vo2MaxSettings } from "@/components/settings/vo2-max-settings";

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
  {
    title: "About",
    description:
      "Performance analytics designed to help you understand your training and progress.",
    icon: FileText,
  },
];

export function SettingsContent() {
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
      {/* Performance */}
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

      {/* Data & Privacy */}
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
          {settingsSections
            .slice(0, 3)
            .map((item, index) => {
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
            })}
        </div>
      </section>

      {/* About */}
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
                fitness metrics, performance trends,
                and long-term progress in one place.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}