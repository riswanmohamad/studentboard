// ============================================
// StudentBoard - TypeScript Types
// ============================================

export type CardStatus = "not_started" | "in_progress" | "done";
export type PlanFlag = "none" | "this_week" | "this_month";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  grade: number;
  country: string;
  exam: string;
  display_order: number;
}

export interface Board {
  id: string;
  user_id: string;
  subject_id: string;
  grade: number;
  name: string;
  show_weekly: boolean;
  show_monthly: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  subject?: Subject;
  card_counts?: {
    total: number;
    not_started: number;
    in_progress: number;
    done: number;
  };
}

export interface Card {
  id: string;
  board_id: string;
  title: string;
  notes: string | null;
  status: CardStatus;
  plan: PlanFlag;
  display_order: number;
  created_at: string;
  updated_at: string;
  checklist_items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  card_id: string;
  text: string;
  is_done: boolean;
  display_order: number;
}

export interface Template {
  id: string;
  subject_id: string;
  grade: number;
  country: string;
  checklist_enabled: boolean;
}

export interface TemplateCard {
  id: string;
  template_id: string;
  title: string;
  display_order: number;
  template_checklist_items?: TemplateChecklistItem[];
}

export interface TemplateChecklistItem {
  id: string;
  template_card_id: string;
  text: string;
  display_order: number;
}

// Board creation request
export interface CreateBoardRequest {
  grade: number;
  subject_id: string;
  name: string;
  show_weekly: boolean;
  show_monthly: boolean;
}

// Card with computed progress
export interface CardWithProgress extends Card {
  checklist_total: number;
  checklist_done: number;
}

// Dashboard stats
export interface BoardStats {
  board_id: string;
  board_name: string;
  subject_name: string;
  grade: number;
  total_cards: number;
  not_started: number;
  in_progress: number;
  done: number;
  completion_percentage: number;
}
