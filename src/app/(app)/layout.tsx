import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { GamificationProvider } from "@/contexts/GamificationContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <GamificationProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </GamificationProvider>
  );
}
