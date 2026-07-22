import { supabase } from "@/lib/supabase";

const SID_KEY = "yacha_sid";
const VIA_KEY = "yacha_via";

export function rememberVia(via: string) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(VIA_KEY, via); } catch { /* ignore */ }
}

function getVia(): string | null {
  if (typeof window === "undefined") return null;
  try { return sessionStorage.getItem(VIA_KEY); } catch { return null; }
}

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
      let finalProps = props;
      if (name === "entry_select" && !("via" in props)) {
        const via = getVia();
        if (via) finalProps = { ...props, via };
      }
      await supabase.from("events").insert({
        name,
        props: finalProps,
        session_id,
        user_id,
      });
    } catch {
      // 이벤트 실패는 무시
    }
  })();
}