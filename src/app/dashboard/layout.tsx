import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-20 max-w-lg mx-auto">
      {children}
      <BottomNav />
    </div>
  );
}
