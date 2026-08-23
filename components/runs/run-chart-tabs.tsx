// "use client";

// import { useState } from "react";

// import { RunPaceChart } from "@/components/runs/run-pace-chart";
// import { RunHeartRateChart } from "@/components/runs/run-heart-rate-chart";

// import type { StravaActivityStreams } from "@/lib/strava/types";

// type ChartType =
//   | "pace"
//   | "heart-rate"
//   | "elevation"
//   | "cadence";

// interface RunChartTabsProps {
//   streams: StravaActivityStreams | null;
// }

// const chartTabs: {
//   id: ChartType;
//   label: string;
// }[] = [
//   {
//     id: "pace",
//     label: "Pace",
//   },
//   {
//     id: "heart-rate",
//     label: "Heart Rate",
//   },
//   {
//     id: "elevation",
//     label: "Elevation",
//   },
//   {
//     id: "cadence",
//     label: "Cadence",
//   },
// ];

// export function RunChartTabs({
//   streams,
// }: RunChartTabsProps) {
//   const [activeChart, setActiveChart] =
//     useState<ChartType>("pace");

//   return (
//     <section>
//       <div className="mb-3">
//         <h2 className="text-lg font-bold tracking-tight">
//           Charts
//         </h2>
//       </div>

//       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
//         {chartTabs.map((tab) => {
//           const active =
//             activeChart === tab.id;

//           return (
//             <button
//               key={tab.id}
//               type="button"
//               onClick={() =>
//                 setActiveChart(tab.id)
//               }
//               className={`
//                 shrink-0 rounded-full px-4 py-2
//                 text-xs font-semibold
//                 transition-all duration-200
//                 ${
//                   active
//                     ? "bg-[#FC4C02] text-white shadow-sm"
//                     : "border border-border bg-card text-muted-foreground hover:border-[#FC4C02]/30 hover:text-[#FC4C02]"
//                 }
//               `}
//             >
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>

//       <div className="mt-3">
//         {activeChart === "pace" && (
//           <RunPaceChart
//             streams={streams}
//           />
//         )}

//         {activeChart ===
//           "heart-rate" && (
//           <RunHeartRateChart
//             streams={streams}
//           />
//         )}

//         {activeChart ===
//           "elevation" && (
//           <PlaceholderChart
//             title="Elevation"
//             description="Elevation throughout the run"
//           />
//         )}

//         {activeChart ===
//           "cadence" && (
//           <PlaceholderChart
//             title="Cadence"
//             description="Cadence throughout the run"
//           />
//         )}
//       </div>
//     </section>
//   );
// }

// interface PlaceholderChartProps {
//   title: string;
//   description: string;
// }

// function PlaceholderChart({
//   title,
//   description,
// }: PlaceholderChartProps) {
//   return (
//     <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
//       <h3 className="text-base font-semibold">
//         {title}
//       </h3>

//       <p className="mt-1 text-xs text-muted-foreground">
//         {description}
//       </p>

//       <div className="mt-5 flex h-56 items-center justify-center rounded-lg bg-muted/40">
//         <p className="text-xs text-muted-foreground">
//           Stream data unavailable.
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";

import { RunPaceChart } from "@/components/runs/run-pace-chart";
import { RunHeartRateChart } from "@/components/runs/run-heart-rate-chart";
import { RunElevationChart } from "@/components/runs/run-elevation-chart";
import { RunCadenceChart } from "@/components/runs/run-cadence-chart";

import type { StravaActivityStreams } from "@/lib/strava/types";

type ChartType =
  | "pace"
  | "heart-rate"
  | "elevation"
  | "cadence";

interface RunChartTabsProps {
  streams: StravaActivityStreams | null;
}

const chartTabs: {
  id: ChartType;
  label: string;
}[] = [
  {
    id: "pace",
    label: "Pace",
  },
  {
    id: "heart-rate",
    label: "Heart Rate",
  },
  {
    id: "elevation",
    label: "Elevation",
  },
  {
    id: "cadence",
    label: "Cadence",
  },
];

export function RunChartTabs({
  streams,
}: RunChartTabsProps) {
  const [activeChart, setActiveChart] =
    useState<ChartType>("pace");

  return (
    <section>
      {/* Section title */}
      <div className="mb-3">
        <h2 className="text-lg font-bold tracking-tight">
          Charts
        </h2>
      </div>

      {/* Chart tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {chartTabs.map((tab) => {
          const active =
            activeChart === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveChart(tab.id)
              }
              className={`
                shrink-0 rounded-full px-4 py-2
                text-xs font-semibold
                transition-all duration-200
                ${
                  active
                    ? "bg-[#FC4C02] text-white shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:border-[#FC4C02]/30 hover:text-[#FC4C02]"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active chart */}
      <div className="mt-3">
        {activeChart === "pace" && (
          <RunPaceChart streams={streams} />
        )}

        {activeChart === "heart-rate" && (
          <RunHeartRateChart
            streams={streams}
          />
        )}

        {activeChart === "elevation" && (
          <RunElevationChart
            streams={streams}
          />
        )}

        {activeChart === "cadence" && (
          <RunCadenceChart
            streams={streams}
          />
        )}
      </div>
    </section>
  );
}