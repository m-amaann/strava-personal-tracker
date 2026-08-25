"use client";

import { useEffect, useRef } from "react";

interface PreloaderProps {
  show?: boolean;
}

export function Preloader({
  show = true,
}: PreloaderProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const animationRef =
    useRef<{
      destroy: () => void;
      setSpeed: (speed: number) => void;
    } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeAnimation() {
      if (!containerRef.current) {
        return;
      }

      const lottie =
        await import("lottie-web");

      if (
        !mounted ||
        !containerRef.current
      ) {
        return;
      }

      const animation =
        lottie.default.loadAnimation({
          container:
            containerRef.current,

          renderer: "svg",

          loop: true,

          autoplay: true,

          path: "/Loading.json",

          rendererSettings: {
            preserveAspectRatio:
              "xMidYMid meet",
          },
        });

      /*
       * Original animation:
       * 30 FPS / 41 frames ≈ 1.37 seconds
       *
       * 0.45x makes it approximately
       * 3 seconds per cycle.
       *
       * This gives the dots a much more
       * relaxed and premium movement.
       */
      animation.setSpeed(0.45);

      animationRef.current =
        animation;
    }

    initializeAnimation();

    return () => {
      mounted = false;

      animationRef.current?.destroy();

      animationRef.current = null;
    };
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-hidden={!show}
      className={`
        pointer-events-none
        fixed
        inset-0
        z-9999
        flex
        items-center
        justify-center
        bg-background/40
        backdrop-blur-[1px]
        transition-opacity
        duration-500
        ease-out
        ${
          show
            ? "opacity-100"
            : "opacity-0"
        }
      `}
    >
      <div
        ref={containerRef}
        className="
          size-32
          sm:size-36
          md:size-40
        "
      />
    </div>
  );
}