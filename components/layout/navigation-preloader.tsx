"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { Preloader } from "@/components/layout/preloader";
import { useAppReady } from "@/components/layout/app-ready-provider";

const MINIMUM_DISPLAY_TIME = 450;
const SAFETY_TIMEOUT = 4000;

export function NavigationPreloader() {
  const pathname = usePathname();

  const {
    ready,
    setReady,
  } = useAppReady();

  const [loading, setLoading] =
    useState(true);

  const initialLoadRef =
    useRef(true);

  const navigationRef =
    useRef(false);

  /*
   * Do NOT initialize this with Date.now()
   * or performance.now() during render.
   */
  const loadingStartedAtRef =
    useRef<number | null>(null);

  const hideTimerRef =
    useRef<number | null>(null);

  /*
   * ============================================================
   * Start loading
   * ============================================================
   */

  const startLoading = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(
        hideTimerRef.current,
      );

      hideTimerRef.current = null;
    }

    /*
     * performance.now() is called here,
     * inside an event callback.
     *
     * This is allowed by React's purity rules.
     */
    loadingStartedAtRef.current =
      performance.now();

    setLoading(true);
  }, []);

  /*
   * ============================================================
   * Stop loading
   * ============================================================
   */

  const stopLoading = useCallback(() => {
    const startedAt =
      loadingStartedAtRef.current;

    /*
     * If there is no recorded start time,
     * simply hide the loader.
     */
    if (startedAt === null) {
      setLoading(false);
      return;
    }

    const elapsed =
      performance.now() - startedAt;

    const remaining =
      Math.max(
        0,
        MINIMUM_DISPLAY_TIME - elapsed,
      );

    if (hideTimerRef.current !== null) {
      window.clearTimeout(
        hideTimerRef.current,
      );
    }

    hideTimerRef.current =
      window.setTimeout(() => {
        setLoading(false);

        hideTimerRef.current = null;

        loadingStartedAtRef.current =
          null;
      }, remaining);
  }, []);

  /*
   * ============================================================
   * Initial application load
   * ============================================================
   *
   * The preloader remains visible until:
   *
   * 1. The application reports ready
   *
   * OR
   *
   * 2. The 10-second safety timeout is reached.
   */

  useEffect(() => {
    /*
     * Start timing after the component
     * has mounted, not during render.
     */
    loadingStartedAtRef.current =
      performance.now();

    const safetyTimer =
      window.setTimeout(() => {
        if (!initialLoadRef.current) {
          return;
        }

        initialLoadRef.current =
          false;

        setReady();

        stopLoading();
      }, SAFETY_TIMEOUT);

    return () => {
      window.clearTimeout(
        safetyTimer,
      );
    };
  }, [setReady, stopLoading]);

  /*
   * ============================================================
   * Application became ready
   * ============================================================
   */

  useEffect(() => {
    if (!initialLoadRef.current) {
      return;
    }

    if (!ready) {
      return;
    }

    initialLoadRef.current =
      false;

    stopLoading();
  }, [ready, stopLoading]);

  /*
   * ============================================================
   * Detect internal navigation
   * ============================================================
   *
   * Capture phase is important.
   *
   * It lets us start the loader before
   * Next.js processes the Link click.
   */

  useEffect(() => {
    const handleClick = (
      event: MouseEvent,
    ) => {
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
        target?.closest("a");

      if (!link) {
        return;
      }

      const href =
        link.getAttribute("href");

      if (!href) {
        return;
      }

      /*
       * External links
       */

      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//")
      ) {
        return;
      }

      /*
       * Hash links
       */

      if (href.startsWith("#")) {
        return;
      }

      /*
       * JavaScript links
       */

      if (
        href.startsWith(
          "javascript:",
        )
      ) {
        return;
      }

      /*
       * New tab
       */

      if (link.target === "_blank") {
        return;
      }

      /*
       * Downloads
       */

      if (
        link.hasAttribute("download")
      ) {
        return;
      }

      /*
       * API requests
       */

      if (
        href.startsWith("/api/")
      ) {
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
       * Prevent duplicate navigation
       * loading states.
       */

      if (navigationRef.current) {
        return;
      }

      navigationRef.current =
        true;

      /*
       * Start immediately.
       */

      startLoading();
    };

    /*
     * Capture phase.
     */
    document.addEventListener(
      "click",
      handleClick,
      true,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true,
      );
    };
  }, [startLoading]);

  /*
   * ============================================================
   * Route changed
   * ============================================================
   */

  useEffect(() => {
    /*
     * Don't treat the initial pathname
     * as a navigation.
     */

    if (initialLoadRef.current) {
      return;
    }

    if (!navigationRef.current) {
      return;
    }

    navigationRef.current =
      false;

    /*
     * Keep loader visible for the minimum
     * display duration.
     */

    stopLoading();
  }, [pathname, stopLoading]);

  /*
   * ============================================================
   * Cleanup
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (
        hideTimerRef.current !== null
      ) {
        window.clearTimeout(
          hideTimerRef.current,
        );
      }
    };
  }, []);

  return (
    <Preloader
      show={loading}
    />
  );
}