"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAnswer, completeSession } from "@/lib/questionnaire-actions";

type Question = {
  id: string;
  text: string;
  allowNotObserved: boolean;
};

type Dimension = {
  id: string;
  name: string;
  description: string | null;
  questions: Question[];
};

type ExistingAnswer = {
  questionId: string;
  value: number | null;
  notObserved: boolean;
};

const AGREEMENT_LABELS = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente",
];

const FREQUENCY_LABELS = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];

export function QuestionnaireForm({
  sessionId,
  scaleType,
  dimensions,
  existingAnswers,
  redirectTo,
  completedAlready,
}: {
  sessionId: string;
  scaleType: "AGREEMENT_5" | "FREQUENCY_5";
  dimensions: Dimension[];
  existingAnswers: ExistingAnswer[];
  redirectTo: string;
  completedAlready: boolean;
}) {
  const labels = scaleType === "AGREEMENT_5" ? AGREEMENT_LABELS : FREQUENCY_LABELS;

  const initial = useMemo(() => {
    const map = new Map<string, { value: number | null; notObserved: boolean }>();
    for (const a of existingAnswers) {
      map.set(a.questionId, { value: a.value, notObserved: a.notObserved });
    }
    return map;
  }, [existingAnswers]);

  const [answers, setAnswers] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const allQuestions = dimensions.flatMap((d) => d.questions);
  const answeredCount = allQuestions.filter((q) => {
    const a = answers.get(q.id);
    return a && (a.notObserved || a.value != null);
  }).length;
  const totalCount = allQuestions.length;
  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  function handleAnswer(questionId: string, value: number | null, notObserved: boolean) {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, { value, notObserved });
      return next;
    });
    startTransition(async () => {
      await saveAnswer(sessionId, questionId, value, notObserved);
    });
  }

  function handleComplete() {
    setError(null);
    startTransition(async () => {
      try {
        await completeSession(sessionId);
        router.push(redirectTo);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível concluir a avaliação.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-white/90 p-4 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {answeredCount} de {totalCount} respondidas
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-mindora-secondary to-mindora-violet transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {completedAlready && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Esta avaliação já foi concluída. Suas respostas ficam registradas apenas para
          referência.
        </p>
      )}

      {dimensions.map((dimension) => (
        <section key={dimension.id} className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{dimension.name}</h2>
            {dimension.description && (
              <p className="text-sm text-slate-500">{dimension.description}</p>
            )}
          </div>

          <div className="space-y-3">
            {dimension.questions.map((question) => {
              const current = answers.get(question.id);
              return (
                <div
                  key={question.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm text-slate-800">{question.text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {labels.map((label, idx) => {
                      const value = idx + 1;
                      const isSelected = current?.value === value && !current?.notObserved;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={completedAlready}
                          onClick={() => handleAnswer(question.id, value, false)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? "border-mindora-secondary bg-mindora-secondary text-white"
                              : "border-slate-300 text-slate-600 hover:border-slate-400"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {label}
                        </button>
                      );
                    })}
                    {question.allowNotObserved && (
                      <button
                        type="button"
                        disabled={completedAlready}
                        onClick={() => handleAnswer(question.id, null, true)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          current?.notObserved
                            ? "border-mindora-secondary bg-mindora-secondary text-white"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        Não observei
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {!completedAlready && (
        <div className="flex items-center justify-end gap-3 pb-12">
          <span className="text-xs text-slate-400">
            Suas respostas são salvas automaticamente a cada clique.
          </span>
          <button
            type="button"
            disabled={isPending || answeredCount < totalCount}
            onClick={handleComplete}
            className="rounded-lg mindora-btn-primary px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Concluir avaliação
          </button>
        </div>
      )}
    </div>
  );
}
