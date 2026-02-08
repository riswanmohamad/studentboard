"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { trackEvent, EVENTS } from "@/lib/posthog";
import { updateBoardSetting } from "@/lib/actions/boards";
import type { Board } from "@/lib/types";

interface BoardSettingsContentProps {
  initialBoard: Board;
}

export default function BoardSettingsContent({
  initialBoard,
}: BoardSettingsContentProps) {
  const router = useRouter();
  const boardId = initialBoard.id;

  const [board, setBoard] = useState<Board>(initialBoard);
  const [resetting, setResetting] = useState(false);

  async function handleUpdateSetting(
    field: "show_weekly" | "show_monthly",
    value: boolean
  ) {
    setBoard((prev) => ({ ...prev, [field]: value }));
    await updateBoardSetting(boardId, field, value);
  }

  async function handleReset() {
    setResetting(true);
    try {
      const response = await fetch(`/api/boards/${boardId}/reset`, {
        method: "POST",
      });

      if (response.ok) {
        trackEvent(EVENTS.BOARD_RESET, { board_id: boardId });
        router.push(`/dashboard/boards/${boardId}`);
      }
    } catch {
      // Handle error silently
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <Header title="Board Settings" showLogo={false} />
      <div className="px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-lg mx-auto space-y-4">
          <Link
            href={`/dashboard/boards/${boardId}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to board
          </Link>

          {/* Board Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Board Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{board.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Grade</span>
                <span className="font-medium">Grade {board.grade}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium">
                  {board.subject?.name || "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Planning Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Planning Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Weekly Plan</Label>
                  <p className="text-xs text-muted-foreground">
                    Filter &quot;In Progress&quot; by weekly plan
                  </p>
                </div>
                <Switch
                  checked={board.show_weekly}
                  onCheckedChange={(v) =>
                    handleUpdateSetting("show_weekly", v)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Monthly Plan</Label>
                  <p className="text-xs text-muted-foreground">
                    Filter &quot;In Progress&quot; by monthly plan
                  </p>
                </div>
                <Switch
                  checked={board.show_monthly}
                  onCheckedChange={(v) =>
                    handleUpdateSetting("show_monthly", v)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will move all cards back to &quot;Not Started&quot; and
                uncheck all checklist items. Your notes will be preserved.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={resetting}
                  >
                    {resetting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Reset Board
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset this board?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will move all cards back to &quot;Not Started&quot;,
                      clear all plan flags, and uncheck all checklist items.
                      Your notes will be kept. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, reset board
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
