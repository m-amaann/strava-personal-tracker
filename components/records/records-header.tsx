import { Trophy } from "lucide-react";

export function RecordsHeader() {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-2">
        <Trophy className="size-5 text-[#FC4C02]" />

        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Records
        </h1>
      </div>

      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        Your best running performances
      </p>
    </header>
  );
}