import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { DiagnosisTopBar } from "@/components/diagnosis/DiagnosisTopBar";
import { ProgressBar } from "@/components/diagnosis/ProgressBar";
import { MilestoneBanner } from "@/components/diagnosis/MilestoneBanner";
import { QuestionCard } from "@/components/diagnosis/QuestionCard";
import {
  ANSWERS_STORAGE_KEY,
  QUESTIONS,
  TOTAL_QUESTIONS,
  computeCode,
  type Answer,
} from "@/lib/carbti-questions";

const searchSchema = z.object({
  q: z.number().int().min(1).max(TOTAL_QUESTIONS).catch(1),
});

export const Route = createFileRoute("/diagnosis")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "CarBTI 진단 · 나의 자동차 DNA 찾기" },
      {
        name: "description",
        content: "15개 문항으로 나의 자동차 취향 유형을 1분 만에 진단하세요.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiagnosisPage,
});

function DiagnosisPage() {
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const current = q;
  const question = QUESTIONS[current - 1];

  const [answers, setAnswers] = useState<Answer[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem(ANSWERS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Answer[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [answers]);

  const selectedMaps = useMemo(
    () => answers.find((a) => a.questionId === question.id)?.maps ?? null,
    [answers, question.id],
  );

  const handleSelect = (opt: { maps: string }) => {
    const next: Answer[] = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, dimension: question.dimension, maps: opt.maps },
    ];
    setAnswers(next);

    if (current < TOTAL_QUESTIONS) {
      setTimeout(() => {
        void navigate({ to: "/diagnosis", search: { q: current + 1 } });
      }, 180);
    } else {
      const code = computeCode(next);
      try {
        sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(next));
        sessionStorage.setItem("carbti:diagnosis:code", code);
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        void navigate({ to: "/diagnosis/gate", search: { code } });
      }, 180);
    }
  };

  const handleClose = () => {
    const ok = window.confirm(
      "진행 상황이 사라져요. 정말 나가시겠어요?",
    );
    if (!ok) return;
    try {
      sessionStorage.removeItem(ANSWERS_STORAGE_KEY);
      sessionStorage.removeItem("carbti:diagnosis:code");
    } catch {
      /* ignore */
    }
    void navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <div className="px-4 pt-3">
          <DiagnosisTopBar
            current={current}
            total={TOTAL_QUESTIONS}
            onClose={handleClose}
          />
          <ProgressBar current={current} total={TOTAL_QUESTIONS} />
          <MilestoneBanner current={current} />
        </div>
        <main className="flex-1 px-4">
          <QuestionCard
            key={question.id}
            question={question}
            selectedMaps={selectedMaps}
            onSelect={handleSelect}
          />
        </main>
      </div>
    </div>
  );
}