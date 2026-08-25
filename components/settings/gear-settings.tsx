"use client";

import {
  Footprints,
  Watch,
} from "lucide-react";

type GearItem = {
  name: string;
  status?: string;
};

interface GearSettingsProps {
  watch: GearItem | null;
  shoes: GearItem[];
}

export function GearSettings({
  watch,
  shoes,
}: GearSettingsProps) {
  const hasGear =
    Boolean(watch) || shoes.length > 0;

  if (!hasGear) {
    return null;
  }

  return (
    <section className="mt-3 lg:hidden">
      <div className="mb-2 px-1">
        <h2 className="text-sm font-semibold tracking-tight">
          Gear
        </h2>

        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Your connected training equipment.
        </p>
      </div>

      <div className="space-y-1">
        {/* Watch */}

        {watch && (
          <div className="flex items-center gap-2.5 px-1">
            <div
              className="
                flex
                size-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-muted
              "
            >
              <Watch
                className="size-3.5 text-muted-foreground"
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {watch.name}
              </p>

              {watch.status && (
                <p className="text-[10px] text-muted-foreground">
                  {watch.status}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Running shoes */}

        {shoes.map((shoe) => (
          <div
            key={shoe.name}
            className="flex items-center gap-2.5 px-1"
          >
            <div
              className="
                flex
                size-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-muted
              "
            >
              <Footprints
                className="size-3.5 text-muted-foreground"
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {shoe.name}
              </p>

              {shoe.status && (
                <p className="text-[10px] text-muted-foreground">
                  {shoe.status}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}