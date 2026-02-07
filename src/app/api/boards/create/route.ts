import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { CreateBoardRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateBoardRequest = await request.json();
    const { grade, subject_id, name, show_weekly, show_monthly } = body;

    // Validate required fields
    if (!grade || !subject_id || !name) {
      return NextResponse.json(
        { error: "Missing required fields: grade, subject_id, name" },
        { status: 400 }
      );
    }

    // Find the template for this grade + subject
    const { data: template } = await supabase
      .from("templates")
      .select("*")
      .eq("subject_id", subject_id)
      .eq("grade", grade)
      .single();

    if (!template) {
      return NextResponse.json(
        { error: "No template found for this grade and subject" },
        { status: 404 }
      );
    }

    // Get template cards with checklist items
    const { data: templateCards } = await supabase
      .from("template_cards")
      .select("*, template_checklist_items(*)")
      .eq("template_id", template.id)
      .order("display_order", { ascending: true });

    if (!templateCards || templateCards.length === 0) {
      return NextResponse.json(
        { error: "Template has no cards" },
        { status: 500 }
      );
    }

    // Create the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({
        user_id: user.id,
        subject_id,
        grade,
        name,
        show_weekly: show_weekly || false,
        show_monthly: show_monthly || false,
      })
      .select()
      .single();

    if (boardError || !board) {
      return NextResponse.json(
        { error: boardError?.message || "Failed to create board" },
        { status: 500 }
      );
    }

    // Create cards from template
    for (const tc of templateCards) {
      const { data: card, error: cardError } = await supabase
        .from("cards")
        .insert({
          board_id: board.id,
          title: tc.title,
          status: "not_started",
          plan: "none",
          display_order: tc.display_order,
        })
        .select()
        .single();

      if (cardError || !card) continue;

      // Create checklist items from template (if enabled)
      if (
        template.checklist_enabled &&
        tc.template_checklist_items &&
        tc.template_checklist_items.length > 0
      ) {
        const checklistItems = tc.template_checklist_items
          .sort(
            (a: { display_order: number }, b: { display_order: number }) =>
              a.display_order - b.display_order
          )
          .map(
            (tci: { text: string; display_order: number }) => ({
              card_id: card.id,
              text: tci.text,
              is_done: false,
              display_order: tci.display_order,
            })
          );

        await supabase.from("checklist_items").insert(checklistItems);
      }
    }

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error("Board creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
