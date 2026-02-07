"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2 } from "lucide-react";
import { calculateProgress } from "@/lib/utils";
import type { Board } from "@/lib/types";

interface BoardWithCounts extends Board {
  total: number;
  done: number;
}

export default function BoardsListPage() {
  const [boards, setBoards] = useState<BoardWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: boardsData } = await supabase
      .from("boards")
      .select("*, subject:subjects(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!boardsData) {
      setLoading(false);
      return;
    }

    const boardsWithCounts: BoardWithCounts[] = [];
    for (const board of boardsData) {
      const { count: total } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("board_id", board.id);

      const { count: done } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("board_id", board.id)
        .eq("status", "done");

      boardsWithCounts.push({
        ...board,
        total: total || 0,
        done: done || 0,
      });
    }

    setBoards(boardsWithCounts);
    setLoading(false);
  }

  return (
    <>
      <Header title="My Boards" />
      <div className="px-4 md:px-6 py-4 md:py-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold hidden md:block">All Boards</h2>
          <Button asChild className="gap-2 sm:w-auto">
            <Link href="/dashboard/boards/new">
              <Plus className="w-4 h-4" />
              Create New Board
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Loading boards...
            </div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No boards yet.</p>
            <p className="text-sm text-muted-foreground">
              Create your first board to start studying!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => {
              const progress = calculateProgress(board.done, board.total);
              return (
                <Link
                  key={board.id}
                  href={`/dashboard/boards/${board.id}`}
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">
                            {board.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Grade {board.grade} &middot;{" "}
                            {board.subject?.name || "Subject"}
                          </p>
                        </div>
                        <Badge
                          variant={progress === 100 ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {board.done} / {board.total} sections
                        </span>
                        {board.show_weekly && (
                          <Badge variant="outline" className="text-xs py-0">
                            Weekly
                          </Badge>
                        )}
                        {board.show_monthly && (
                          <Badge variant="outline" className="text-xs py-0">
                            Monthly
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
