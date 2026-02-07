import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const supabase = await createClient();
    const { boardId } = await params;

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify board belongs to user
    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("id", boardId)
      .eq("user_id", user.id)
      .single();

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Get all cards for this board
    const { data: cards } = await supabase
      .from("cards")
      .select("id")
      .eq("board_id", boardId);

    if (cards && cards.length > 0) {
      const cardIds = cards.map((c) => c.id);

      // Reset all cards to not_started, clear plan
      await supabase
        .from("cards")
        .update({
          status: "not_started",
          plan: "none",
        })
        .eq("board_id", boardId);

      // Uncheck all checklist items
      await supabase
        .from("checklist_items")
        .update({ is_done: false })
        .in("card_id", cardIds);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Board reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
