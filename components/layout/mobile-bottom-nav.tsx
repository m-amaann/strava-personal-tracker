"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import {
  BarChart3,
  CalendarDays,
  SportShoe,
  Home,
  Trophy,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/",
    icon: Home,
  },
  {
    label: "Runs",
    href: "/runs",
    icon: SportShoe,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Records",
    href: "/records",
    icon: Trophy,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed
        inset-x-0
        bottom-0
        z-50
        border-t
        border-border/70
        bg-background/95
        pb-[env(safe-area-inset-bottom)]
        shadow-[0_-6px_24px_rgba(0,0,0,0.06)]
        backdrop-blur-xl
        lg:hidden
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          max-w-md
          items-center
          justify-around
          px-1
        "
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`,
                );

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                group
                relative
                flex
                h-full
                min-w-16
                flex-1
                flex-col
                items-center
                justify-center
                gap-1
              "
            >
              <motion.div
                className="
                  relative
                  flex
                  size-7
                  items-center
                  justify-center
                "
                initial={false}
                animate={{
                  y: active ? -1 : 0,
                  scale: active ? 1.06 : 1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 24,
                  mass: 0.7,
                }}
              >
                <motion.div
                  className="
                    absolute
                    inset-0
                    rounded-full
                    bg-[#FC4C02]
                  "
                  initial={false}
                  animate={{
                    opacity: active ? 0.1 : 0,
                    scale: active ? 1.25 : 0.7,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                />

                <Icon
                  className={`
                    relative
                    z-10
                    size-5
                    transition-colors
                    duration-200
                    ${
                      active
                        ? "text-[#FC4C02]"
                        : "text-muted-foreground"
                    }
                  `}
                  strokeWidth={
                    active ? 2.2 : 1.7
                  }
                />
              </motion.div>

              <motion.span
                initial={false}
                animate={{
                  opacity: active ? 1 : 0.7,
                  y: active ? 0 : 1,
                }}
                transition={{
                  duration: 0.2,
                }}
                className={`
                  text-[10px]
                  font-medium
                  ${
                    active
                      ? "text-[#FC4C02]"
                      : "text-muted-foreground"
                  }
                `}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}