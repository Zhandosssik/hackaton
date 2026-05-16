const TASK =
  "Write a prompt that asks an AI to explain photosynthesis to a 12-year-old using a simple analogy and no jargon.";

export default function LessonPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-8">
      <header>
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-brand-purple">
          Урок 1
        </p>
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Задание
        </h1>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-6">
        <p className="text-base leading-relaxed text-zinc-600 sm:text-lg">
          {TASK}
        </p>
      </section>

      <section className="flex flex-1 flex-col gap-3">
        <label htmlFor="prompt" className="text-sm font-medium text-zinc-500">
          Ваш промпт
        </label>
        <textarea
          id="prompt"
          name="prompt"
          placeholder="Напишите промпт здесь..."
          rows={12}
          className="min-h-[240px] resize-none rounded-2xl border border-zinc-200 bg-white p-4 text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition focus:border-brand-purple/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 sm:min-h-[320px] sm:p-5"
        />
      </section>

      <button
        type="button"
        className="mb-4 flex h-14 w-full items-center justify-center rounded-2xl bg-brand-purple text-lg font-semibold text-white shadow-lg shadow-brand-purple/30 transition hover:bg-brand-purple-dark active:scale-[0.98]"
      >
        Submit
      </button>
    </main>
  );
}
