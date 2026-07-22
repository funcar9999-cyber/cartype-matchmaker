import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { PrecisionData } from "@/lib/precision";

export type MatchTop3Car = {
  car_id: string;
  name: string;
  brand: string;
  price_range: string;
  chips?: string[];
  is_import?: boolean;
};

export type MatchTierCar = {
  car_id: string;
  name: string;
  brand?: string;
  price_range: string;
};

export type YachaMatchResponse = {
  top3?: MatchTop3Car[];
  tiers?: {
    stable?: MatchTierCar;
    standard?: MatchTierCar;
    dream?: MatchTierCar;
  };
  fallback?: boolean;
};

export function hasPrecision(p: PrecisionData): boolean {
  return Boolean(
    p.loan_plan || p.annual_km || p.biz_type || p.ins_penalty || p.passengers || p.body_pref,
  );
}

type Result = {
  data: YachaMatchResponse | null;
  loading: boolean;
  errored: boolean;
  refetchWithBudget: (budget: number) => void;
};

export function useYachaMatch(
  typeCode: string,
  precision: PrecisionData,
  enabled: boolean,
  approvalCapacity?: number | null,
): Result {
  const [data, setData] = useState<YachaMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [budgetOverride, setBudgetOverride] = useState<number | undefined>(undefined);

  // Priority: manual slider override > approval capacity > precision C1
  const monthlyBudget =
    budgetOverride ?? approvalCapacity ?? precision.monthly_budget;

  useEffect(() => {
    if (!enabled || !typeCode) return;
    let cancelled = false;
    setLoading(true);
    setErrored(false);
    void (async () => {
      try {
        const { data: res, error } = await supabase.functions.invoke("yacha-match", {
          body: {
            type_code: typeCode,
            situation: {
              swap_cycle: precision.swap_cycle,
              loan_plan: precision.loan_plan,
              annual_km: precision.annual_km,
              biz_type: precision.biz_type,
              ins_penalty: precision.ins_penalty,
            },
            condition: {
              monthly_budget: monthlyBudget,
              passengers: precision.passengers,
              body_pref: precision.body_pref,
            },
          },
        });
        if (cancelled) return;
        if (error) {
          console.warn("[yacha-match] error", error);
          setErrored(true);
          setData(null);
        } else {
          setData((res as YachaMatchResponse) ?? null);
        }
      } catch (e) {
        if (cancelled) return;
        console.warn("[yacha-match] threw", e);
        setErrored(true);
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    typeCode,
    precision.swap_cycle,
    precision.loan_plan,
    precision.annual_km,
    precision.biz_type,
    precision.ins_penalty,
    precision.passengers,
    precision.body_pref,
    monthlyBudget,
  ]);

  return {
    data,
    loading,
    errored,
    refetchWithBudget: (b: number) => setBudgetOverride(b),
  };
}