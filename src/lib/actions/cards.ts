"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CardStatus, PlanFlag } from "@/lib/types";

export async function moveCard(
  cardId: string,
  newStatus: CardStatus,
  boardId: string
) {
  const supabase = await createClient();
  await supabase
    .from("cards")
    .update({ status: newStatus })
    .eq("id", cardId);

  revalidatePath(`/dashboard/boards/${boardId}`);
}

export async function toggleChecklistItem(
  itemId: string,
  isDone: boolean,
  boardId: string
) {
  const supabase = await createClient();
  await supabase
    .from("checklist_items")
    .update({ is_done: isDone })
    .eq("id", itemId);

  revalidatePath(`/dashboard/boards/${boardId}`);
}

export async function updateCardNotes(
  cardId: string,
  notes: string,
  boardId: string
) {
  const supabase = await createClient();
  await supabase.from("cards").update({ notes }).eq("id", cardId);
  revalidatePath(`/dashboard/boards/${boardId}`);
}

export async function updateCardPlan(
  cardId: string,
  plan: PlanFlag,
  boardId: string
) {
  const supabase = await createClient();
  await supabase.from("cards").update({ plan }).eq("id", cardId);
  revalidatePath(`/dashboard/boards/${boardId}`);
}
