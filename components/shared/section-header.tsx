interface SectionHeaderProps {
  title: string;
  action?: string;
}

export function SectionHeader({
  title,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold tracking-tight">
        {title}
      </h2>

      {action && (
        <button
          type="button"
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          {action}
        </button>
      )}
    </div>
  );
}