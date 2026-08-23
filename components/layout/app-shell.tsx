import { DesktopSidebar } from "./desktop-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <MobileHeader />

      <main className="min-h-screen pb-20 lg:ml-64 lg:pb-0">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}