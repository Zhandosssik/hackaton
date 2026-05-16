"use client";

import Image from "next/image";
import { useState } from "react";
import { IconPlay } from "@/components/learning/EducationIcons";
import type { LessonVideo } from "@/types/education";

interface EducationVideoProps {
  video: LessonVideo;
}

export function EducationVideo({ video }: EducationVideoProps) {
  const [playing, setPlaying] = useState(false);

  if (playing && video.embedUrl) {
    return (
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-black shadow-lg dark:border-zinc-700">
        <div className="relative aspect-video w-full">
          <iframe
            src={video.embedUrl}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-lg dark:border-zinc-700">
      <div className="relative aspect-video w-full">
        <Image
          src={video.posterSrc}
          alt=""
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 1024px) 100vw, 70vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-zinc-950/20" />

        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-purple shadow-xl transition hover:scale-105 hover:bg-white"
          aria-label={`Воспроизвести: ${video.title}`}
        >
          <IconPlay className="ml-1 h-8 w-8" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-purple-light">
            Видео к уроку · {video.durationLabel}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white sm:text-xl">
            {video.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300">{video.description}</p>
          {!video.embedUrl && (
            <p className="mt-3 inline-flex rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-zinc-200">
              Демо-режим: нажмите Play для имитации просмотра
            </p>
          )}
        </div>
      </div>

      {playing && !video.embedUrl && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-5 py-8 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/20">
            <IconPlay className="h-7 w-7 text-brand-purple-light" />
          </div>
          <p className="font-medium text-white">Видео будет добавлено позже</p>
          <p className="mt-2 text-sm text-zinc-400">
            Пока изучайте текстовые разделы и сдайте тест в конце урока.
          </p>
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="mt-4 text-sm font-medium text-brand-purple-light hover:underline"
          >
            Закрыть
          </button>
        </div>
      )}
    </section>
  );
}
