"use client";

import { useEffect, useRef } from "react";

interface RunMapProps {
  polyline?: string | null;
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
    let byte = 0;

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

export function RunMap({
  polyline,
}: RunMapProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<import("leaflet").Map | null>(
      null,
    );

  useEffect(() => {
    if (
      !mapContainerRef.current ||
      !polyline
    ) {
      return;
    }

    let cancelled = false;

    async function initializeMap() {
      const L =
        await import("leaflet");

      if (
        cancelled ||
        !mapContainerRef.current ||
        !polyline
      ) {
        return;
      }

      /*
       * Remove existing map before
       * creating a new one.
       */
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      /*
       * At this point TypeScript knows
       * polyline is a string.
       */
      const coordinates =
        decodePolyline(polyline);

      if (coordinates.length < 2) {
        return;
      }

      /*
       * Create Leaflet map.
       */
      const map = L.map(
        mapContainerRef.current,
        {
          zoomControl: false,
          attributionControl: true,

          // Static map like the Strava
          // activity preview.
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
       * OpenStreetMap tiles.
       */
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            "&copy; OpenStreetMap contributors",
        },
      ).addTo(map);

      /*
       * Convert decoded coordinates
       * into Leaflet LatLng objects.
       */
      const points =
        coordinates.map(
          ([lat, lng]) =>
            L.latLng(lat, lng),
        );

      /*
       * Calculate route bounds.
       */
      const bounds =
        L.latLngBounds(points);

      /*
       * White outline behind route.
       */
      L.polyline(points, {
        color: "#ffffff",
        weight: 7,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      /*
       * Strava orange route.
       */
      L.polyline(points, {
        color: "#FC4C02",
        weight: 4,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      /*
       * Fit the complete route inside
       * the map.
       */
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 16,
        animate: false,
      });

      /*
       * Leaflet sometimes needs an
       * additional size calculation
       * after rendering.
       */
      setTimeout(() => {
        if (
          !cancelled &&
          mapRef.current
        ) {
          mapRef.current.invalidateSize();

          mapRef.current.fitBounds(
            bounds,
            {
              padding: [30, 30],
              maxZoom: 16,
              animate: false,
            },
          );
        }
      }, 100);
    }

    initializeMap();

    /*
     * Cleanup when component unmounts
     * or polyline changes.
     */
    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [polyline]);

  /*
   * No GPS route available.
   */
  if (!polyline) {
    return (
      <div className="flex h-75 w-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        No route available
      </div>
    );
  }

  return (
    <div className="relative h-75 w-full overflow-hidden rounded-2xl">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none absolute left-3 top-3 z-999 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm">
        Strava route
      </div>
    </div>
  );
}