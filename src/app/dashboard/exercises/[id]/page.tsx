"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle,
  FilePdf, Flame, Trophy, Star, Timer, ListChecks,
  CaretLeft, CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type AnswerState = "unanswered" | "correct" | "wrong";

interface Question {
  id: number;
  sentence: string;
  blank: string;
  answer: string;
  options: string[];
  state: AnswerState;
  typed: string;
}

const MOCK_PAGES = [
  {
    id: 1,
    title: "Unit 3 — Daily Routines",
    questions: [
      { id: 1, sentence: "She ___ to work by train every day.", blank: "___", answer: "goes", options: ["go", "goes", "went", "going"], state: "unanswered" as AnswerState, typed: "" },
      { id: 2, sentence: "They ___ English on Monday mornings.", blank: "___", answer: "study", options: ["studies", "study", "studied", "studying"], state: "unanswered" as AnswerState, typed: "" },
      { id: 3, sentence: "I usually ___ breakfast at 7 a.m.", blank: "___", answer: "have", options: ["has", "have", "had", "having"], state: "unanswered" as AnswerState, typed: "" },
    ],
  },
  {
    id: 2,
    title: "Unit 3 — Present Simple",
    questions: [
      { id: 4, sentence: "He ___ at a technology company.", blank: "___", answer: "works", options: ["work", "works", "worked", "working"], state: "unanswered" as AnswerState, typed: "" },
      { id: 5, sentence: "We ___ to the gym on Saturdays.", blank: "___", answer: "go", options: ["go", "goes", "went", "going"], state: "unanswered" as AnswerState, typed: "" },
    ],
  },
  {
    id: 3,
    title: "Unit 3 — Vocabulary",
    questions: [
      { id: 6, sentence: "The opposite of 'early' is ___.", blank: "___", answer: "late", options: ["early", "late", "soon", "never"], state: "unanswered" as AnswerState, typed: "" },
      { id: 7, sentence: "She ___ her keys every morning!", blank: "___", answer: "loses", options: ["lose", "loses", "lost", "losing"], state: "unanswered" as AnswerState, typed: "" },
    ],
  },
];

function XpToast({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.24)] animate-fadeUp">
      <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
        <CheckCircle size={16} weight="fill" />
      </span>
      <div>
        <p className="text-sm font-bold">+{xp} XP</p>
        <p className="text-xs text-slate-400">Resposta correta!</p>
      </div>
    </div>
  );
}

export default function ExercisePlayerPage() {
  const [pages, setPages] = useState(MOCK_PAGES.map((p) => ({ ...p, questions: p.questions.map((q) => ({ ...q })) })));
  const [currentPage, setCurrentPage] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [toastXp, setToastXp] = useState<number | null>(null);
  const [panelView, setPanelView] = useState<"questions" | "progress">("questions");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const page = pages[currentPage];
  const allQuestions = pages.flatMap((p) => p.questions);
  const answeredCount = allQuestions.filter((q) => q.state !== "unanswered").length;
  const correctCount = allQuestions.filter((q) => q.state === "correct").length;
  const totalCount = allQuestions.length;
  const completionPct = Math.round((answeredCount / totalCount) * 100);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  function handleAnswer(qId: number, answer: string) {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        questions: p.questions.map((q) => {
          if (q.id !== qId || q.state !== "unanswered") return q;
          const correct = answer.trim().toLowerCase() === q.answer.toLowerCase();
          if (correct) {
            const gain = 15;
            setXp((x) => x + gain);
            setStreak((s) => s + 1);
            setToastXp(gain);
          } else {
            setStreak(0);
          }
          return { ...q, typed: answer, state: correct ? "correct" : "wrong" };
        }),
      }))
    );
  }

  function handleMultiple(qId: number, option: string) {
    handleAnswer(qId, option);
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ── Topbar ── */}
      <header className="h-[56px] bg-white border-b border-slate-200 flex items-center gap-3 px-4 shrink-0 z-20">
        <Link href="/dashboard/exercises" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={15} /> Voltar
        </Link>
        <span className="text-slate-200">|</span>
        <div className="flex items-center gap-1.5">
          <FilePdf size={15} weight="bold" className="text-brand" />
          <span className="text-sm font-semibold text-slate-700">Interchange — Unit 3</span>
        </div>

        {/* progress bar */}
        <div className="flex-1 max-w-xs mx-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>{answeredCount}/{totalCount} questões</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 font-mono tabular-nums">
            <Timer size={14} /> {minutes}:{seconds}
          </div>
          {/* Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
            <Flame size={13} weight="fill" className="text-amber-500" />
            <span className="text-xs font-bold text-amber-600 tabular-nums">{streak}</span>
          </div>
          {/* XP */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-light border border-[#c7d2fe]">
            <Star size={13} weight="fill" className="text-brand" />
            <span className="text-xs font-bold text-brand tabular-nums">{xp} XP</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Page thumbnails (left strip) ── */}
        <nav className="hidden md:flex w-[68px] shrink-0 flex-col items-center gap-2 py-3 bg-white border-r border-slate-200 overflow-y-auto">
          {pages.map((p, i) => {
            const done = p.questions.every((q) => q.state !== "unanswered");
            const partial = p.questions.some((q) => q.state !== "unanswered") && !done;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentPage(i)}
                className={cn(
                  "w-[44px] h-[58px] rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all text-[10px] font-bold",
                  i === currentPage
                    ? "border-brand bg-brand-light text-brand"
                    : done
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : partial
                    ? "border-amber-300 bg-amber-50 text-amber-600"
                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                )}
              >
                <FilePdf size={14} weight={i === currentPage ? "fill" : "regular"} />
                <span>{i + 1}</span>
              </button>
            );
          })}
        </nav>

        {/* ── PDF content area ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 animate-fadeUp">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Página {currentPage + 1} de {pages.length}
              </p>
              <h2 className="text-xl font-bold text-slate-900">{page.title}</h2>
            </div>

            {/* Faux PDF block */}
            <div className="mb-6 h-32 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <div className="flex items-center gap-2 text-slate-300">
                <FilePdf size={28} />
                <span className="text-sm font-mono">interchange-unit3.pdf</span>
              </div>
            </div>

            {/* Questions */}
            <div className="flex flex-col gap-4">
              {page.questions.map((q) => (
                <QuestionCard key={q.id} question={q} onAnswer={handleMultiple} />
              ))}
            </div>

            {/* Page navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="ui-btn ui-btn-outline ui-btn-md gap-1.5 disabled:opacity-40"
              >
                <CaretLeft size={14} /> Anterior
              </button>
              <span className="text-sm text-slate-400 tabular-nums">{currentPage + 1} / {pages.length}</span>
              {currentPage < pages.length - 1 ? (
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
                >
                  Próxima <CaretRight size={14} />
                </button>
              ) : (
                <Link
                  href="/dashboard/exercises"
                  className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
                >
                  Concluir <CheckCircle size={14} weight="fill" />
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* ── Right exercise panel ── */}
        <aside className="hidden lg:flex w-[300px] shrink-0 bg-white border-l border-slate-200 flex-col">
          {/* Panel tabs */}
          <div className="flex border-b border-slate-200 px-1 pt-1 shrink-0">
            {(["questions", "progress"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPanelView(v)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors",
                  panelView === v
                    ? "border-brand text-brand"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {v === "questions" ? <ListChecks size={13} /> : <Trophy size={13} />}
                {v === "questions" ? "Questões" : "Progresso"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {panelView === "questions" ? (
              <div className="flex flex-col gap-2">
                {allQuestions.map((q, i) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      const pageIdx = pages.findIndex((p) => p.questions.some((pq) => pq.id === q.id));
                      if (pageIdx >= 0) setCurrentPage(pageIdx);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all text-xs",
                      q.state === "correct"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : q.state === "wrong"
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                      q.state === "correct" ? "bg-emerald-500 text-white"
                        : q.state === "wrong" ? "bg-red-400 text-white"
                        : "bg-slate-200 text-slate-500"
                    )}>
                      {q.state === "correct" ? <CheckCircle size={11} weight="fill" /> : q.state === "wrong" ? <XCircle size={11} weight="fill" /> : i + 1}
                    </span>
                    <span className="flex-1 truncate">{q.sentence}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* XP */}
                <div className="p-4 bg-brand-light rounded-xl border border-[#c7d2fe] text-center">
                  <p className="text-3xl font-bold text-brand tabular-nums">{xp}</p>
                  <p className="text-xs text-indigo-500 mt-0.5">XP neste exercício</p>
                  <div className="mt-3 h-2 rounded-full bg-white/60 overflow-hidden">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, (xp / 150) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-indigo-400 mt-1">{xp} / 150 XP para nível seguinte</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Corretas", value: correctCount, color: "text-emerald-600" },
                    { label: "Erradas", value: answeredCount - correctCount, color: "text-red-500" },
                    { label: "Restantes", value: totalCount - answeredCount, color: "text-slate-500" },
                  ].map((s) => (
                    <div key={s.label} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className={cn("text-lg font-bold tabular-nums", s.color)}>{s.value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Streak */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Flame size={18} weight="fill" className="text-amber-500" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-700 tabular-nums">{streak} seguidas</p>
                    <p className="text-[11px] text-amber-500">Mantenha a sequência!</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Timer size={18} weight="bold" className="text-slate-500" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-700 tabular-nums font-mono">{minutes}:{seconds}</p>
                    <p className="text-[11px] text-slate-400">Tempo decorrido</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* XP toast */}
      {toastXp !== null && <XpToast xp={toastXp} onDone={() => setToastXp(null)} />}
    </div>
  );
}

interface QProps {
  question: Question;
  onAnswer: (id: number, option: string) => void;
}

function QuestionCard({ question: q, onAnswer }: QProps) {
  const [typed, setTyped] = useState("");
  const answered = q.state !== "unanswered";

  return (
    <div className={cn(
      "rounded-xl border-2 p-4 transition-all",
      q.state === "correct" ? "border-emerald-300 bg-emerald-50"
        : q.state === "wrong" ? "border-red-300 bg-red-50"
        : "border-slate-200 bg-white"
    )}>
      <p className="text-sm text-slate-700 mb-3 leading-relaxed">
        {q.sentence.replace(q.blank, " ________ ")}
      </p>

      {/* Multiple choice */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {q.options.map((opt) => {
          const isSelected = answered && q.typed === opt;
          const isCorrect = answered && opt === q.answer;
          return (
            <button
              key={opt}
              disabled={answered}
              onClick={() => onAnswer(q.id, opt)}
              className={cn(
                "px-3 py-2 rounded-lg border-2 text-sm font-medium text-left transition-all",
                isCorrect
                  ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                  : isSelected && q.state === "wrong"
                  ? "border-red-400 bg-red-100 text-red-800"
                  : answered
                  ? "border-slate-100 bg-slate-50 text-slate-400 cursor-default"
                  : "border-slate-200 bg-white hover:border-brand hover:bg-brand-light text-slate-700"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {q.state !== "unanswered" && (
        <div className={cn(
          "flex items-center gap-2 text-xs font-semibold mt-2",
          q.state === "correct" ? "text-emerald-600" : "text-red-600"
        )}>
          {q.state === "correct"
            ? <><CheckCircle size={14} weight="fill" /> Correto! +15 XP</>
            : <><XCircle size={14} weight="fill" /> Resposta: <strong>{q.answer}</strong></>}
        </div>
      )}
    </div>
  );
}
