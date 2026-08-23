export function ProgressHeader() {
  return (
    <header>
      <p className="text-sm font-medium text-muted-foreground">
        Training analysis
      </p>

      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        Progress
      </h1>

      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Track how your running performance is changing over time.
      </p>
    </header>
  );
}