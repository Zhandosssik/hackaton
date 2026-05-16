"use client";

import Image from "next/image";
import type { ContentBlock, EducationSection } from "@/types/education";

const CALLOUT_STYLES = {
  important: {
    box: "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/40",
    title: "text-green-800 dark:text-green-300",
    text: "text-green-900/90 dark:text-green-100/90",
    label: "Важно",
  },
  highlight: {
    box: "border-brand-purple/30 bg-brand-purple/5 dark:border-brand-purple/40 dark:bg-brand-purple/10",
    title: "text-brand-purple-dark dark:text-brand-purple-light",
    text: "text-zinc-800 dark:text-zinc-200",
    label: "Ключевая мысль",
  },
  warning: {
    box: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40",
    title: "text-red-800 dark:text-red-300",
    text: "text-red-900/90 dark:text-red-100/90",
    label: "Внимание",
  },
  note: {
    box: "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50",
    title: "text-zinc-700 dark:text-zinc-300",
    text: "text-zinc-600 dark:text-zinc-400",
    label: "Заметка",
  },
} as const;

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === "paragraph") {
    return (
      <p className="mb-3 text-base leading-relaxed text-zinc-700 last:mb-0 dark:text-zinc-300">
        {block.text}
      </p>
    );
  }

  if (block.type === "callout") {
    const style = CALLOUT_STYLES[block.variant];
    return (
      <div className={`my-4 rounded-xl border p-4 ${style.box}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${style.title}`}>
          {block.title ?? style.label}
        </p>
        <p className={`mt-2 text-sm leading-relaxed ${style.text}`}>{block.text}</p>
      </div>
    );
  }

  if (block.type === "table") {
    return (
      <div className="my-5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        {block.caption && (
          <p className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {block.caption}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-800/80">
                {block.headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-zinc-700 dark:text-zinc-300"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="my-5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={block.src}
            alt={block.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
        </div>
        {block.caption && (
          <figcaption className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return null;
}

export function EducationSectionView({
  section,
  index,
}: {
  section: EducationSection;
  index: number;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple/10 text-sm font-bold text-brand-purple dark:bg-brand-purple/20 dark:text-brand-purple-light">
          {index + 1}
        </span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {section.heading}
        </h3>
      </div>
      <div>
        {section.blocks.map((block, blockIndex) => (
          <ContentBlockView key={`${section.heading}-${blockIndex}`} block={block} />
        ))}
      </div>
    </section>
  );
}
