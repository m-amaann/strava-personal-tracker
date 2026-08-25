"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NAVIGATION,
  ROUTES,
} from "@/lib/navigation";

function isActive(
  pathname: string,
  href: string,
) {
  if (!href) {
    return false;
  }

  if (href === ROUTES.home) {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();

  const performanceItems =
    NAVIGATION.filter(
      (item) =>
        item.label === "Overview" ||
        item.label === "Runs" ||
        item.label === "Progress" ||
        item.label === "Records" ||
        item.label === "Calendar",
    );

  const activityItems =
    NAVIGATION.filter(
      (item) =>
        item.label === "Cycling" ||
        item.label === "Swimming" ||
        item.label === "Walking",
    );

  const settingsItem =
    NAVIGATION.find(
      (item) =>
        item.label === "Settings",
    );

  return (
    <aside
      className="
        fixed
        inset-y-0
        left-0
        z-40
        hidden
        w-64
        border-r
        bg-background
        lg:flex
        lg:flex-col
      "
    >
      {/* ====================================================== */}
      {/* Brand */}
      {/* ====================================================== */}

      <div
        className="
          flex
          h-16
          shrink-0
          items-center
          border-b
          px-6
        "
      >
        <Link
          href={ROUTES.home}
          className="
            flex
            items-center
            gap-2.5
          "
          aria-label="EndrivoIQ"
        >
          <Image
            src="/images/strava-logo.png"
            alt="Strava"
            width={30}
            height={30}
            priority
            className="size-7 object-contain"
          />

          <span
            className="
              text-[15px]
              font-bold
              tracking-[-0.02em]
              text-foreground
            "
          >
            EndrivoIQ
          </span>
        </Link>
      </div>

      {/* ====================================================== */}
      {/* Navigation */}
      {/* ====================================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-3
          py-6
        "
      >
        {/* ==================================================== */}
        {/* Performance */}
        {/* ==================================================== */}

        <div className="space-y-1">
          <p
            className="
              px-3
              pb-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-muted-foreground
            "
          >
            Performance
          </p>

          {performanceItems.map(
            (item) => {
              const Icon = item.icon;

              const active =
                isActive(
                  pathname,
                  item.href,
                );

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-[13px]
                    font-medium
                    transition-all
                    duration-200
                    ${
                      active
                        ? "bg-[#FC4C02]/10 text-[#FC4C02]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  {active && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-6
                        w-0.5
                        -translate-y-1/2
                        rounded-full
                        bg-[#FC4C02]
                      "
                    />
                  )}

                  <Icon
                    className="
                      size-4
                      transition-colors
                      duration-200
                    "
                    strokeWidth={
                      active ? 2.1 : 1.8
                    }
                  />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            },
          )}
        </div>

        {/* ==================================================== */}
        {/* Activities */}
        {/* ==================================================== */}

        <div className="mt-8 space-y-1">
          <p
            className="
              px-3
              pb-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-muted-foreground
            "
          >
            Activities
          </p>

          {activityItems.map(
            (item) => {
              const Icon = item.icon;

              const available =
                item.enabled &&
                Boolean(item.href);

              if (available) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-[13px]
                      font-medium
                      text-muted-foreground
                      transition-colors
                      duration-200
                      hover:bg-muted
                      hover:text-foreground
                    "
                  >
                    <Icon
                      className="
                        size-4
                        transition-colors
                      "
                      strokeWidth={1.8}
                    />

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className="
                    flex
                    cursor-not-allowed
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-[13px]
                    font-medium
                    text-muted-foreground/45
                  "
                  aria-disabled="true"
                >
                  <Icon
                    className="size-4"
                    strokeWidth={1.7}
                  />

                  <span>
                    {item.label}
                  </span>

                  <span
                    className="
                      ml-auto
                      rounded-full
                      bg-muted
                      px-1.5
                      py-0.5
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-muted-foreground
                    "
                  >
                    Soon
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* Settings */}
      {/* ====================================================== */}

      {settingsItem && (
        <div
          className="
            shrink-0
            border-t
            p-3
          "
        >
          {(() => {
            const Icon =
              settingsItem.icon;

            const active =
              isActive(
                pathname,
                settingsItem.href,
              );

            return (
              <Link
                href={settingsItem.href}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={`
                  group
                  relative
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-[13px]
                  font-medium
                  transition-all
                  duration-200
                  ${
                    active
                      ? "bg-[#FC4C02]/10 text-[#FC4C02]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                {active && (
                  <span
                    className="
                      absolute
                      left-0
                      top-1/2
                      h-6
                      w-0.5
                      -translate-y-1/2
                      rounded-full
                      bg-[#FC4C02]
                    "
                  />
                )}

                <Icon
                  className="
                    size-4
                    transition-colors
                    duration-200
                  "
                  strokeWidth={
                    active ? 2.1 : 1.8
                  }
                />

                <span>
                  {settingsItem.label}
                </span>
              </Link>
            );
          })()}
        </div>
      )}
    </aside>
  );
}