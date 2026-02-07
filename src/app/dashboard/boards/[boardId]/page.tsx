"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  Settings,
  Play,
  CheckCircle2,
  ChevronRight,
  Circle,
  RotateCcw,
} from "lucide-react";
import {
  calculateProgress,
  getStatusLabel,
  getPlanLabel,
} from "@/lib/utils";
import { trackEvent, EVENTS } from "@/lib/posthog";
import type {
  Board,
  Card as CardType,
  CardStatus,
  ChecklistItem,
  PlanFlag,
} from "@/lib/types";

type LaneFilter = "not_started" | "in_progress" | "done";
type PlanFilter = "all" | "this_week" | "this_month";

export default function BoardViewPage() {
  const params = useParams();
  const boardId = params.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [activeLane, setActiveLane] = useState<LaneFilter>("not_started");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBoard = useCallback(async () => {
    const supabase = createClient();

    const { data: boardData } = await supabase
      .from("boards")
      .select("*, subject:subjects(*)")
      .eq("id", boardId)
      .single();

    if (boardData) setBoard(boardData);

    const { data: cardsData } = await supabase
      .from("cards")
      .select("*, checklist_items(*)")
      .eq("board_id", boardId)
      .order("display_order", { ascending: true });

    if (cardsData) {
      // Sort checklist items within each card
      const sorted = cardsData.map((c) => ({
        ...c,
        checklist_items: c.checklist_items?.sort(
          (a: ChecklistItem, b: ChecklistItem) =>
            a.display_order - b.display_order
        ),
      }));
      setCards(sorted);
    }

    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Filter cards by lane
  const filteredCards = cards.filter((c) => {
    if (c.status !== activeLane) return false;
    if (activeLane === "in_progress" && planFilter !== "all") {
      return c.plan === planFilter;
    }
    return true;
  });

  // Stats
  const totalCards = cards.length;
  const doneCards = cards.filter((c) => c.status === "done").length;
  const progressPct = calculateProgress(doneCards, totalCards);

  // Count per lane
  const countByLane = (lane: CardStatus) =>
    cards.filter((c) => c.status === lane).length;

  // Move card to new status
  async function moveCard(cardId: string, newStatus: CardStatus) {
    const supabase = createClient();
    await supabase
      .from("cards")
      .update({ status: newStatus })
      .eq("id", cardId);

    trackEvent(EVENTS.CARD_MOVED, { card_id: cardId, new_status: newStatus });

    // Update local state
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c))
    );

    // Update selected card if open
    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }
  }

  // Toggle checklist item
  async function toggleChecklistItem(itemId: string, isDone: boolean) {
    const supabase = createClient();
    await supabase
      .from("checklist_items")
      .update({ is_done: isDone })
      .eq("id", itemId);

    trackEvent(EVENTS.CHECKLIST_TOGGLED, { item_id: itemId, is_done: isDone });

    // Update local state
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        checklist_items: c.checklist_items?.map((item) =>
          item.id === itemId ? { ...item, is_done: isDone } : item
        ),
      }))
    );

    // Update selected card
    if (selectedCard) {
      setSelectedCard((prev) =>
        prev
          ? {
              ...prev,
              checklist_items: prev.checklist_items?.map((item) =>
                item.id === itemId ? { ...item, is_done: isDone } : item
              ),
            }
          : null
      );
    }
  }

  // Update card notes
  async function updateNotes(cardId: string, notes: string) {
    const supabase = createClient();
    await supabase.from("cards").update({ notes }).eq("id", cardId);

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, notes } : c))
    );
  }

  // Update card plan
  async function updatePlan(cardId: string, plan: PlanFlag) {
    const supabase = createClient();
    await supabase.from("cards").update({ plan }).eq("id", cardId);

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, plan } : c))
    );
    if (selectedCard?.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, plan } : null));
    }
  }

  function openCard(card: CardType) {
    setSelectedCard(card);
    setSheetOpen(true);
    trackEvent(EVENTS.CARD_OPENED, { card_id: card.id });
  }

  // Get next status action
  function getNextAction(
    status: CardStatus
  ): { label: string; status: CardStatus; icon: React.ReactNode } | null {
    switch (status) {
      case "not_started":
        return {
          label: "Start",
          status: "in_progress",
          icon: <Play className="w-4 h-4" />,
        };
      case "in_progress":
        return {
          label: "Done",
          status: "done",
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case "done":
        return {
          label: "Restart",
          status: "not_started",
          icon: <RotateCcw className="w-4 h-4" />,
        };
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Loading..." showLogo={false} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">
            Loading board...
          </div>
        </div>
      </>
    );
  }

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

  return (
    <>
      {/* Compact Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-lg md:max-w-none lg:max-w-4xl xl:max-w-5xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <Link
              href="/dashboard/boards"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm md:text-base truncate">{board.name}</h1>
              <p className="text-xs text-muted-foreground">
                {doneCards}/{totalCards} sections &middot; {progressPct}%
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/boards/${boardId}/settings`}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        {/* Progress bar */}
        <Progress value={progressPct} className="h-1 rounded-none" />
      </header>

      <div className="px-4 md:px-6 py-3 md:py-4">
        {/* Lane Switcher */}
        <Tabs
          value={activeLane}
          onValueChange={(v) => setActiveLane(v as LaneFilter)}
        >
          <TabsList className="mb-3">
            <TabsTrigger value="not_started" className="gap-1 text-xs">
              Not Started
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {countByLane("not_started")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1 text-xs">
              In Progress
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {countByLane("in_progress")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="done" className="gap-1 text-xs">
              Done
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {countByLane("done")}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* In Progress sub-filters */}
          {activeLane === "in_progress" &&
            (board.show_weekly || board.show_monthly) && (
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant={planFilter === "all" ? "default" : "outline"}
                  className="text-xs h-7"
                  onClick={() => setPlanFilter("all")}
                >
                  All
                </Button>
                {board.show_weekly && (
                  <Button
                    size="sm"
                    variant={
                      planFilter === "this_week" ? "default" : "outline"
                    }
                    className="text-xs h-7"
                    onClick={() => setPlanFilter("this_week")}
                  >
                    This Week
                  </Button>
                )}
                {board.show_monthly && (
                  <Button
                    size="sm"
                    variant={
                      planFilter === "this_month" ? "default" : "outline"
                    }
                    className="text-xs h-7"
                    onClick={() => setPlanFilter("this_month")}
                  >
                    This Month
                  </Button>
                )}
              </div>
            )}

          {/* Card List */}
          <TabsContent value={activeLane} className="mt-0">
            {filteredCards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Circle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  No cards in {getStatusLabel(activeLane)}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCards.map((card) => {
                  const checkTotal = card.checklist_items?.length || 0;
                  const checkDone =
                    card.checklist_items?.filter((i) => i.is_done).length || 0;
                  const nextAction = getNextAction(card.status);

                  return (
                    <Card
                      key={card.id}
                      className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                      onClick={() => openCard(card)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight">
                              {card.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {checkTotal > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {checkDone}/{checkTotal}
                                </span>
                              )}
                              {card.plan !== "none" && (
                                <Badge
                                  variant="info"
                                  className="text-xs py-0 px-1.5"
                                >
                                  {getPlanLabel(card.plan)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {nextAction && (
                              <Button
                                size="sm"
                                variant={
                                  nextAction.status === "done"
                                    ? "success"
                                    : "outline"
                                }
                                className="h-8 text-xs gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveCard(card.id, nextAction.status);
                                }}
                              >
                                {nextAction.icon}
                                {nextAction.label}
                              </Button>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Card Detail Sheet (Bottom Sheet) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom">
          {selectedCard && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left pr-8">
                  {selectedCard.title}
                </SheetTitle>
                <SheetDescription className="text-left">
                  {getStatusLabel(selectedCard.status)}
                  {selectedCard.plan !== "none" &&
                    ` · ${getPlanLabel(selectedCard.plan)}`}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  {selectedCard.status !== "in_progress" && (
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() =>
                        moveCard(selectedCard.id, "in_progress")
                      }
                    >
                      <Play className="w-4 h-4" />
                      In Progress
                    </Button>
                  )}
                  {selectedCard.status !== "done" && (
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1 gap-1"
                      onClick={() => moveCard(selectedCard.id, "done")}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Done
                    </Button>
                  )}
                  {selectedCard.status === "done" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() =>
                        moveCard(selectedCard.id, "not_started")
                      }
                    >
                      <RotateCcw className="w-4 h-4" />
                      Move to Not Started
                    </Button>
                  )}
                </div>

                {/* Plan Selector */}
                {(board?.show_weekly || board?.show_monthly) && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Plan
                    </label>
                    <Select
                      value={selectedCard.plan}
                      onValueChange={(v) =>
                        updatePlan(selectedCard.id, v as PlanFlag)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No plan</SelectItem>
                        {board?.show_weekly && (
                          <SelectItem value="this_week">This Week</SelectItem>
                        )}
                        {board?.show_monthly && (
                          <SelectItem value="this_month">
                            This Month
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Checklist */}
                {selectedCard.checklist_items &&
                  selectedCard.checklist_items.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Checklist (
                        {
                          selectedCard.checklist_items.filter((i) => i.is_done)
                            .length
                        }
                        /{selectedCard.checklist_items.length})
                      </label>
                      <div className="space-y-2">
                        {selectedCard.checklist_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 py-1"
                          >
                            <Checkbox
                              checked={item.is_done}
                              onCheckedChange={(checked) =>
                                toggleChecklistItem(
                                  item.id,
                                  checked as boolean
                                )
                              }
                            />
                            <span
                              className={`text-sm flex-1 ${
                                item.is_done
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Add your study notes here..."
                    value={selectedCard.notes || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedCard((prev) =>
                        prev ? { ...prev, notes: value } : null
                      );
                    }}
                    onBlur={() => {
                      if (selectedCard) {
                        updateNotes(
                          selectedCard.id,
                          selectedCard.notes || ""
                        );
                      }
                    }}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
