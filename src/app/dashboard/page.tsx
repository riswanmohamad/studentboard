import { getDashboardData } from "@/lib/actions/boards";
import DashboardContent from "./dashboard-content";

export default async function DashboardHomePage() {
  const { boards } = await getDashboardData();
  return <DashboardContent initialBoards={boards} />;
}
