import { getBoardWithCards } from "@/lib/actions/boards";
import BoardViewContent from "./board-view-content";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardViewPage({ params }: PageProps) {
  const { boardId } = await params;
  const { board, cards } = await getBoardWithCards(boardId);

  if (!board) {
    return (
      <>
        <Header title="Board not found" showLogo={false} />
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">This board doesn&apos;t exist.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/dashboard/boards">Back to boards</Link>
          </Button>
        </div>
      </>
    );
  }

  return <BoardViewContent initialBoard={board} initialCards={cards} />;
}
