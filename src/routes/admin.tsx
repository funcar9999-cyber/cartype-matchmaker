import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

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
  const [role, setRole] = useState<Role>(null);
  const [tab, setTab] = useState<"leads" | "labels" | "marketing" | "system">(
    "leads",
  );

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
      const r = (data?.role as Role) ?? null;
      setRole(r);
      if (r === "staff" || r === "admin") {
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
            { k: "leads" as const, label: "리드" },
            { k: "labels" as const, label: "심사 라벨" },
            { k: "marketing" as const, label: "마케팅" },
            ...(role === "admin"
              ? [{ k: "system" as const, label: "시스템" }]
              : []),
          ]
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
        {tab === "leads" && <LeadsInbox />}
        {tab === "labels" && <LabelsQueue />}
        {tab === "marketing" && (
          <MarketingPanel onGoLabels={() => setTab("labels")} />
        )}
        {tab === "system" && role === "admin" && <SystemPanel />}
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
            {(lead.intent ?? "apply") === "apply" && (
              <span
                className="ml-1 rounded-full px-1.5 py-0.5"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  color: "var(--gold)",
                  border: "1px solid var(--gold)",
                  letterSpacing: "0.03em",
                }}
              >
                견적 확정 요청
              </span>
            )}
            {lead.intent && lead.intent !== "apply" && (
              <span
                className="ml-1 rounded-full px-1.5 py-0.5"
                style={{
                  fontSize: "9.5px",
                  color: "var(--warm-gray)",
                  border: "1px solid var(--hairline)",
                }}
              >
                {INTENT_LABEL[lead.intent] ?? lead.intent}
              </span>
            )}
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

// ================= Marketing Panel =================

type MarketingStats = {
  funnel?: {
    visits?: number;
    entry_a?: number;
    entry_b?: number;
    complete_a?: number;
    complete_b?: number;
    leads?: number;
    contracted?: number;
  };
  report_views?: number;
  ladder?: {
    cta?: {
      cta_apply?: number;
      cta_question?: number;
      cta_save?: number;
    };
    lead_intent?: Record<string, number>;
  };
  amp?: Array<{ screen: string; lock_type: string; count: number }>;
  door_b?: {
    submits?: number;
    verdicts?: Record<string, number>;
  };
  daily_events?: Array<{ date: string; name: string; count: number }>;
  popular?: {
    types?: Array<{ code: string; count: number }>;
    dream_top?: Array<{ car_id: string; count: number }>;
    interest_top?: Array<{ car_id: string; count: number }>;
  };
  label_queue?: {
    unlabeled?: number;
    week_labeled?: number;
  };
};

const PERIOD_OPTIONS = [
  { k: 7, label: "7일" },
  { k: 14, label: "14일" },
  { k: 30, label: "30일" },
] as const;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function MarketingPanel({ onGoLabels }: { onGoLabels: () => void }) {
  const [days, setDays] = useState<7 | 14 | 30>(14);
  const [stats, setStats] = useState<MarketingStats | null | "err">(null);

  useEffect(() => {
    let cancelled = false;
    setStats(null);
    void (async () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - (days - 1));
      const { data, error } = await supabase.rpc("admin_marketing_stats", {
        p_from: toISODate(from),
        p_to: toISODate(to),
      });
      if (cancelled) return;
      if (error || data == null) {
        console.warn("[marketing_stats]", error);
        setStats("err");
        return;
      }
      setStats(data as MarketingStats);
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (stats === "err") return <NotFound404 />;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {PERIOD_OPTIONS.map((o) => {
          const active = days === o.k;
          return (
            <button
              key={o.k}
              onClick={() => setDays(o.k)}
              className="rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: active ? "var(--ink)" : "var(--hairline)",
                backgroundColor: active ? "var(--ink)" : "transparent",
                color: active ? "var(--surface)" : "var(--ink)",
                fontWeight: active ? 600 : 400,
              }}
            >
              최근 {o.label}
            </button>
          );
        })}
      </div>

      {stats == null ? (
        <SkeletonList />
      ) : (
        <>
          <FunnelCard s={stats} />
          <LadderCard s={stats} />
          <AmpCard s={stats} />
          <DoorBCard s={stats} />
          <DailyChartCard s={stats} />
          <PopularCard s={stats} />
          <LabelWidgetCard s={stats} onGoLabels={onGoLabels} />
        </>
      )}
    </div>
  );
}

function PanelCard({
  title,
  children,
  caption,
}: {
  title: string;
  children: React.ReactNode;
  caption?: string;
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: "var(--hairline)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div
        className="mb-2 flex items-center justify-between"
        style={{ fontSize: "12px", color: "var(--warm-gray)" }}
      >
        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{title}</span>
        {caption && <span>{caption}</span>}
      </div>
      {children}
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  right,
}: {
  label: string;
  value: number | null | undefined;
  max: number;
  right?: string;
}) {
  const v = value ?? 0;
  const pct = max > 0 ? Math.max(2, Math.round((v / max) * 100)) : 0;
  return (
    <div>
      <div
        className="mb-1 flex items-center justify-between"
        style={{ fontSize: "12px" }}
      >
        <span style={{ color: "var(--ink)" }}>{label}</span>
        <span style={{ color: "var(--warm-gray)" }}>
          {v.toLocaleString()}
          {right ? ` · ${right}` : ""}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--hairline)" }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: "var(--ink)",
          }}
        />
      </div>
    </div>
  );
}

function FunnelCard({ s }: { s: MarketingStats }) {
  const visits = s?.funnel?.visits ?? 0;
  const entryA = s?.funnel?.entry_a ?? 0;
  const entryB = s?.funnel?.entry_b ?? 0;
  const compA = s?.funnel?.complete_a ?? 0;
  const compB = s?.funnel?.complete_b ?? 0;
  const leads = s?.funnel?.leads ?? 0;
  const contracted = s?.funnel?.contracted ?? 0;
  const max = Math.max(visits, entryA + entryB, compA + compB, leads, contracted, 1);
  return (
    <PanelCard title="퍼널">
      <div className="space-y-2.5">
          {visits === 0 ? (
          <div style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
            방문 계측 대기(page_view 배선 후)
          </div>
        ) : (
          <Bar label="방문" value={visits} max={max} />
        )}
        <div>
          <div
            className="mb-1 flex items-center justify-between"
            style={{ fontSize: "12px", color: "var(--ink)" }}
          >
            <span>입구 선택</span>
            <span style={{ color: "var(--warm-gray)" }}>
              문A {(entryA ?? 0).toLocaleString()} · 문B {(entryB ?? 0).toLocaleString()}
            </span>
          </div>
          <div
            className="flex h-1.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--hairline)" }}
          >
            <div
              style={{
                width: `${entryA + entryB > 0 ? (entryA / (entryA + entryB)) * 100 : 0}%`,
                backgroundColor: "var(--ink)",
              }}
            />
            <div
              style={{
                width: `${entryA + entryB > 0 ? (entryB / (entryA + entryB)) * 100 : 0}%`,
                backgroundColor: "var(--gold, #C7A15A)",
              }}
            />
          </div>
        </div>
        <Bar
          label="완료"
          value={compA + compB}
          max={max}
          right={`진단 ${compA} · 승인확인 ${compB}`}
        />
        <Bar label="리드" value={leads} max={max} />
        <Bar label="계약" value={contracted} max={max} />
      </div>
    </PanelCard>
  );
}

function LadderCard({ s }: { s: MarketingStats }) {
  const cta = s?.ladder?.cta ?? {};
  const a = cta?.cta_apply ?? 0;
  const q = cta?.cta_question ?? 0;
  const sv = cta?.cta_save ?? 0;
  const total = a + q + sv;
  const max = Math.max(a, q, sv, 1);
  const hotShare = total > 0 ? Math.round((a / total) * 100) : 0;
  const intent = s?.ladder?.lead_intent ?? {};
  return (
    <PanelCard
      title="클로징 사다리"
      caption={total > 0 ? `HOT 비중 ${hotShare}%` : undefined}
    >
      <div className="space-y-2.5">
        <Bar label="확정 요청 (HOT)" value={a} max={max} />
        <Bar label="질문 (WARM)" value={q} max={max} />
        <Bar label="저장 (KEEP)" value={sv} max={max} />
        {(s?.report_views ?? 0) === 0 && (
          <div style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
            HOT 클릭률(결과지 노출 대비)은 report_view 배선 후 표시
          </div>
        )}
        {Object.keys(intent).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {Object.entries(intent).map(([k, v]) => (
              <span
                key={k}
                className="rounded-full px-2 py-0.5"
                style={{
                  fontSize: "10.5px",
                  border: "1px solid var(--hairline)",
                  color: "var(--ink)",
                }}
              >
                {INTENT_LABEL[k] ?? k} {((v as number) ?? 0).toLocaleString()}
              </span>
            ))}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

function AmpCard({ s }: { s: MarketingStats }) {
  const amp = s?.amp ?? [];
  if (amp.length === 0) {
    return (
      <PanelCard title="증폭기 (amp)">
        <div style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
          amp_click 배선 대기
        </div>
      </PanelCard>
    );
  }
  const screens = Array.from(new Set(amp.map((r) => r.screen)));
  const lockTypes = Array.from(new Set(amp.map((r) => r.lock_type)));
  const cell = (sc: string, lt: string) =>
    amp.find((r) => r.screen === sc && r.lock_type === lt)?.count ?? 0;
  return (
    <PanelCard title="증폭기 (amp)">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: "12px" }}>
          <thead>
            <tr style={{ color: "var(--warm-gray)" }}>
              <th className="px-2 py-1 text-left" style={{ fontWeight: 500 }}>
                screen \ lock_type
              </th>
              {lockTypes.map((lt) => (
                <th
                  key={lt}
                  className="px-2 py-1 text-right"
                  style={{ fontWeight: 500 }}
                >
                  {lt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {screens.map((sc) => (
              <tr key={sc} style={{ borderTop: "1px solid var(--hairline)" }}>
                <td className="px-2 py-1" style={{ color: "var(--ink)" }}>
                  {sc}
                </td>
                {lockTypes.map((lt) => (
                  <td key={lt} className="px-2 py-1 text-right">
                    {(cell(sc, lt) ?? 0).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

function DoorBCard({ s }: { s: MarketingStats }) {
  const submits = s?.door_b?.submits ?? 0;
  const verdicts = s?.door_b?.verdicts ?? {};
  const max = Math.max(...Object.values(verdicts), 1);
  const order: Array<{ k: string; label: string }> = [
    { k: "high", label: "높음" },
    { k: "mid", label: "조정 필요" },
    { k: "consult", label: "상담 필요" },
  ];
  return (
    <PanelCard title="문B (승인 확인)" caption={`제출 ${(submits ?? 0).toLocaleString()}건`}>
      <div className="space-y-2">
        {order.map((v) => (
          <Bar key={v.k} label={v.label} value={verdicts?.[v.k] ?? 0} max={max} />
        ))}
      </div>
    </PanelCard>
  );
}

function DailyChartCard({ s }: { s: MarketingStats }) {
  const daily = s?.daily_events ?? [];
  if (daily.length === 0) {
    return (
      <PanelCard title="일별 추이">
        <div style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
          기간 내 이벤트가 없어요
        </div>
      </PanelCard>
    );
  }
  const dates = Array.from(new Set(daily.map((d) => d.date))).sort();
  const names = Array.from(new Set(daily.map((d) => d.name)));
  const rows = dates.map((date) => {
    const row: Record<string, string | number> = { date };
    for (const n of names) {
      row[n] = daily.find((d) => d.date === date && d.name === n)?.count ?? 0;
    }
    return row;
  });
  const colors = ["#0A0F1C", "#C7A15A", "#3F8B87", "#B36A3E", "#7A7A7A"];
  return (
    <PanelCard title="일별 추이">
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--hairline)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {names.map((n, i) => (
              <Line
                key={n}
                type="monotone"
                dataKey={n}
                stroke={colors[i % colors.length]}
                dot={false}
                strokeWidth={1.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
}

function PopularCard({ s }: { s: MarketingStats }) {
  const types = s?.popular?.types ?? [];
  const dream = s?.popular?.dream_top ?? [];
  const interest = s?.popular?.interest_top ?? [];
  const maxT = Math.max(...types.map((t: any) => t?.n ?? t?.count ?? 0), 1);
  return (
    <PanelCard title="인기 데이터">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div
            className="mb-1"
            style={{ fontSize: "11px", color: "var(--warm-gray)" }}
          >
            유형 분포
          </div>
          <div className="space-y-1.5">
            {types.length === 0 ? (
              <div style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
                데이터 없음
              </div>
            ) : (
              types.map((t: any) => (
                <Bar key={t.code} label={t.code} value={t?.n ?? t?.count ?? 0} max={maxT} />
              ))
            )}
          </div>
        </div>
        <div>
          <div
            className="mb-1"
            style={{ fontSize: "11px", color: "var(--warm-gray)" }}
          >
            드림카 TOP10
          </div>
          <ol className="space-y-1" style={{ fontSize: "12px" }}>
            {dream.length === 0 ? (
              <li style={{ color: "var(--warm-gray)" }}>데이터 없음</li>
            ) : (
              dream.slice(0, 10).map((r: any, i) => (
                <li key={r.car_id} className="flex justify-between">
                  <span>
                    {i + 1}. {r.car_id}
                  </span>
                  <span style={{ color: "var(--warm-gray)" }}>{(r?.n ?? r?.count ?? 0).toLocaleString()}</span>
                </li>
              ))
            )}
          </ol>
        </div>
        <div>
          <div
            className="mb-1"
            style={{ fontSize: "11px", color: "var(--warm-gray)" }}
          >
            관심차 TOP10
          </div>
          <ol className="space-y-1" style={{ fontSize: "12px" }}>
            {interest.length === 0 ? (
              <li style={{ color: "var(--warm-gray)" }}>데이터 없음</li>
            ) : (
              interest.slice(0, 10).map((r: any, i) => (
                <li key={r.car_id} className="flex justify-between">
                  <span>
                    {i + 1}. {r.car_id}
                  </span>
                  <span style={{ color: "var(--warm-gray)" }}>{(r?.n ?? r?.count ?? 0).toLocaleString()}</span>
                </li>
              ))
            )}
          </ol>
        </div>
      </div>
    </PanelCard>
  );
}

function LabelWidgetCard({
  s,
  onGoLabels,
}: {
  s: MarketingStats;
  onGoLabels: () => void;
}) {
  const un = s?.label_queue?.unlabeled ?? 0;
  const wk = s?.label_queue?.week_labeled ?? 0;
  return (
    <button
      type="button"
      onClick={onGoLabels}
      className="w-full rounded-xl border p-3 text-left"
      style={{
        borderColor: "var(--hairline)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ fontSize: "13px", color: "var(--ink)" }}
      >
        <span style={{ fontWeight: 600 }}>라벨 대기 {(un ?? 0).toLocaleString()}건</span>
        <span style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
          이번 주 {(wk ?? 0).toLocaleString()}건 라벨 완료 →
        </span>
      </div>
    </button>
  );
}

// ================= System Panel =================

type EngineParam = {
  key: string;
  value: number;
  note: string | null;
  updated_at: string | null;
};

type ParamHistory = {
  key: string;
  old_value: number | null;
  new_value: number | null;
  changed_at: string | null;
};

function SystemPanel() {
  return (
    <div className="space-y-3">
      <EngineParamsCard />
      <AccuracyMatrixCard />
      <CarsAdminCard />
      <QuoteRatesCard />
    </div>
  );
}

function EngineParamsCard() {
  const [rows, setRows] = useState<EngineParam[] | null>(null);
  const [history, setHistory] = useState<ParamHistory[] | null>(null);
  const [openHistory, setOpenHistory] = useState(false);

  const load = useCallback(async () => {
    setRows(null);
    const { data, error } = await supabase
      .from("engine_params")
      .select("key, value, note, updated_at")
      .order("key");
    if (error) console.warn("[engine_params]", error);
    setRows(((data as EngineParam[] | null) ?? []) as EngineParam[]);
    const { data: h } = await supabase
      .from("params_history")
      .select("key, old_value, new_value, changed_at")
      .order("changed_at", { ascending: false })
      .limit(20);
    setHistory((h as ParamHistory[] | null) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PanelCard title="엔진 파라미터">
      {rows == null ? (
        <SkeletonList />
      ) : rows.length === 0 ? (
        <div style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
          파라미터가 없어요
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "12px" }}>
            <thead style={{ color: "var(--warm-gray)" }}>
              <tr>
                <th className="px-2 py-1 text-left" style={{ fontWeight: 500 }}>
                  key
                </th>
                <th className="px-2 py-1 text-left" style={{ fontWeight: 500 }}>
                  value
                </th>
                <th className="px-2 py-1 text-left" style={{ fontWeight: 500 }}>
                  note
                </th>
                <th className="px-2 py-1 text-left" style={{ fontWeight: 500 }}>
                  updated
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <EngineParamRow key={r.key} row={r} onSaved={load} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3">
        <button
          onClick={() => setOpenHistory((v) => !v)}
          className="text-xs"
          style={{ color: "var(--warm-gray)" }}
        >
          변경 이력 (최근 20건) {openHistory ? "▲" : "▼"}
        </button>
        {openHistory && history && (
          <ul
            className="mt-2 space-y-1"
            style={{ fontSize: "11px", color: "var(--ink)" }}
          >
            {history.length === 0 && (
              <li style={{ color: "var(--warm-gray)" }}>이력 없음</li>
            )}
            {history.map((h, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-2"
                style={{ borderTop: "1px solid var(--hairline)", padding: "4px 0" }}
              >
                <span style={{ fontWeight: 500 }}>{h.key}</span>
                <span style={{ color: "var(--warm-gray)" }}>
                  {String(h.old_value ?? "-")} → {String(h.new_value ?? "-")}
                </span>
                <span style={{ marginLeft: "auto", color: "var(--warm-gray)" }}>
                  {formatTime(h.changed_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PanelCard>
  );
}

function EngineParamRow({
  row,
  onSaved,
}: {
  row: EngineParam;
  onSaved: () => void;
}) {
  const [value, setValue] = useState<string>(String(row.value ?? ""));
  const [note, setNote] = useState<string>(row.note ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = value !== String(row.value ?? "") || note !== (row.note ?? "");

  const save = async () => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      toast("숫자만 저장할 수 있어요");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("admin_update_param", {
      p_key: row.key,
      p_value: n,
      p_note: note,
    });
    setSaving(false);
    if (error) {
      toast(`저장 실패 — ${error.message}`);
      return;
    }
    toast("저장했어요");
    onSaved();
  };

  return (
    <tr style={{ borderTop: "1px solid var(--hairline)" }}>
      <td className="px-2 py-1" style={{ fontWeight: 500 }}>
        {row.key}
      </td>
      <td className="px-2 py-1">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          className="w-24 rounded-md border px-2 py-1"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--surface)",
            color: "var(--ink)",
          }}
        />
      </td>
      <td className="px-2 py-1">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-md border px-2 py-1"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--surface)",
            color: "var(--ink)",
          }}
        />
      </td>
      <td
        className="px-2 py-1"
        style={{ color: "var(--warm-gray)", whiteSpace: "nowrap" }}
      >
        {formatTime(row.updated_at)}
      </td>
      <td className="px-2 py-1 text-right">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="rounded-md px-2 py-1 text-xs"
          style={{
            backgroundColor: "var(--ink)",
            color: "var(--surface)",
            opacity: !dirty || saving ? 0.4 : 1,
          }}
        >
          {saving ? "…" : "저장"}
        </button>
      </td>
    </tr>
  );
}

type AccuracyResp = {
  matrix?: Array<{ predicted: string; actual: string; n: number }>;
  labeled?: number;
  total?: number;
};

function AccuracyMatrixCard() {
  const [data, setData] = useState<AccuracyResp | null>(null);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.rpc("admin_accuracy_matrix");
      if (error) console.warn("[accuracy]", error);
      setData((data as AccuracyResp) ?? { matrix: [], labeled: 0, total: 0 });
    })();
  }, []);

  if (data == null) {
    return (
      <PanelCard title="정확도 리포트">
        <SkeletonList />
      </PanelCard>
    );
  }

  const rows = data.matrix ?? [];
  const predicted = Array.from(new Set(rows.map((r) => r.predicted)));
  const actualSet = Array.from(new Set(rows.map((r) => r.actual)));
  // unlabeled column at end, greyed
  const actual = [
    ...actualSet.filter((a) => a !== "unlabeled"),
    ...(actualSet.includes("unlabeled") ? ["unlabeled"] : []),
  ];
  const cell = (p: string, a: string) =>
    rows.find((r) => r.predicted === p && r.actual === a)?.n ?? 0;

  return (
    <PanelCard
      title="정확도 리포트"
      caption={`라벨 ${data.labeled ?? 0}/${data.total ?? 0}건`}
    >
      {rows.length === 0 ? (
        <div style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
          데이터 없음
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "12px" }}>
            <thead style={{ color: "var(--warm-gray)" }}>
              <tr>
                <th className="px-2 py-1 text-left" style={{ fontWeight: 500 }}>
                  predicted \ actual
                </th>
                {actual.map((a) => (
                  <th
                    key={a}
                    className="px-2 py-1 text-right"
                    style={{
                      fontWeight: 500,
                      color: a === "unlabeled" ? "var(--warm-gray)" : undefined,
                    }}
                  >
                    {a === "unlabeled" ? "미라벨" : a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predicted.map((p) => (
                <tr key={p} style={{ borderTop: "1px solid var(--hairline)" }}>
                  <td className="px-2 py-1" style={{ color: "var(--ink)" }}>
                    {p}
                  </td>
                  {actual.map((a) => (
                    <td
                      key={a}
                      className="px-2 py-1 text-right"
                      style={{
                        color:
                          a === "unlabeled" ? "var(--warm-gray)" : "var(--ink)",
                      }}
                    >
                      {cell(p, a).toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}

type CarRow = {
  id: string;
  name?: string | null;
  brand?: string | null;
  price_min: number | null;
  price_max: number | null;
  on_sale: boolean | null;
  is_import: boolean | null;
  commercial: boolean | null;
};

const CAR_PAGE_SIZE = 30;

function CarsAdminCard() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<CarRow[] | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setRows(null);
    let query = supabase
      .from("cars")
      .select(
        "id, name, brand, price_min, price_max, on_sale, is_import, commercial",
        { count: "exact" },
      )
      .order("id")
      .range(page * CAR_PAGE_SIZE, page * CAR_PAGE_SIZE + CAR_PAGE_SIZE - 1);
    if (q.trim()) {
      const s = q.trim();
      query = query.or(`id.ilike.%${s}%,name.ilike.%${s}%,brand.ilike.%${s}%`);
    }
    const { data, error, count } = await query;
    if (error) console.warn("[cars]", error);
    setRows((data as CarRow[] | null) ?? []);
    setTotal(count ?? 0);
  }, [q, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxPage = Math.max(0, Math.ceil(total / CAR_PAGE_SIZE) - 1);

  return (
    <PanelCard title="차량 DB" caption={`${total.toLocaleString()}대`}>
      <div className="mb-2 flex gap-2">
        <input
          value={q}
          onChange={(e) => {
            setPage(0);
            setQ(e.target.value);
          }}
          placeholder="id / name / brand 검색"
          className="flex-1 rounded-md border px-2 py-1.5 text-xs"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--surface)",
            color: "var(--ink)",
          }}
        />
      </div>
      {rows == null ? (
        <SkeletonList />
      ) : rows.length === 0 ? (
        <div style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
          결과 없음
        </div>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <CarAdminRow key={r.id} row={r} onSaved={load} />
          ))}
        </ul>
      )}
      <div
        className="mt-2 flex items-center justify-between"
        style={{ fontSize: "11px", color: "var(--warm-gray)" }}
      >
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{ opacity: page === 0 ? 0.4 : 1 }}
        >
          ← 이전
        </button>
        <span>
          {page + 1} / {maxPage + 1}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          disabled={page >= maxPage}
          style={{ opacity: page >= maxPage ? 0.4 : 1 }}
        >
          다음 →
        </button>
      </div>
    </PanelCard>
  );
}

function CarAdminRow({ row, onSaved }: { row: CarRow; onSaved: () => void }) {
  const [pMin, setPMin] = useState<string>(
    row.price_min == null ? "" : String(row.price_min),
  );
  const [pMax, setPMax] = useState<string>(
    row.price_max == null ? "" : String(row.price_max),
  );
  const [onSale, setOnSale] = useState<boolean>(!!row.on_sale);
  const [isImport, setIsImport] = useState<boolean>(!!row.is_import);
  const [commercial, setCommercial] = useState<boolean>(!!row.commercial);
  const [saving, setSaving] = useState(false);

  const dirty =
    pMin !== (row.price_min == null ? "" : String(row.price_min)) ||
    pMax !== (row.price_max == null ? "" : String(row.price_max)) ||
    onSale !== !!row.on_sale ||
    isImport !== !!row.is_import ||
    commercial !== !!row.commercial;

  const save = async () => {
    const patch: Record<string, unknown> = {};
    const nMin = pMin === "" ? null : Number(pMin);
    const nMax = pMax === "" ? null : Number(pMax);
    if (nMin !== row.price_min) patch.price_min = nMin;
    if (nMax !== row.price_max) patch.price_max = nMax;
    if (onSale !== !!row.on_sale) patch.on_sale = onSale;
    if (isImport !== !!row.is_import) patch.is_import = isImport;
    if (commercial !== !!row.commercial) patch.commercial = commercial;
    if (Object.keys(patch).length === 0) return;
    setSaving(true);
    const { error } = await supabase.rpc("admin_update_car", {
      p_id: row.id,
      p_patch: patch,
    });
    setSaving(false);
    if (error) {
      toast(`저장 실패 — ${error.message}`);
      return;
    }
    toast("저장했어요");
    onSaved();
  };

  return (
    <li
      className="rounded-md border p-2"
      style={{ borderColor: "var(--hairline)", fontSize: "11.5px" }}
    >
      <div
        className="mb-1 flex items-center justify-between"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ fontWeight: 500 }}>
          {row.brand ? `${row.brand} ` : ""}
          {row.name ?? row.id}
        </span>
        <span style={{ color: "var(--warm-gray)", fontSize: "10.5px" }}>
          {row.id}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <label style={{ color: "var(--warm-gray)" }}>min</label>
        <input
          value={pMin}
          onChange={(e) => setPMin(e.target.value)}
          inputMode="numeric"
          className="w-20 rounded-md border px-1.5 py-0.5"
          style={{ borderColor: "var(--hairline)" }}
        />
        <label style={{ color: "var(--warm-gray)" }}>max</label>
        <input
          value={pMax}
          onChange={(e) => setPMax(e.target.value)}
          inputMode="numeric"
          className="w-20 rounded-md border px-1.5 py-0.5"
          style={{ borderColor: "var(--hairline)" }}
        />
        <label className="ml-1 flex items-center gap-1">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
          />
          on_sale
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={isImport}
            onChange={(e) => setIsImport(e.target.checked)}
          />
          import
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={commercial}
            onChange={(e) => setCommercial(e.target.checked)}
          />
          commercial
        </label>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="ml-auto rounded-md px-2 py-0.5 text-xs"
          style={{
            backgroundColor: "var(--ink)",
            color: "var(--surface)",
            opacity: !dirty || saving ? 0.4 : 1,
          }}
        >
          {saving ? "…" : "저장"}
        </button>
      </div>
    </li>
  );
}

function QuoteRatesCard() {
  const [counts, setCounts] = useState<{
    rates: number | null;
    residuals: number | null;
    rv: number | null;
  }>({ rates: null, residuals: null, rv: null });

  useEffect(() => {
    void (async () => {
      const [a, b, c] = await Promise.all([
        supabase.from("quote_rates").select("*", { count: "exact", head: true }),
        supabase
          .from("quote_residuals")
          .select("*", { count: "exact", head: true }),
        supabase.from("rv_defaults").select("*", { count: "exact", head: true }),
      ]);
      setCounts({
        rates: a.count ?? 0,
        residuals: b.count ?? 0,
        rv: c.count ?? 0,
      });
    })();
  }, []);

  const items = [
    { label: "quote_rates", value: counts.rates },
    { label: "quote_residuals", value: counts.residuals },
    { label: "rv_defaults", value: counts.rv },
  ];

  return (
    <PanelCard title="견적 요율 (읽기 전용)">
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-md border p-2 text-center"
            style={{ borderColor: "var(--hairline)" }}
          >
            <div
              style={{ fontSize: "10.5px", color: "var(--warm-gray)" }}
            >
              {it.label}
            </div>
            <div
              style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)" }}
            >
              {it.value == null ? "…" : it.value.toLocaleString()}
            </div>
            <div style={{ fontSize: "10px", color: "var(--warm-gray)" }}>rows</div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}
