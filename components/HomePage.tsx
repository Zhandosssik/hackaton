"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { BenefitIcon, IconCheck, IconFlame, IconLogo } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import type { BenefitIconId } from "@/types/icons";

const BENEFITS = [
  {
    title: "Тренировка с AI",
    description:
      "Пишите промпты к реальным заданиям — Mistral мгновенно оценит результат и подскажет, как улучшить.",
    icon: "target" satisfies BenefitIconId,
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  },
  {
    title: "Уровни и XP",
    description:
      "Как в Duolingo: зарабатывайте очки, держите стрик, открывайте новые уроки по мере роста.",
    icon: "zap" satisfies BenefitIconId,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
  },
  {
    title: "Теория + тесты",
    description:
      "10 уроков по промптингу с короткими тестами — от основ LLM до продвинутых техник.",
    icon: "book" satisfies BenefitIconId,
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Попробуйте бесплатно",
    text: "1 урок теории — без регистрации.",
  },
  {
    step: "02",
    title: "Создайте аккаунт",
    text: "Регистрация за минуту — откроется весь курс.",
  },
  {
    step: "03",
    title: "Пишите промпты",
    text: "AI проверяет задание и даёт оценку 0–100.",
  },
  {
    step: "04",
    title: "Растите в уровне",
    text: "XP, сердечки и стрик мотивируют не бросать.",
  },
] as const;

const STATS = [
  { value: "10+", label: "уроков теории" },
  { value: "15", label: "заданий тренировки" },
  { value: "AI", label: "проверка промптов" },
  { value: "0₸", label: "старт без оплаты" },
] as const;

export function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <BackgroundDecor />

      <nav className="relative z-10 border-b border-zinc-200/60 bg-white/50 px-6 py-2 dark:border-white/5 dark:bg-zinc-950/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <a href="#features" className="transition hover:text-brand-purple">Возможности</a>
          <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>·</span>
          <a href="#how" className="transition hover:text-brand-purple">Как это работает</a>
          <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>·</span>
          <a href="#about" className="transition hover:text-brand-purple">О проекте</a>
        </div>
      </nav>

      <HeroSection isAuthenticated={isAuthenticated} />

      {!isAuthenticated && !loading && <GuestBanner />}

      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <CtaSection isAuthenticated={isAuthenticated} />
      <FooterSection />
    </motion.div>
  );
}

function BackgroundDecor() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand-purple/30 blur-[120px]" />
      <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-brand-green/15 blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-600/20 blur-[100px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
    </motion.div>
  );
}

function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative z-10 px-6 pb-20 pt-12 sm:pb-28 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Научись писать{" "}
            <span className="bg-gradient-to-r from-brand-purple-light via-brand-purple to-brand-green bg-clip-text text-transparent">
              промпты как профи
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Интерактивная игра: теория, тренировка с AI-оценкой, XP и стрик.
            {!isAuthenticated && (
              <span className="mt-2 block text-brand-purple-light">
                Первый урок теории — бесплатно. Тренировка откроется после 3 уроков обучения.
              </span>
            )}
          </p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Link
              href="/lesson"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-brand-purple px-8 text-lg font-semibold text-white shadow-xl shadow-brand-purple/35 transition hover:bg-brand-purple-dark active:scale-[0.98]"
            >
              Тренировка →
            </Link>
            <Link
              href="/learning"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/10 active:scale-[0.98]"
            >
              Обучение
            </Link>
            {!isAuthenticated && (
              <Link
                href="/register"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-brand-green/40 bg-brand-green/10 px-8 text-lg font-semibold text-brand-green transition hover:bg-brand-green/20 active:scale-[0.98] sm:ml-0"
              >
                Создать аккаунт
              </Link>
            )}
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.15} className="relative">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto aspect-[4/3] max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-brand-purple/20"
          >
            <Image
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=85"
              alt="Искусственный интеллект и нейросети"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 -left-2 max-w-[200px] rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-xl backdrop-blur sm:-left-8"
          >
            <p className="text-xs font-medium text-brand-green">+87 XP</p>
            <p className="mt-1 text-sm font-semibold text-white">Отличный промпт!</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full rounded-full bg-brand-green"
                initial={{ width: "0%" }}
                animate={{ width: "87%" }}
                transition={{ duration: 1.2, delay: 0.8 }}
              />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-2 top-8 max-w-[180px] rounded-2xl border border-brand-purple/30 bg-brand-purple/20 p-3 backdrop-blur sm:-right-6"
          >
            <IconFlame className="h-6 w-6" />
            <p className="text-sm font-semibold text-white">Стрик 5 дней</p>
          </motion.div>

          <motion.div
            className="absolute -right-4 top-1/2 hidden overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-brand-purple/40 via-indigo-900/80 to-zinc-900 shadow-lg dark:border-white/10 sm:block lg:-right-12"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <div className="relative h-[120px] w-[160px]">
              <Image
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80"
                alt="Работа с кодом и AI"
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

function GuestBanner() {
  return (
    <FadeIn>
      <section className="relative z-10 px-6 pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 sm:flex-row sm:items-center">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="font-semibold text-amber-200">
              Гостевой доступ: 1 урок теории
            </p>
            <p className="mt-1 text-sm text-amber-200/80">
              Зарегистрируйтесь для полного курса. Тренировка — после 3 уроков обучения.
            </p>
          </motion.div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-amber-400/40 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

function StatsSection() {
  return (
    <section className="relative z-10 border-y border-zinc-200 bg-zinc-100/80 px-6 py-12 backdrop-blur-sm dark:border-white/5 dark:bg-zinc-900/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-brand-purple-light sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 px-6 py-24 sm:py-32">
      <FadeIn className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Почему Prompto</h2>
        <p className="mt-4 text-lg text-zinc-400">
          Сочетаем геймификацию, теорию и живую проверку промптов через Mistral AI.
        </p>
      </FadeIn>

      <motion.div
        className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        {BENEFITS.map((item) => (
          <motion.article
            key={item.title}
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -6 }}
            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl transition hover:border-brand-purple/40 hover:shadow-brand-purple/10 dark:border-white/10 dark:bg-zinc-900/80"
          >
            <div className="relative h-40 overflow-hidden">
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"
                whileHover={{ opacity: 0.7 }}
              />
              <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                <BenefitIcon name={item.icon} />
              </span>
            </div>
            <motion.div
              className="p-6"
              initial={false}
              whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.08)" }}
            >
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </motion.div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="how"
      className="relative z-10 bg-gradient-to-b from-zinc-100 to-white px-6 py-24 dark:from-zinc-900/80 dark:to-zinc-950 sm:py-32"
    >
      <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Как это работает</h2>
        <p className="mt-4 text-zinc-400">
          Четыре шага от первого промпта до уверенного пользователя AI.
        </p>
      </FadeIn>

      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <FadeIn key={step.step} delay={index * 0.1}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60"
            >
              <span className="text-4xl font-bold text-brand-purple/40">
                {step.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {step.text}
              </p>
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="relative z-10 px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <FadeIn>
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80"
              alt="Команда за проектом"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <motion.div
              className="absolute inset-0 bg-brand-purple/20 mix-blend-overlay"
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl font-bold sm:text-4xl">О проекте</h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            Prompto делает обучение промптингу доступным и увлекательным —
            как игра, а не скучная лекция.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Текстовые, фото- и видео-промпты в одном курсе",
              "Мгновенный AI-фидбек на каждое задание",
              "Прогресс сохраняется в аккаунте после входа",
            ].map((line) => (
              <motion.li
                key={line}
                className="flex items-start gap-3 text-zinc-300"
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-brand-green">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {line}
              </motion.li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}

function CtaSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative z-10 px-6 pb-24">
      <FadeIn>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-brand-purple/25 bg-gradient-to-br from-brand-purple/15 via-white to-zinc-100 p-10 text-center shadow-lg shadow-brand-purple/10 sm:p-14 dark:border-brand-purple/30 dark:from-brand-purple/20 dark:via-zinc-900 dark:to-zinc-950 dark:shadow-none"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple/20 text-brand-purple dark:bg-brand-purple/30 dark:text-brand-purple-light"
          >
            <IconLogo className="h-8 w-8" />
          </motion.div>
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">
            {isAuthenticated
              ? "Продолжайте обучение"
              : "Готовы открыть весь курс?"}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-600 dark:text-zinc-400">
            {isAuthenticated
              ? "Все уроки и задания тренировки доступны в вашем аккаунте."
              : "Зарегистрируйтесь сейчас — это бесплатно и займёт меньше минуты."}
          </p>
          <motion.div
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/lesson"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-purple px-8 font-semibold text-white transition hover:bg-brand-purple-dark"
            >
              К тренировке
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-green px-8 font-semibold text-zinc-900 transition hover:brightness-110"
                >
                  Регистрация
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 px-8 font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                >
                  Войти
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </FadeIn>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="relative z-10 border-t border-zinc-200 px-6 py-10 dark:border-white/5">
      <p className="text-center text-sm text-zinc-500">
        Prompto ·{" "}
        <Link href="/login" className="text-brand-purple-light hover:underline">
          Войти
        </Link>
        {" · "}
        <Link
          href="/register"
          className="text-brand-purple-light hover:underline"
        >
          Регистрация
        </Link>
      </p>
    </footer>
  );
}

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
