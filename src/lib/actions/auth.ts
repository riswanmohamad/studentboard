"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    email: user.email || "",
    username: data?.username || null,
    full_name: data?.full_name || null,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
