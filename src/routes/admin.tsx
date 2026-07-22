import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import { CAR_DB } from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { Wordmark } from "@/components/common/Wordmark";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · 야차" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Role = "user" | "staff" | "admin" | null;
type GateState = "loading" | "denied" | "ok";

const LEAD_STATUSES = [
  { key: "all", label: "전체" },
  { key: "new", label: "신규" },
  { key: "consulting", label: "상담중" },
  { key: "underwriting", label: "심사중" },
  { key: "contracted", label: "계약" },
  { key: "closed", label: "종료" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  new: "신규",
  consulting: "상담중",
  underwriting: "심사중",
  contracted: "계약",
  closed: "종료",
};

const LENDERS = [
  "하나캐피탈",
  "KB캐피탈",
  "현대캐피탈",
  "메리츠캐피탈",
  "신한카드",
  "우리금융캐피탈",
  "BNK캐피탈",
  "롯데캐피탈",
  "오릭스",
  "농협캐피탈",
  "기타",
];

function carName(carId: string | null | undefined): string {
  if (!carId) return "차량 미지정";
  return CAR_DB.find((c) => c.id === carId)?.name ?? "차량 미지정";
}

function formatTime(ts: string | null | undefined): string {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SOURCE_LABEL: Record<string, string> = {
  result: "결과지",
  mydata_result: "마이데이터 결과",
  compare: "3방식 비교",
  consult: "상담",
  car_detail: "차량 상세",
};

// ---------- Access gate ----------

function AdminPage() {
  const { user, status: authStatus } = useMyCarbti();
  const [gate, setGate] = useState<GateState>("loading");
  const [tab, setTab] = useState<"leads" | "labels">("leads");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!user) {
      setGate("denied");
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const role = (data?.role as Role) ?? null;
      if (role === "staff" || role === "admin") {
        setGate("ok");
        // Access log — best effort
        void supabase
          .from("events")
          .insert({ name: "admin_open", user_id: user.id })
          .then(({ error }) => {
            if (error) console.warn("[admin_open]", error);
          });
      } else {
        setGate("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authStatus]);

  if (gate === "loading") {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--surface)" }}
      />
    );
  }

  if (gate === "denied") return <NotFound404 />;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}
    >
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3"
        style={{
          borderColor: "var(--hairline)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div className="flex items-center gap-2">
          <Wordmark tone="ink" size={16} />
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "var(--warm-gray)",
            }}
          >
            ADMIN
          </span>
        </div>
        <Link
          to="/"
          style={{ fontSize: "12px", color: "var(--warm-gray)" }}
        >
          앱으로 나가기
        </Link>
      </header>

      <nav
        className="flex border-b"
        style={{ borderColor: "var(--hairline)" }}
      >
        {(
          [
            { k: "leads", label: "리드" },
            { k: "labels", label: "심사 라벨" },
          ] as const
        ).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className="flex-1 py-3 text-sm"
              style={{
                fontWeight: active ? 600 : 400,
                color: active ? "var(--ink)" : "var(--warm-gray)",
                borderBottom: active
                  ? "2px solid var(--ink)"
                  : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <main className="mx-auto max-w-[880px] px-3 py-4">
        {tab === "leads" ? <LeadsInbox /> : <LabelsQueue />}
      </main>
    </div>
  );
}

function NotFound404() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------- Leads inbox ----------

type LeadRow = {
  id: string;
  created_at: string | null;
  source: string | null;
  interest_car_id: string | null;
  user_id: string | null;
  status: string | null;
  memo: string | null;
  diagnosis_id: string | null;
  budget_manwon: number | null;
  preferred_method: string | null;
  contact_pref: string | null;
  intent: string | null;
};

type CustomerContext = {
  loading: boolean;
  hasDiagnosis: boolean;
  code?: string | null;
  nickname?: string | null;
  situation?: Record<string, unknown> | null;
  condition?: Record<string, unknown> | null;
  approval?: {
    dream_car?: string | null;
    verdict?: string | null;
    capacity?: string | number | null;
  } | null;
};

const INTENT_FILTERS = [
  { key: "all", label: "전체" },
  { key: "apply", label: "확정 요청" },
  { key: "question", label: "질문" },
  { key: "save", label: "저장" },
] as const;

const INTENT_LABEL: Record<string, string> = {
  apply: "견적 확정 요청",
  question: "질문",
  save: "저장",
};

function LeadsInbox() {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [filter, setFilter] =
    useState<(typeof LEAD_STATUSES)[number]["key"]>("all");
  const [intentFilter, setIntentFilter] =
    useState<(typeof INTENT_FILTERS)[number]["key"]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, created_at, source, interest_car_id, user_id, status, memo, diagnosis_id, budget_manwon, preferred_method, contact_pref, intent",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.warn("[leads load]", error);
      setRows([]);
      return;
    }
    setRows((data ?? []) as LeadRow[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return null;
    let list = rows;
    if (filter !== "all") list = list.filter((r) => (r.status ?? "new") === filter);
    if (intentFilter !== "all")
      list = list.filter((r) => (r.intent ?? "apply") === intentFilter);
    // apply 리드는 최상단 고정
    return [...list].sort((a, b) => {
      const aA = (a.intent ?? "apply") === "apply" ? 0 : 1;
      const bA = (b.intent ?? "apply") === "apply" ? 0 : 1;
      if (aA !== bA) return aA - bA;
      return 0; // 이미 created_at desc 로 정렬됨
    });
  }, [rows, filter, intentFilter]);

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {INTENT_FILTERS.map((s) => {
          const active = intentFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setIntentFilter(s.key)}
              className="rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: active ? "var(--gold)" : "var(--hairline)",
                backgroundColor: active ? "var(--gold)" : "transparent",
                color: active ? "var(--midnight)" : "var(--ink)",
                fontWeight: active ? 700 : 400,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {LEAD_STATUSES.map((s) => {
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className="rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: active ? "var(--ink)" : "var(--hairline)",
                backgroundColor: active ? "var(--ink)" : "transparent",
                color: active ? "var(--surface)" : "var(--ink)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {filtered == null ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <EmptyState text="아직 리드가 없어요 — 상담 버튼을 누른 고객이 여기에 쌓입니다" />
      ) : (
        <ul className="space-y-2">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              expanded={expanded === lead.id}
              onToggle={() =>
                setExpanded((cur) => (cur === lead.id ? null : lead.id))
              }
              onChanged={(patch) =>
                setRows((cur) =>
                  cur
                    ? cur.map((r) => (r.id === lead.id ? { ...r, ...patch } : r))
                    : cur,
                )
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadCard({
  lead,
  expanded,
  onToggle,
  onChanged,
}: {
  lead: LeadRow;
  expanded: boolean;
  onToggle: () => void;
  onChanged: (patch: Partial<LeadRow>) => void;
}) {
  const [status, setStatus] = useState<string>(lead.status ?? "new");
  const [memo, setMemo] = useState<string>(lead.memo ?? "");
  const [saving, setSaving] = useState(false);
  const [ctx, setCtx] = useState<CustomerContext | null>(null);

  useEffect(() => {
    if (!expanded || ctx) return;
    let cancelled = false;
    void (async () => {
      setCtx({ loading: true, hasDiagnosis: false });
      if (!lead.user_id) {
        if (!cancelled) setCtx({ loading: false, hasDiagnosis: false });
        return;
      }
      const [profRes, diagRes, apprRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("kakao_nickname")
          .eq("id", lead.user_id)
          .maybeSingle(),
        supabase
          .from("diagnoses")
          .select("code, situation, condition, created_at")
          .eq("user_id", lead.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("approvals")
          .select("dream_car, verdict, capacity, created_at")
          .eq("user_id", lead.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      const diag = diagRes.data as
        | {
            code?: string | null;
            situation?: Record<string, unknown> | null;
            condition?: Record<string, unknown> | null;
          }
        | null;
      setCtx({
        loading: false,
        hasDiagnosis: !!diag?.code,
        code: diag?.code ?? null,
        nickname:
          (profRes.data?.kakao_nickname as string | undefined) ?? null,
        situation: diag?.situation ?? null,
        condition: diag?.condition ?? null,
        approval: (apprRes.data as CustomerContext["approval"]) ?? null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [expanded, ctx, lead.user_id]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update({ status, memo })
      .eq("id", lead.id);
    setSaving(false);
    if (error) {
      console.warn("[lead update]", error);
      toast("저장 실패 — 잠시 후 다시 시도해주세요");
      return;
    }
    onChanged({ status, memo });
    toast("저장했어요");
  };

  return (
    <li
      className="rounded-xl border"
      style={{
        borderColor: "var(--hairline)",
        backgroundColor: "var(--surface)",
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div
            className="flex items-center gap-2"
            style={{ fontSize: "11px", color: "var(--warm-gray)" }}
          >
            <span>{formatTime(lead.created_at)}</span>
            <span>·</span>
            <span>{SOURCE_LABEL[lead.source ?? ""] ?? lead.source ?? "-"}</span>
          </div>
          <div
            className="mt-0.5 truncate"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            {carName(lead.interest_car_id)}
          </div>
          {(lead.preferred_method || lead.budget_manwon != null) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {lead.preferred_method && (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{
                    fontSize: "10px",
                    border: "1px solid var(--hairline)",
                    color: "var(--ink)",
                  }}
                >
                  {lead.preferred_method}
                </span>
              )}
              {lead.budget_manwon != null && (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{
                    fontSize: "10px",
                    border: "1px solid var(--hairline)",
                    color: "var(--ink)",
                  }}
                >
                  {lead.budget_manwon}만원
                </span>
              )}
            </div>
          )}
        </div>
        <StatusBadge status={lead.status ?? "new"} />
      </button>

      {expanded && (
        <div
          className="border-t px-3 py-3"
          style={{ borderColor: "var(--hairline)" }}
        >
          <CustomerContextBlock ctx={ctx} />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label
              style={{ fontSize: "11px", color: "var(--warm-gray)" }}
            >
              상태
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--hairline)",
                backgroundColor: "var(--surface)",
                color: "var(--ink)",
              }}
            >
              {LEAD_STATUSES.filter((s) => s.key !== "all").map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="상담 메모"
            className="mt-2 w-full rounded-md border px-2 py-2 text-sm"
            style={{
              borderColor: "var(--hairline)",
              backgroundColor: "var(--surface)",
              color: "var(--ink)",
              minHeight: 72,
            }}
          />

          <div className="mt-2 flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-md px-3 py-1.5 text-xs"
              style={{
                backgroundColor: "var(--ink)",
                color: "var(--surface)",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const palette: Record<string, { bg: string; fg: string }> = {
    new: { bg: "#e8f0ff", fg: "#1f4bd8" },
    consulting: { bg: "#fff4dc", fg: "#8a5a00" },
    underwriting: { bg: "#efe6ff", fg: "#5b2ea6" },
    contracted: { bg: "#e2f6ec", fg: "#1a7a45" },
    closed: { bg: "#eeeeee", fg: "#555555" },
  };
  const p = palette[status] ?? palette.new;
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5"
      style={{
        backgroundColor: p.bg,
        color: p.fg,
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

function CustomerContextBlock({ ctx }: { ctx: CustomerContext | null }) {
  if (!ctx || ctx.loading) {
    return (
      <div
        className="rounded-md px-2 py-2"
        style={{
          backgroundColor: "var(--hairline)",
          fontSize: "11px",
          color: "var(--warm-gray)",
        }}
      >
        고객 정보 불러오는 중…
      </div>
    );
  }
  if (!ctx.hasDiagnosis) {
    return (
      <div style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
        미진단
      </div>
    );
  }
  const typeName = ctx.code ? CARBTI_TYPES[ctx.code]?.name : null;
  const situation = (ctx.situation ?? {}) as Record<string, unknown>;
  const condition = (ctx.condition ?? {}) as Record<string, unknown>;

  const chips: string[] = [];
  if (situation.loan_plan === "yes") chips.push("대출 계획 O");
  else if (situation.loan_plan === "no") chips.push("대출 계획 X");
  if (situation.biz_type === "sole") chips.push("개인사업자");
  else if (situation.biz_type === "corp") chips.push("법인");
  if (situation.ins_penalty === "yes") chips.push("보험 할증 O");
  const mb = condition.monthly_budget;
  if (typeof mb === "number") chips.push(`월 예산 ${mb}만원`);

  return (
    <div className="space-y-2">
      <div style={{ fontSize: "13px", fontWeight: 500 }}>
        {ctx.code ?? "-"}{" "}
        <span style={{ color: "var(--warm-gray)", fontWeight: 400 }}>
          {typeName ? `· ${typeName}` : ""}
          {ctx.nickname ? ` · ${ctx.nickname}` : ""}
        </span>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: "var(--hairline)",
                color: "var(--ink)",
                fontSize: "10.5px",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
      {ctx.approval && (ctx.approval.verdict || ctx.approval.dream_car) && (
        <div
          className="rounded-md border px-2 py-1.5"
          style={{
            borderColor: "var(--hairline)",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "var(--warm-gray)" }}>승인 확인 · </span>
          {ctx.approval.dream_car && (
            <span>{ctx.approval.dream_car} </span>
          )}
          {ctx.approval.verdict && (
            <span style={{ fontWeight: 500 }}>· {ctx.approval.verdict}</span>
          )}
          {ctx.approval.capacity != null && (
            <span> · 여력 {String(ctx.approval.capacity)}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Labels queue ----------

type PredictionRow = {
  id: string;
  created_at: string | null;
  car_id: string | null;
  actual: string | null;
  labeled_at: string | null;
  result: string | null;
  lender: string | null;
  actual_monthly_manwon: number | null;
};

function LabelsQueue() {
  const [rows, setRows] = useState<PredictionRow[] | null>(null);
  const [weekStats, setWeekStats] = useState<{ done: number; total: number } | null>(
    null,
  );

  const load = useCallback(async () => {
    setRows(null);
    const { data, error } = await supabase
      .from("predictions")
      .select(
        "id, created_at, car_id, actual, labeled_at, result, lender, actual_monthly_manwon",
      )
      .is("actual", null)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.warn("[predictions load]", error);
      setRows([]);
    } else {
      setRows((data ?? []) as PredictionRow[]);
    }
    // Weekly labeling stats
    const monday = getWeekStart();
    const iso = monday.toISOString();
    const [total, done] = await Promise.all([
      supabase
        .from("predictions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", iso),
      supabase
        .from("predictions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", iso)
        .not("actual", "is", null),
    ]);
    setWeekStats({
      done: done.count ?? 0,
      total: total.count ?? 0,
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      {weekStats && (
        <div
          className="mb-3 rounded-md px-3 py-2"
          style={{
            backgroundColor: "var(--hairline)",
            fontSize: "12px",
            color: "var(--ink)",
          }}
        >
          이번 주 {weekStats.done}/{weekStats.total}건 라벨 완료
        </div>
      )}

      {rows == null ? (
        <SkeletonList />
      ) : rows.length === 0 ? (
        <EmptyState text="라벨할 판정이 없어요 — 승인 확인이 열리면 여기에 쌓입니다" />
      ) : (
        <ul className="space-y-2">
          {rows.map((p) => (
            <PredictionRowItem
              key={p.id}
              row={p}
              onLabeled={() => {
                setRows((cur) => (cur ? cur.filter((r) => r.id !== p.id) : cur));
                setWeekStats((cur) =>
                  cur ? { ...cur, done: cur.done + 1 } : cur,
                );
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function PredictionRowItem({
  row,
  onLabeled,
}: {
  row: PredictionRow;
  onLabeled: () => void;
}) {
  const [actual, setActual] = useState<string | null>(null);
  const [lender, setLender] = useState<string>("");
  const [monthly, setMonthly] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const canSave = actual !== null && lender && monthly.trim().length > 0;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const { error } = await supabase
      .from("predictions")
      .update({
        actual,
        lender,
        actual_monthly_manwon: Number(monthly),
        labeled_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    setSaving(false);
    if (error) {
      console.warn("[label save]", error);
      toast("저장 실패");
      return;
    }
    toast("라벨 저장했어요");
    onLabeled();
  };

  return (
    <li
      className="rounded-xl border p-3"
      style={{
        borderColor: "var(--hairline)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2"
        style={{ fontSize: "12px", color: "var(--warm-gray)" }}
      >
        <span>{formatTime(row.created_at)}</span>
        <span>예측: {row.result ?? "-"}</span>
      </div>
      <div
        className="mt-0.5"
        style={{ fontSize: "14px", fontWeight: 500 }}
      >
        {carName(row.car_id)}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(
          [
            { k: "approved", label: "승인" },
            { k: "conditional", label: "조건부 승인" },
            { k: "rejected", label: "거절" },
          ] as const
        ).map((b) => {
          const active = actual === b.k;
          return (
            <button
              key={b.k}
              onClick={() => setActual(b.k)}
              className="rounded-md border px-3 py-1 text-xs"
              style={{
                borderColor: active ? "var(--ink)" : "var(--hairline)",
                backgroundColor: active ? "var(--ink)" : "transparent",
                color: active ? "var(--surface)" : "var(--ink)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          value={lender}
          onChange={(e) => setLender(e.target.value)}
          className="rounded-md border px-2 py-1.5 text-xs"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--surface)",
            color: "var(--ink)",
          }}
        >
          <option value="">승인 금융사 선택</option>
          {LENDERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input
          type="number"
          inputMode="numeric"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
          placeholder="실제 월납입(만원)"
          className="rounded-md border px-2 py-1.5 text-xs"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--surface)",
            color: "var(--ink)",
          }}
        />
      </div>

      <div className="mt-2 flex justify-end">
        <button
          onClick={save}
          disabled={!canSave || saving}
          className="rounded-md px-3 py-1.5 text-xs"
          style={{
            backgroundColor: "var(--ink)",
            color: "var(--surface)",
            opacity: !canSave || saving ? 0.5 : 1,
          }}
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </li>
  );
}

// ---------- shared bits ----------

function SkeletonList() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="h-16 rounded-xl border"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--hairline)",
            opacity: 0.4,
          }}
        />
      ))}
    </ul>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="rounded-xl border px-4 py-10 text-center"
      style={{
        borderColor: "var(--hairline)",
        color: "var(--warm-gray)",
        fontSize: "13px",
      }}
    >
      {text}
    </div>
  );
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
