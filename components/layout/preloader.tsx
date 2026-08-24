"use client";

import Lottie from "lottie-react";

interface PreloaderProps {
  show?: boolean;
}

export function Preloader({
  show = true,
}: PreloaderProps) {
  return (
    <div
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
        duration-300
        ease-out
        ${
          show
            ? "opacity-100"
            : "opacity-0"
        }
      `}
    >
      <div
        className="
          flex
          size-32
          items-center
          justify-center
          sm:size-36
        "
      >
        <Lottie
          animationData={loadingAnimation}
          loop
          autoplay
          className="size-full"
        />
      </div>
    </div>
  );
}