import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import { supabase, DIAGNOSIS_DB_ID_KEY } from "@/lib/supabase";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { getMyLatestDiagnosis, updateSelfBudget } from "@/lib/carbti-data";
import {
  PRECISION_KEY,
  readPrecision,
  writePrecision,
  type PrecisionData,
} from "@/lib/precision";

const CODE_KEY = "carbti:diagnosis:code";
const BUDGET_KEY = "carbti:budget";
const ANSWERS_KEY = "carbti:answers";
const VALUE_KEY = "carbti:diagnosis:valueScore";

const SESSION_KEYS = [
  CODE_KEY,
  BUDGET_KEY,
  ANSWERS_KEY,
  VALUE_KEY,
  DIAGNOSIS_DB_ID_KEY,
  PRECISION_KEY,
];

export type MyCarbtiSource = "db" | "session" | "none";
export type MyCarbtiStatus = "loading" | "ready";

export type MyCarbtiState = {
  status: MyCarbtiStatus;
  source: MyCarbtiSource;
  user: User | null;
  code: string | null;
  dbId: string | null;
  budgetManwon: number | null;
  nickname: string | null;
  precision: PrecisionData;
  refresh: () => Promise<void>;
  setBudget: (v: number) => void;
  clearLocal: () => void;
};

const Ctx = createContext<MyCarbtiState | null>(null);

function readSessionCode(): string | null {
  if (typeof window === "undefined") return null;
  const c = sessionStorage.getItem(CODE_KEY);
  return c && CARBTI_TYPES[c] ? c : null;
}
function readSessionBudget(): number | null {
  if (typeof window === "undefined") return null;
  const b = sessionStorage.getItem(BUDGET_KEY);
  const n = b ? Number(b) : NaN;
  return Number.isFinite(n) ? n : null;
}
function readSessionDbId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(DIAGNOSIS_DB_ID_KEY);
}
function clearSessionKeys() {
  if (typeof window === "undefined") return;
  for (const k of SESSION_KEYS) {
    try { sessionStorage.removeItem(k); } catch { /* ignore */ }
  }
}

export function MyCarbtiProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<MyCarbtiStatus>("loading");
  const [source, setSource] = useState<MyCarbtiSource>("none");
  const [code, setCode] = useState<string | null>(null);
  const [dbId, setDbId] = useState<string | null>(null);
  const [budgetManwon, setBudgetState] = useState<number | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [precision, setPrecisionState] = useState<PrecisionData>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadForUser = useCallback(async (u: User | null) => {
    if (!u) {
      // anonymous fallback
      const c = readSessionCode();
      const b = readSessionBudget();
      const id = readSessionDbId();
      setCode(c);
      setBudgetState(b);
      setDbId(id);
      setNickname(null);
      setPrecisionState(readPrecision());
      setSource(c ? "session" : "none");
      setStatus("ready");
      return;
    }
    // logged in — DB wins
    const [{ data: prof }, diag] = await Promise.all([
      supabase
        .from("profiles")
        .select("kakao_nickname")
        .eq("id", u.id)
        .maybeSingle(),
      getMyLatestDiagnosis(u.id),
    ]);
    setNickname((prof?.kakao_nickname as string | undefined) ?? null);
    if (diag && CARBTI_TYPES[diag.code as string]) {
      const c = diag.code as string;
      const id = diag.id as string;
      const b = (diag.self_budget_manwon as number | null) ?? null;
      const situation = (diag.situation as PrecisionData | null) ?? {};
      const condition = (diag.condition as PrecisionData | null) ?? {};
      const merged: PrecisionData = { ...readPrecision(), ...situation, ...condition };
      writePrecision(merged);
      setPrecisionState(merged);
      setCode(c);
      setDbId(id);
      setBudgetState(b);
      setSource("db");
      try {
        sessionStorage.setItem(CODE_KEY, c);
        sessionStorage.setItem(DIAGNOSIS_DB_ID_KEY, id);
        if (b != null) sessionStorage.setItem(BUDGET_KEY, String(b));
      } catch { /* ignore */ }
    } else {
      // no DB record — fallback to session (may be from just-completed anonymous diagnose)
      const c = readSessionCode();
      setCode(c);
      setDbId(readSessionDbId());
      setBudgetState(readSessionBudget());
      setPrecisionState(readPrecision());
      setSource(c ? "session" : "none");
    }
    setStatus("ready");
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user ?? null;
    setUser(u);
    await loadForUser(u);
  }, [loadForUser]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const u = data.session?.user ?? null;
      setUser(u);
      await loadForUser(u);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearSessionKeys();
        setUser(null);
        setCode(null);
        setDbId(null);
        setBudgetState(null);
        setNickname(null);
        setPrecisionState({});
        setSource("none");
        setStatus("ready");
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        const u = session?.user ?? null;
        setUser(u);
        setStatus("loading");
        void loadForUser(u);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadForUser]);

  const setBudget = useCallback(
    (v: number) => {
      setBudgetState(v);
      try { sessionStorage.setItem(BUDGET_KEY, String(v)); } catch { /* ignore */ }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const id = dbId;
      if (id) {
        saveTimer.current = setTimeout(() => {
          void updateSelfBudget(id, v).catch((e) => {
            console.warn("[budget update failed]", e);
          });
        }, 500);
      }
    },
    [dbId],
  );

  const clearLocal = useCallback(() => {
    clearSessionKeys();
    setCode(null);
    setDbId(null);
    setBudgetState(null);
    setPrecisionState({});
    setSource("none");
  }, []);

  const value: MyCarbtiState = {
    status,
    source,
    user,
    code,
    dbId,
    budgetManwon,
    nickname,
    precision,
    refresh,
    setBudget,
    clearLocal,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMyCarbti(): MyCarbtiState {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useMyCarbti must be used inside <MyCarbtiProvider>");
  }
  return v;
}