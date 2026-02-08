import { getBoardDetails } from "@/lib/actions/boards";
import BoardSettingsContent from "./board-settings-content";
import { Header } from "@/components/layout/header";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardSettingsPage({ params }: PageProps) {
  const { boardId } = await params;
  const { board } = await getBoardDetails(boardId);

  if (!board) {
    return (
      <>
        <Header title="Settings" showLogo={false} />
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">Board not found.</p>
        </div>
      </>
    );
  }

  return <BoardSettingsContent initialBoard={board} />;
}
