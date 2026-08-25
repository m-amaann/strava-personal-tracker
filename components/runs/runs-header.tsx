import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface RunsHeaderProps {
  totalRuns: number;
}

export function RunsHeader({totalRuns}: RunsHeaderProps) 
{
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Your activities
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Runs
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {totalRuns}{" "}
          {totalRuns === 1
            ? "running activity"
            : "running activities"}
        </p>
      </div>

      {/* <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Search runs"
        >
          <Search className="size-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Filter runs"
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </div> */}
    </header>
  );
}