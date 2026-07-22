import { supabase } from "@/lib/supabase";

const SID_KEY = "yacha_sid";

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

export function track(name: string, props: Record<string, unknown> = {}) {
  void (async () => {
    try {
      const session_id = getSessionId();
      const { data } = await supabase.auth.getSession();
      const user_id = data.session?.user?.id ?? null;
      await supabase.from("events").insert({
        name,
        props,
        session_id,
        user_id,
      });
    } catch {
      // 이벤트 실패는 무시
    }
  })();
}