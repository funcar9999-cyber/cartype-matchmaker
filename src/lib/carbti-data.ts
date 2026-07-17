import { supabase, DIAGNOSIS_DB_ID_KEY } from "@/lib/supabase";
import type { Answer } from "@/lib/carbti-questions";

export async function upsertProfileFromUser(user: {
  id: string;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata ?? {};
  const nickname =
    (meta["kakao_nickname"] as string) ??
    (meta["nickname"] as string) ??
    (meta["name"] as string) ??
    (meta["full_name"] as string) ??
    null;
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, kakao_nickname: nickname },
      { onConflict: "id" },
    );
  if (error) console.warn("[profiles upsert]", error);
}

export async function insertDiagnosis(input: {
  code: string;
  valueScore: number;
  answers: Answer[];
  userId: string | null;
}) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { error } = await supabase.from("diagnoses").insert({
    id,
    code: input.code,
    value_score: input.valueScore,
    answers: input.answers,
    user_id: input.userId,
  });
  if (error) {
    console.warn("[diagnosis insert]", error);
    return null;
  }
  try {
    sessionStorage.setItem(DIAGNOSIS_DB_ID_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

export async function claimAnonymousDiagnosis(userId: string) {
  if (typeof window === "undefined") return;
  const dbId = sessionStorage.getItem(DIAGNOSIS_DB_ID_KEY);
  if (!dbId) return;
  const { error } = await supabase
    .from("diagnoses")
    .update({ user_id: userId })
    .eq("id", dbId)
    .is("user_id", null);
  if (error) console.warn("[diagnosis claim]", error);
}

export async function updateSelfBudget(dbId: string, budget: number) {
  const { error } = await supabase
    .from("diagnoses")
    .update({ self_budget_manwon: budget })
    .eq("id", dbId);
  if (error) console.warn("[self budget]", error);
}

export type LeadSource =
  | "result"
  | "mydata_result"
  | "compare"
  | "consult"
  | "car_detail";

export async function insertLead(input: {
  source: LeadSource;
  interestCarId: string | null;
  preferredMethod: string;
  budgetManwon: number | null;
  contactPref: "chat_only" | "call_ok";
  diagnosisId: string | null;
  userId: string | null;
}) {
  const { error } = await supabase.from("leads").insert({
    source: input.source,
    interest_car_id: input.interestCarId,
    preferred_method: input.preferredMethod,
    budget_manwon: input.budgetManwon,
    contact_pref: input.contactPref,
    diagnosis_id: input.diagnosisId,
    user_id: input.userId,
  });
  if (error) console.warn("[lead insert]", error);
}

export async function isFavorite(userId: string, carId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("car_id")
    .eq("user_id", userId)
    .eq("car_id", carId)
    .maybeSingle();
  if (error) console.warn("[fav check]", error);
  return !!data;
}

export async function toggleFavorite(userId: string, carId: string, next: boolean) {
  if (next) {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, car_id: carId });
    if (error && error.code !== "23505") console.warn("[fav add]", error);
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("car_id", carId);
    if (error) console.warn("[fav rm]", error);
  }
}

export async function listMyFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("car_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[fav list]", error);
    return [];
  }
  return data ?? [];
}

export async function getMyLatestDiagnosis(userId: string) {
  const { data, error } = await supabase
    .from("diagnoses")
    .select("id, code, self_budget_manwon, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[my diagnosis]", error);
    return null;
  }
  return data;
}