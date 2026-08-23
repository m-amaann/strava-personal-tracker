"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

const filters = [
  {
    value: "all",
    label: "All Runs",
  },
  {
    value: "week",
    label: "This Week",
  },
  {
    value: "month",
    label: "This Month",
  },
  {
    value: "long",
    label: "Long Runs",
  },
] as const;

export function RunsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilter =
    searchParams.get("filter") ?? "all";

  function handleFilter(filter: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }

    const query = params.toString();

    router.replace(
      query
        ? `/runs?${query}`
        : "/runs",
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((filter) => {
        const isActive =
          activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() =>
              handleFilter(filter.value)
            }
            aria-pressed={isActive}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-[#FC4C02] text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:border-[#FC4C02]/30 hover:text-[#FC4C02]"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}