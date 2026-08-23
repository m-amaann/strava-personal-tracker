"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  BarChart3,
  Footprints,
  Home,
  MoreHorizontal,
  Trophy,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Runs",
    href: "/runs",
    icon: Footprints,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    label: "Records",
    href: "/records",
    icon: Trophy,
  },
  {
    label: "More",
    href: "/more",
    icon: MoreHorizontal,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex h-full min-w-16 flex-1 flex-col items-center justify-center gap-1"
            >
              {/* Animated icon container */}
              <motion.div
                className="relative flex size-7 items-center justify-center"
                initial={false}
                animate={{
                  y: active ? -2 : 0,
                  scale: active ? 1.08 : 1,
                }}
                whileHover={{
                  y: -2,
                  scale: 1.08,
                }}
                whileTap={{
                  scale: 0.88,
                }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 24,
                  mass: 0.7,
                }}
              >
                {/* Soft active glow */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#FC4C02]"
                  initial={false}
                  animate={{
                    opacity: active ? 0.10 : 0,
                    scale: active ? 1.25 : 0.7,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                />

                {/* Icon */}
                <Icon
                  className={`relative z-10 size-5 transition-colors duration-200 ${
                    active
                      ? "text-[#FC4C02]"
                      : "text-muted-foreground group-hover:text-[#FC4C02]"
                  }`}
                  strokeWidth={active ? 2.3 : 1.8}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                initial={false}
                animate={{
                  opacity: active ? 1 : 0.75,
                  y: active ? 0 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                className="text-[10px] font-medium text-muted-foreground"
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