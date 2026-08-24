"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import { Preloader } from "@/components/layout/preloader";

export function NavigationPreloader() {
  const pathname = usePathname();

  /*
   * Show loader when the application starts.
   */
  const [loading, setLoading] = useState(true);

  /*
   * Prevent the pathname effect from treating
   * the initial mount as a navigation.
   */
  const [initialLoad, setInitialLoad] = useState(true);

  /*
   * Initial application load.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
   * Detect internal navigation.
   */
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      /*
       * Only normal left-clicks.
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

      const link = target?.closest("a");

      if (!link) {
        return;
      }

      const href =
        link.getAttribute("href");

      if (!href) {
        return;
      }

      /*
       * Ignore external links,
       * hash links, downloads,
       * new tabs and javascript links.
       */
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      /*
       * Do not show the page loader for
       * API / OAuth requests.
       */
      if (href.startsWith("/api/")) {
        return;
      }

      const currentUrl =
        new URL(
          window.location.href,
        );

      const targetUrl =
        new URL(
          href,
          window.location.origin,
        );

      /*
       * Ignore current page.
       */
      if (
        targetUrl.pathname ===
          currentUrl.pathname &&
        targetUrl.search ===
          currentUrl.search &&
        targetUrl.hash ===
          currentUrl.hash
      ) {
        return;
      }

      /*
       * Start loader immediately.
       */
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
   * When pathname changes, the new route has
   * arrived. Allow the preloader to exit.
   */
  useEffect(() => {
    if (initialLoad) {
      return;
    }

    if (!loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    pathname,
    loading,
    initialLoad,
  ]);

  return (
    <Preloader show={loading} />
  );
}