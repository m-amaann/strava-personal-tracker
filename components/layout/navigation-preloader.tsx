"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  Preloader,
} from "@/components/layout/preloader";

export function NavigationPreloader() {
  const pathname =
    usePathname();

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const handleClick = (
      event: MouseEvent,
    ) => {
      /*
       * Only handle normal left-clicks.
       */

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target as HTMLElement | null;

      const link =
        target?.closest(
          "a",
        );

      if (!link) {
        return;
      }

      const href =
        link.getAttribute(
          "href",
        );

      if (!href) {
        return;
      }

      /*
       * Ignore:
       *
       * - external links
       * - hash links
       * - downloads
       * - new tabs
       */

      if (
        href.startsWith(
          "http://",
        ) ||
        href.startsWith(
          "https://",
        ) ||
        href.startsWith(
          "#",
        ) ||
        link.target === "_blank" ||
        link.hasAttribute(
          "download",
        )
      ) {
        return;
      }

      /*
       * Ignore clicking the
       * current page.
       */

      const currentPath =
        window.location.pathname;

      const targetUrl =
        new URL(
          href,
          window.location.origin,
        );

      if (
        targetUrl.pathname ===
          currentPath &&
        targetUrl.search ===
          window.location.search
      ) {
        return;
      }

      setLoading(true);
    };

    document.addEventListener(
      "click",
      handleClick,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
      );
    };
  }, []);

  /*
   * When Next.js finishes the
   * navigation, pathname changes.
   */

  useEffect(() => {
    if (!loading) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setLoading(false);
      }, 100);

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [pathname, loading]);

  return (
    <Preloader
      show={loading}
    />
  );
}