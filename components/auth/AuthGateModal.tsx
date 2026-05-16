"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { IconLock } from "@/components/icons";

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthGateModal({
  open,
  onClose,
  title = "Войдите, чтобы продолжить",
  description = "Без регистрации доступен только первый урок. Создайте аккаунт или войдите, чтобы открыть всё обучение и тренировку.",
}: AuthGateModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-zinc-900 dark:shadow-brand-purple/20"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-gate-title"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-purple/20 text-brand-purple"
            >
              <IconLock className="h-7 w-7" />
            </motion.div>
            <h2
              id="auth-gate-title"
              className="text-center text-xl font-bold text-zinc-900 dark:text-white"
            >
              {title}
            </h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400">
              {description}
            </p>
            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/register"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-brand-purple font-semibold text-white transition hover:bg-brand-purple-dark"
              >
                Регистрация
              </Link>
              <Link
                href="/login"
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-semibold text-white transition hover:bg-white/10"
              >
                Войти
              </Link>
            </motion.div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full text-center text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              Позже
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
