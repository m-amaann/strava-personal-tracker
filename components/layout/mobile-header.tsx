"use client";

import Image from "next/image";
import Link from "next/link";

import { Settings } from "lucide-react";

import { ROUTES } from "@/lib/navigation";

export function MobileHeader() {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        flex
        h-14
        items-center
        justify-center
        border-b
        bg-background/95
        px-4
        backdrop-blur-xl
        lg:hidden
      "
    >
      {/* Settings */}

      <Link
        href={ROUTES.settings}
        aria-label="Settings"
        className="
          absolute
          right-3
          flex
          size-10
          items-center
          justify-center
          rounded-xl
          text-muted-foreground
          transition-colors
          hover:bg-muted
          hover:text-foreground
          active:scale-95
        "
      >
        <Settings
          className="size-5"
          strokeWidth={1.7}
        />
      </Link>

      {/* Brand */}

      <Link
        href={ROUTES.home}
        className="
          flex
          items-center
          gap-2
        "
        aria-label="EndrivoIQ"
      >
        <Image
          src="/images/strava-logo.png"
          alt="EndrivoIQ"
          width={24}
          height={24}
          priority
          className="
            size-6
            object-contain
          "
        />

        <span
          className="
            text-sm
            font-bold
            tracking-tight
            text-foreground
          "
        >
          EndrivoIQ
        </span>
      </Link>
    </header>
  );
}