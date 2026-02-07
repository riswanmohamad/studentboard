import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex">
      {/* Sidebar for desktop/tablet */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 pb-20 md:pb-0">
        <div className="max-w-lg md:max-w-none lg:max-w-4xl xl:max-w-5xl mx-auto">
          {children}
        </div>
      </div>
      
      {/* Bottom nav for mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
