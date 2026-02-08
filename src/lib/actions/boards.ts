"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { boards: [] };

  const { data: boardsData } = await supabase
    .from("boards")
    .select("*, subject:subjects(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!boardsData || boardsData.length === 0) {
    return { boards: [] };
  }

  const boardsWithStats = [];
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

  return { boards: boardsWithStats };
}

export async function getBoardsList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { boards: [] };

  const { data: boardsData } = await supabase
    .from("boards")
    .select("*, subject:subjects(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!boardsData) return { boards: [] };

  const boardsWithCounts = [];
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

  return { boards: boardsWithCounts };
}

export async function getBoardWithCards(boardId: string) {
  const supabase = await createClient();

  const { data: boardData } = await supabase
    .from("boards")
    .select("*, subject:subjects(*)")
    .eq("id", boardId)
    .single();

  const { data: cardsData } = await supabase
    .from("cards")
    .select("*, checklist_items(*)")
    .eq("board_id", boardId)
    .order("display_order", { ascending: true });

  let sortedCards = cardsData || [];
  if (cardsData) {
    sortedCards = cardsData.map((c) => ({
      ...c,
      checklist_items: c.checklist_items?.sort(
        (a: { display_order: number }, b: { display_order: number }) =>
          a.display_order - b.display_order
      ),
    }));
  }

  return { board: boardData || null, cards: sortedCards };
}

export async function getBoardDetails(boardId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select("*, subject:subjects(*)")
    .eq("id", boardId)
    .single();

  return { board: data || null };
}

export async function updateBoardSetting(
  boardId: string,
  field: "show_weekly" | "show_monthly",
  value: boolean
) {
  const supabase = await createClient();
  await supabase.from("boards").update({ [field]: value }).eq("id", boardId);
  revalidatePath(`/dashboard/boards/${boardId}/settings`);
}

export async function startToday(boardId: string) {
  const supabase = await createClient();

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
  }

  revalidatePath("/dashboard");
}

export async function getSubjectsByGrade(gradeNum: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .eq("grade", gradeNum)
    .eq("country", "LK")
    .order("display_order", { ascending: true });

  return { subjects: data || [] };
}
