import { Card } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  change?: string;
  changeLabel?: string;
  positive?: boolean;
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  changeLabel,
  positive = true,
}: MetricCardProps) {
  return (
    <Card className="p-4 shadow-none sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight sm:text-3xl">
          {value}
        </span>

        {unit && (
          <span className="text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      {change && (
        <p
          className={`mt-1 text-xs font-medium ${
            positive ? "text-emerald-600" : "text-muted-foreground"
          }`}
        >
          {change}
          {changeLabel && (
            <span className="ml-1 font-normal text-muted-foreground">
              {changeLabel}
            </span>
          )}
        </p>
      )}
    </Card>
  );
}