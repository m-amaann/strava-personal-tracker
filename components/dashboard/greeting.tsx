"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}

export function Greeting() {
  const [greeting, setGreeting] =
    useState("Good morning");

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(
        getGreeting(new Date().getHours()),
      );
    };

    updateGreeting();

    const timer = window.setInterval(
      updateGreeting,
      60_000,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <span>
      {greeting}, Amaan
    </span>
  );
}