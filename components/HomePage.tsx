"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const BENEFITS = [
  {
    title: "Практика",
    description: "Реальные задания, не теория",
    icon: "practice",
  },
  {
    title: "Прогресс",
    description: "Уровни и XP за каждый урок",
    icon: "progress",
  },
  {
    title: "AI-фидбек",
    description: "Мгновенный разбор твоего промпта",
    icon: "feedback",
  },
] as const;

export function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <HeroSection />
      <BenefitsSection />
      <AboutSection />
      <FooterSection />
    </div>
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

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-zinc-50 to-white px-6 pb-24 pt-16 sm:pb-32 sm:pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <FadeIn>
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple text-white shadow-lg shadow-brand-purple/25">
              <BenefitIcon name="logo" className="h-8 w-8" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-brand-purple">
              PromptQuest
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Научись писать промпты
            <br />
            <span className="text-brand-purple">как профессионал</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl">
            Интерактивная игра для освоения AI-промптинга. Уровни, очки,
            реальная практика.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Link
            href="/lesson"
            className="mt-12 inline-flex h-14 min-w-[260px] items-center justify-center rounded-2xl bg-brand-purple px-10 text-lg font-semibold text-white shadow-lg shadow-brand-purple/30 transition hover:bg-brand-purple-dark hover:shadow-xl hover:shadow-brand-purple/35 active:scale-[0.98]"
          >
            Начать бесплатно
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="bg-zinc-50 px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((item, index) => (
          <FadeIn key={item.title} delay={index * 0.1}>
            <article className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition hover:shadow-[0_8px_32px_rgba(124,58,237,0.12)]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
                <BenefitIcon name={item.icon} className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="text-base leading-relaxed text-zinc-600">
                {item.description}
              </p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <FadeIn>
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-14">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            О проекте
          </h2>
          <p className="text-lg leading-relaxed text-zinc-600 sm:text-xl">
            PromptQuest создан на хакатоне командой [название]. Наша цель —
            сделать обучение промптингу доступным и увлекательным.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50 px-6 py-12">
      <FadeIn>
        <p className="text-center text-sm text-zinc-500">
          Уже есть аккаунт?{" "}
          <Link
            href="#"
            className="font-medium text-brand-purple transition hover:text-brand-purple-dark hover:underline"
          >
            Войти
          </Link>
        </p>
      </FadeIn>
    </footer>
  );
}

function BenefitIcon({
  name,
  className,
}: {
  name: "logo" | "practice" | "progress" | "feedback";
  className?: string;
}) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "logo") {
    return (
      <svg {...props}>
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M5 19l1 3 1-3 3-1-3 1-1-3-3 1z" />
      </svg>
    );
  }

  if (name === "practice") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg {...props}>
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
