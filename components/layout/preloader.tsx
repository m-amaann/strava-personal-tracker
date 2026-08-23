"use client";

import { useEffect, useState } from "react";

interface PreloaderProps {
  show?: boolean;
}

export function Preloader({
  show = true,
}: PreloaderProps) {
  const [progress, setProgress] =
    useState(0);

  const [exiting, setExiting] =
    useState(false);

  useEffect(() => {
    if (!show) {
      return;
    }

    let frame: number;

    const start =
      performance.now();

    const animate = (
      now: number,
    ) => {
      const elapsed =
        now - start;

      const nextProgress =
        Math.min(
          90,
          Math.round(
            90 *
              (1 -
                Math.exp(
                  -elapsed / 650,
                )),
          ),
        );

      setProgress(
        nextProgress,
      );

      if (
        nextProgress < 90
      ) {
        frame =
          requestAnimationFrame(
            animate,
          );
      }
    };

    frame =
      requestAnimationFrame(
        animate,
      );

    return () => {
      cancelAnimationFrame(
        frame,
      );
    };
  }, [show]);

  useEffect(() => {
    if (show) {
      return;
    }

    const progressTimer =
      window.setTimeout(() => {
        setProgress(100);
      }, 0);

    const exitTimer =
      window.setTimeout(() => {
        setExiting(true);
      }, 150);

    return () => {
      window.clearTimeout(
        progressTimer,
      );
      window.clearTimeout(
        exitTimer,
      );
    };
  }, [show]);

  if (!show && !exiting) {
    return null;
  }

  return (
    <div
      className={`
        fixed
        inset-0
        z-9999
        flex
        items-center
        justify-center
        overflow-hidden
        bg-[#18181b]
        transition-all
        duration-500
        ${
          exiting
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        }
      `}
    >
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Blue glow */}

        <div className="preloader-glow preloader-glow-one" />

        {/* Orange glow */}

        <div className="preloader-glow preloader-glow-two" />

        {/* Particles */}

        <div className="preloader-particles" />

        {/* Radial light */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            size-105
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[#FC4C02]/5
            blur-[100px]
          "
        />
      </div>

      {/* Runner */}

      <div
        className={`
          relative
          z-10
          flex
          flex-col
          items-center
          transition-all
          duration-500
          ${
            exiting
              ? "scale-110 opacity-0"
              : "scale-100 opacity-100"
          }
        `}
      >
        <div className="relative flex size-28 items-center justify-center">
          {/* Outer ring */}

          <div
            className="
              absolute
              inset-0
              rounded-full
              border
              border-white/10
            "
          />

          {/* Orange rotating ring */}

          <div
            className="
              absolute
              -inset-1.75
              rounded-full
              border
              border-transparent
              border-t-[#FC4C02]
              border-r-[#FC4C02]/30
              preloader-ring
            "
          />

          {/* Reverse ring */}

          <div
            className="
              absolute
              -inset-4
              rounded-full
              border
              border-white/5
              border-b-white/20
              preloader-ring-reverse
            "
          />

          {/* Glow */}

          <div
            className="
              absolute
              size-20
              rounded-full
              bg-[#FC4C02]/20
              blur-2xl
              preloader-pulse
            "
          />

          {/* Runner */}

          <div
            className="
              relative
              flex
              size-19
              items-center
              justify-center
              rounded-full
              bg-[#FC4C02]
              shadow-[0_0_60px_rgba(252,76,2,0.4)]
              preloader-runner
            "
          >
            <svg
              viewBox="0 0 48 48"
              className="size-10 text-white"
              fill="none"
              aria-hidden="true"
            >
              {/* Head */}

              <circle
                cx="30"
                cy="7"
                r="4"
                fill="currentColor"
              />

              {/* Body */}

              <path
                d="M27 13L22 23L29 27"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Left arm */}

              <path
                d="M24 16L16 19"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Right arm */}

              <path
                d="M25 17L34 20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Left leg */}

              <path
                d="M29 27L20 38"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Right leg */}

              <path
                d="M29 27L38 36"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Orbiting dot */}

          <span className="absolute -inset-2.5 preloader-orbit">
            <span
              className="
                absolute
                left-1/2
                top-0
                size-2
                -translate-x-1/2
                rounded-full
                bg-[#FC4C02]
                shadow-[0_0_12px_rgba(252,76,2,0.9)]
              "
            />
          </span>
        </div>

        {/* Progress */}

        <div className="mt-12 w-56">
          <div
            className="
              relative
              h-0.75
              overflow-hidden
              rounded-full
              bg-white/10
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-[#FC4C02]
                transition-[width]
                duration-300
                ease-out
              "
              style={{
                width: `${progress}%`,
              }}
            />

            {/* Moving shine */}

            <div
              className="
                preloader-shine
                absolute
                inset-y-0
                w-20
                bg-linear-to-r
                from-transparent
                via-white/70
                to-transparent
              "
            />
          </div>
        </div>

        {/* Animated dots */}

        <div className="mt-5 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-white/30 preloader-dot-1" />

          <span className="size-1.5 rounded-full bg-white/30 preloader-dot-2" />

          <span className="size-1.5 rounded-full bg-white/30 preloader-dot-3" />
        </div>
      </div>
    </div>
  );
}