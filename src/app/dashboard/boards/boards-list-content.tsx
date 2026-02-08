"use client";

import Link from "next/link";
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

interface BoardsListContentProps {
  initialBoards: BoardWithCounts[];
}

export default function BoardsListContent({
  initialBoards,
}: BoardsListContentProps) {
  const boards = initialBoards;

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

        {boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No boards yet.</p>
            <p className="text-sm text-muted-foreground">
              Create your first board to start studying!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, index) => {
              const progress = calculateProgress(board.done, board.total);
              const colors = [
                "blue",
                "green",
                "purple",
                "orange",
                "teal",
                "pink",
              ];
              const colorClass = colors[index % colors.length];
              return (
                <Link key={board.id} href={`/dashboard/boards/${board.id}`}>
                  <Card
                    className={`hover:bg-${colorClass}/5 transition-all duration-200 cursor-pointer h-full bg-gradient-to-br from-${colorClass}/12 via-${colorClass}/6 to-background border-${colorClass}/25 hover:border-${colorClass}/40 hover:shadow-lg hover:shadow-${colorClass}/10`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-sm text-${colorClass}-700 dark:text-${colorClass}-300`}
                          >
                            {board.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Grade {board.grade} &middot;{" "}
                            {board.subject?.name || "Subject"}
                          </p>
                        </div>
                        <Badge
                          variant={progress === 100 ? "success" : "secondary"}
                          className={`text-xs ${
                            progress === 100
                              ? ""
                              : "bg-" +
                                colorClass +
                                "/15 text-" +
                                colorClass +
                                "-700 dark:text-" +
                                colorClass +
                                "-300 border-" +
                                colorClass +
                                "/30"
                          }`}
                        >
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2
                            className={`w-3 h-3 text-${colorClass}`}
                          />
                          {board.done} / {board.total} sections
                        </span>
                        {board.show_weekly && (
                          <Badge
                            variant="outline"
                            className={`text-xs py-0 border-${colorClass}/30 text-${colorClass}-600 dark:text-${colorClass}-400`}
                          >
                            Weekly
                          </Badge>
                        )}
                        {board.show_monthly && (
                          <Badge
                            variant="outline"
                            className={`text-xs py-0 border-${colorClass}/30 text-${colorClass}-600 dark:text-${colorClass}-400`}
                          >
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
