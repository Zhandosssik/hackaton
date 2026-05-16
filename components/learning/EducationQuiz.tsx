"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { IconCheck, IconX } from "@/components/learning/EducationIcons";
import { PASSING_SCORE_PERCENT, QUESTIONS_PER_QUIZ } from "@/data/education";
import type { EducationQuizAnswers, QuizQuestion } from "@/types/education";

const PAGE_SIZE = 5;

interface EducationQuizProps {
  questions: QuizQuestion[];
  onPassed: () => void;
}

export function EducationQuiz({ questions, onPassed }: EducationQuizProps) {
  const [answers, setAnswers] = useState<EducationQuizAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(questions.length / PAGE_SIZE);
  const pageQuestions = useMemo(
    () => questions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [questions, page],
  );
  const pageOffset = page * PAGE_SIZE;

  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered = answeredCount === questions.length;

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;
  const scorePercent =
    questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;
  const passed = submitted && scorePercent >= PASSING_SCORE_PERCENT;

  const pageAnswered = pageQuestions.filter((q) => answers[q.id] !== undefined).length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    if (scorePercent >= PASSING_SCORE_PERCENT) {
      onPassed();
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setPage(0);
  };

  if (questions.length !== QUESTIONS_PER_QUIZ) {
    return (
      <p className="text-sm text-red-600">
        Ошибка конфигурации: в тесте должно быть {QUESTIONS_PER_QUIZ} вопросов.
      </p>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-brand-purple/20 bg-white p-6 shadow-[0_4px_24px_rgba(124,58,237,0.08)] dark:border-brand-purple/30 dark:bg-zinc-900 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Тест к уроку
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {QUESTIONS_PER_QUIZ} вопросов · для зачёта минимум {PASSING_SCORE_PERCENT}%
          </p>
        </div>
        <motion.div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-brand-purple">
            {answeredCount}/{questions.length}
          </span>
          <span>ответов</span>
        </motion.div>
      </motion.div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-brand-purple transition-all duration-300"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      {!submitted && totalPages > 1 && (
        <div className="mb-6 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                page === i
                  ? "bg-brand-purple text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Вопросы {i * PAGE_SIZE + 1}–{Math.min((i + 1) * PAGE_SIZE, questions.length)}
            </button>
          ))}
        </div>
      )}

      <ol className="space-y-8" start={pageOffset + 1}>
        {pageQuestions.map((question, index) => {
          const globalIndex = pageOffset + index;
          const selected = answers[question.id];
          const isCorrect = selected === question.correctIndex;

          return (
            <li key={question.id}>
              <p className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">
                {globalIndex + 1}. {question.question}
              </p>
              <ul className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  let optionClass =
                    "w-full rounded-xl border px-4 py-3 text-left text-sm transition ";

                  if (!submitted) {
                    optionClass += isSelected
                      ? "border-brand-purple bg-brand-purple/5 text-zinc-900 dark:text-zinc-100"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-brand-purple/40 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300";
                  } else if (optionIndex === question.correctIndex) {
                    optionClass +=
                      "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200";
                  } else if (isSelected) {
                    optionClass +=
                      "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200";
                  } else {
                    optionClass +=
                      "border-zinc-100 bg-zinc-50/50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30";
                  }

                  return (
                    <li key={option}>
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: optionIndex,
                          }))
                        }
                        className={optionClass}
                      >
                        {option}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 flex items-start gap-2 text-sm ${
                    isCorrect
                      ? "text-green-700 dark:text-green-400"
                      : "text-amber-800 dark:text-amber-300"
                  }`}
                >
                  {isCorrect ? (
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <IconX className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{question.explanation}</span>
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>

      {!submitted ? (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {page < totalPages - 1 ? (
            <button
              type="button"
              disabled={pageAnswered < pageQuestions.length}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-brand-purple text-base font-semibold text-white transition hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Далее ({pageAnswered}/{pageQuestions.length} на странице)
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-brand-purple text-base font-semibold text-white shadow-lg shadow-brand-purple/25 transition hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Проверить все ответы ({answeredCount}/{questions.length})
            </button>
          )}
          {page > 0 && (
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              className="flex h-12 items-center justify-center rounded-2xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Назад
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div
            className={`rounded-xl border p-4 ${
              passed
                ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/40"
                : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40"
            }`}
          >
            <p
              className={`font-semibold ${passed ? "text-green-800 dark:text-green-300" : "text-amber-900 dark:text-amber-200"}`}
            >
              Результат: {correctCount} из {questions.length} ({scorePercent}%)
            </p>
            <p
              className={`mt-1 text-sm ${passed ? "text-green-700 dark:text-green-400" : "text-amber-800 dark:text-amber-300"}`}
            >
              {passed
                ? "Урок засчитан! Следующий урок разблокирован."
                : `Нужно набрать минимум ${PASSING_SCORE_PERCENT}% — изучите материал и попробуйте снова.`}
            </p>
          </div>

          {!passed && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              Пройти тест заново
            </button>
          )}
        </div>
      )}
    </section>
  );
}
