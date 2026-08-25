"use client";

import {
  SportShoe,
  Watch,
} from "lucide-react";

type EquipmentItem = {
  name: string;
  status?: string;
};

type EquipmentDataProps = {
  watch?: EquipmentItem | null;
  shoes?: EquipmentItem[];
};

export function EquipmentData({
  watch,
  shoes = [],
}: EquipmentDataProps) {
  const hasEquipment =
    Boolean(watch) || shoes.length > 0;

  if (!hasEquipment) {
    return null;
  }

  return (
    <section className="mt-7 lg:hidden">
      <div className="mb-3 px-1">
        <h2 className="text-sm font-semibold tracking-tight">
          Your gear
        </h2>

        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Equipment used for your training.
        </p>
      </div>

      <div className="space-y-2">
        {/* Watch */}

        {watch && (
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Watch
                className="size-4 text-muted-foreground"
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Watch
              </p>

              <p className="truncate text-xs font-medium">
                {watch.name}
              </p>
            </div>

            {watch.status && (
              <p className="shrink-0 text-[10px] text-muted-foreground">
                {watch.status}
              </p>
            )}
          </div>
        )}

        {/* Shoes */}

        {shoes.map((shoe) => (
          <div
            key={shoe.name}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <SportShoe
                className="size-4 text-muted-foreground"
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Running shoes
              </p>

              <p className="truncate text-xs font-medium">
                {shoe.name}
              </p>
            </div>

            {shoe.status && (
              <p className="shrink-0 text-[10px] text-muted-foreground">
                {shoe.status}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}