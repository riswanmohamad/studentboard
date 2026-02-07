"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowRight,
  Zap,
  BookOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { calculateProgress } from "@/lib/utils";
import { trackEvent, EVENTS } from "@/lib/posthog";
import type { Board, Card as CardType } from "@/lib/types";

interface BoardWithStats extends Board {
  total: number;
  done: number;
  in_progress_cards: CardType[];
}

export default function DashboardHomePage() {
  const [boards, setBoards] = useState<BoardWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch boards with subjects
    const { data: boardsData } = await supabase
      .from("boards")
      .select("*, subject:subjects(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!boardsData || boardsData.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch card counts for each board
    const boardsWithStats: BoardWithStats[] = [];
    for (const board of boardsData) {
      const { data: cards } = await supabase
        .from("cards")
        .select("*")
        .eq("board_id", board.id);

      const total = cards?.length || 0;
      const done = cards?.filter((c) => c.status === "done").length || 0;
      const in_progress_cards =
        cards
          ?.filter((c) => c.status === "in_progress")
          .sort((a, b) => a.display_order - b.display_order) || [];

      boardsWithStats.push({
        ...board,
        total,
        done,
        in_progress_cards,
      });
    }

    setBoards(boardsWithStats);
    setLoading(false);
  }

  async function handleStartToday(boardId: string) {
    trackEvent(EVENTS.START_TODAY_CLICKED, { board_id: boardId });
    const supabase = createClient();

    // Get top 3 not_started cards
    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .eq("board_id", boardId)
      .eq("status", "not_started")
      .order("display_order", { ascending: true })
      .limit(3);

    if (cards && cards.length > 0) {
      const ids = cards.map((c) => c.id);
      await supabase
        .from("cards")
        .update({ status: "in_progress" })
        .in("id", ids);

      loadDashboard();
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </>
    );
  }

  // Empty state
  if (boards.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue/20 via-purple/15 to-teal/10 flex items-center justify-center mb-6 shadow-lg shadow-blue/10">
            <BookOpen className="w-10 h-10 text-blue" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-300">Welcome to StudentBoard!</h2>
          <p className="text-muted-foreground mb-8 max-w-xs">
            Create your first study board and start organizing your exam
            preparation.
          </p>
          <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-blue to-purple hover:from-blue/90 hover:to-purple/90 shadow-lg">
            <Link href="/dashboard/boards/new">
              <Plus className="w-5 h-5" />
              Create Your First Board
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const activeBoard = boards[0];
  const progress = calculateProgress(activeBoard.done, activeBoard.total);

  return (
    <>
      <Header />
      <div className="px-4 md:px-6 py-4 md:py-6 space-y-6">
        {/* Desktop: Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Continue Studying Card */}
          <Card className="bg-gradient-to-br from-blue/15 via-blue/8 to-background border-blue/30 shadow-lg shadow-blue/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-blue-700 dark:text-blue-300">Continue Studying</CardTitle>
              <Badge variant="secondary" className="text-xs bg-blue/10 text-blue-700 border-blue/20">
                G{activeBoard.grade}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {activeBoard.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-2">
              <Button asChild size="sm" className="flex-1 gap-1 bg-blue hover:bg-blue/90">
                <Link href={`/dashboard/boards/${activeBoard.id}`}>
                  Open Board
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

          {/* Today Section */}
          <div className="lg:row-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange" />
              Today&apos;s Tasks
            </h2>
          </div>

          {activeBoard.in_progress_cards.length > 0 ? (
            <div className="space-y-2">
              {activeBoard.in_progress_cards.slice(0, 5).map((card) => (
                <Link
                  key={card.id}
                  href={`/dashboard/boards/${activeBoard.id}?card=${card.id}`}
                >
                  <Card className="hover:bg-green/5 transition-all duration-200 cursor-pointer border-green/20 hover:border-green/40 hover:shadow-md hover:shadow-green/10">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Clock className="w-4 h-4 text-green flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">
                        {card.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-orange/10 via-orange/5 to-background border-orange/25">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No tasks in progress. Start today&apos;s study session!
                </p>
                <Button
                  size="sm"
                  onClick={() => handleStartToday(activeBoard.id)}
                  className="gap-1 bg-orange hover:bg-orange/90"
                >
                  <Zap className="w-4 h-4" />
                  Start Today
                </Button>
              </CardContent>
            </Card>
          )}
          </div>
        </div>

        {/* All Boards Overview */}
        {boards.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">All Boards</h2>
              <Link
                href="/dashboard/boards"
                className="text-sm text-primary font-medium"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {boards.slice(0, 4).map((board, index) => {
                const p = calculateProgress(board.done, board.total);
                const colors = ['teal', 'purple', 'pink', 'green'];
                const colorClass = colors[index % colors.length];
                return (
                  <Link key={board.id} href={`/dashboard/boards/${board.id}`}>
                    <Card className={`hover:bg-${colorClass}/5 transition-all duration-200 cursor-pointer bg-gradient-to-br from-${colorClass}/10 via-${colorClass}/5 to-background border-${colorClass}/25 hover:border-${colorClass}/40 hover:shadow-lg hover:shadow-${colorClass}/10`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium truncate flex-1">
                            {board.name}
                          </span>
                          <span className={`text-xs text-${colorClass}-600 dark:text-${colorClass}-400 ml-2 font-medium`}>
                            {p}%
                          </span>
                        </div>
                        <Progress value={p} className="h-1.5" />
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className={`w-3 h-3 text-${colorClass}`} />
                            {board.done}/{board.total}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
