"use client";

import { useEffect, useRef } from "react";

interface RunMapPreviewProps {
  polyline?: string | null;
  className?: string;
}

function decodePolyline(
  encoded: string,
): [number, number][] {
  const coordinates: [number, number][] = [];

  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte =
        encoded.charCodeAt(index++) - 63;

      result |=
        (byte & 0x1f) << shift;

      shift += 5;
    } while (byte >= 0x20);

    const latitudeChange =
      result & 1
        ? ~(result >> 1)
        : result >> 1;

    latitude += latitudeChange;

    shift = 0;
    result = 0;

    do {
      byte =
        encoded.charCodeAt(index++) - 63;

      result |=
        (byte & 0x1f) << shift;

      shift += 5;
    } while (byte >= 0x20);

    const longitudeChange =
      result & 1
        ? ~(result >> 1)
        : result >> 1;

    longitude += longitudeChange;

    coordinates.push([
      latitude / 100000,
      longitude / 100000,
    ]);
  }

  return coordinates;
}

export function RunMapPreview({
  polyline,
  className = "",
}: RunMapPreviewProps) {
  const mapElementRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<import("leaflet").Map | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (
        !mapElementRef.current ||
        !polyline
      ) {
        return;
      }

      const coordinates =
        decodePolyline(polyline);

      if (coordinates.length < 2) {
        return;
      }

      const L = await import("leaflet");

      if (cancelled) {
        return;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(
        mapElementRef.current,
        {
          zoomControl: false,
          attributionControl: true,

          // Prevent the user from accidentally
          // moving the preview map.
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          boxZoom: false,
          keyboard: false,
        },
      );

      mapRef.current = map;

      /*
       * OpenStreetMap street tiles.
       */
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      ).addTo(map);

      const latLngs =
        coordinates.map(
          ([latitude, longitude]) =>
            L.latLng(
              latitude,
              longitude,
            ),
        );

      const bounds =
        L.latLngBounds(latLngs);

      /*
       * White outline.
       *
       * This gives the route a Strava-like
       * appearance and keeps the orange
       * line readable over the map.
       */
      L.polyline(latLngs, {
        color: "#ffffff",
        weight: 7,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      /*
       * Orange route.
       */
      L.polyline(latLngs, {
        color: "#FC4C02",
        weight: 4,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      /*
       * Fit the ACTUAL GPS route into the
       * available map area.
       *
       * This prevents the route from being
       * stretched.
       */
      map.fitBounds(bounds, {
        paddingTopLeft: [35, 35],
        paddingBottomRight: [35, 35],
        maxZoom: 16,
        animate: false,
      });

      /*
       * Make sure Leaflet calculates the
       * correct dimensions after the
       * container has been rendered.
       */
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    }

    initializeMap();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [polyline]);

  if (!polyline) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground ${className}`}
      >
        No route available
      </div>
    );
  }

  return (
    <div
      ref={mapElementRef}
      className={`h-full w-full overflow-hidden ${className}`}
    />
  );
}